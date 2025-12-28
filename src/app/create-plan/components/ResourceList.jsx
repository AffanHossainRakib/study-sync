import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BookOpen, Trash2, X } from "lucide-react";
import ResourceListItem from "./ResourceListItem";

export default function ResourceList({ resources, onReorder, onRemove }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = resources.findIndex(
        (r) => (r._id || `temp-${resources.indexOf(r)}`) === active.id
      );
      const newIndex = resources.findIndex(
        (r) => (r._id || `temp-${resources.indexOf(r)}`) === over.id
      );
      onReorder(arrayMove(resources, oldIndex, newIndex));
    }
  };

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    const remaining = resources.filter(
      (r) => !selectedIds.has(r._id || `temp-${resources.indexOf(r)}`)
    );
    onReorder(remaining);
    setSelectedIds(new Set());
    setIsSelecting(false);
  };

  const handleCancelSelect = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  };

  const getTotalTime = () => {
    return resources.reduce((total, resource) => {
      if (resource.type === "youtube-video")
        return total + (resource.metadata?.duration || 0);
      if (resource.type === "pdf")
        return (
          total +
          (resource.metadata?.pages || 0) *
            (resource.metadata?.minsPerPage || 3)
        );
      if (resource.type === "article" || resource.type === "google-drive" || resource.type === "custom-link")
        return total + (resource.metadata?.estimatedMins || 0);
      return total;
    }, 0);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (resources.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No resources yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Start by adding a YouTube playlist or other learning resources!
        </p>
      </div>
    );
  }

  const totalTime = getTotalTime();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Added Resources ({resources.length})
          </h3>
          {totalTime > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Total time: {formatTime(totalTime)}
            </p>
          )}
        </div>

        {!isSelecting ? (
          <button
            type="button"
            onClick={() => setIsSelecting(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Select
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-3 w-3" />
              Delete ({selectedIds.size})
            </button>
            <button
              type="button"
              onClick={handleCancelSelect}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={resources.map((r, i) => r._id || `temp-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <ResourceListItem
                key={resource._id || `temp-${index}`}
                resource={resource}
                index={index}
                onRemove={() => onRemove(index)}
                isSelecting={isSelecting}
                isSelected={selectedIds.has(resource._id || `temp-${index}`)}
                onToggleSelect={() =>
                  handleToggleSelect(resource._id || `temp-${index}`)
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
