import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Youtube,
  FileText,
  Link as LinkIcon,
  FolderOpen,
  ExternalLink,
} from "lucide-react";

const RESOURCE_ICONS = {
  "youtube-video": {
    icon: Youtube,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/20",
  },
  "youtube-playlist": {
    icon: Youtube,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/20",
  },
  pdf: {
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/20",
  },
  article: {
    icon: LinkIcon,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/20",
  },
  "google-drive": {
    icon: FolderOpen,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  "custom-link": {
    icon: ExternalLink,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/20",
  },
};

export default function ResourceListItem({
  resource,
  index,
  onRemove,
  isSelecting,
  isSelected,
  onToggleSelect,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resource._id || `temp-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const iconConfig =
    RESOURCE_ICONS[resource.type] || RESOURCE_ICONS["custom-link"];
  const Icon = iconConfig.icon;

  const getResourceInfo = () => {
    if (resource.type === "youtube-video")
      return `${resource.metadata?.duration || 0} mins`;
    if (resource.type === "pdf")
      return `${resource.metadata?.pages || 0} pages`;
    if (resource.type === "article")
      return `${resource.metadata?.estimatedMins || 0} mins`;
    if (resource.type === "google-drive") return "Google Drive";
    if (resource.type === "custom-link") return "Custom Link";
    return "";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-all ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {/* Checkbox for select mode */}
      {isSelecting && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary flex-shrink-0"
        />
      )}

      {/* Order number */}
      <div className="flex-shrink-0 w-6 text-center">
        <span className="text-xs font-medium text-muted-foreground">
          {index + 1}
        </span>
      </div>

      {/* Drag handle */}
      <button
        type="button"
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Icon */}
      <div className={`flex-shrink-0 p-2 rounded-md ${iconConfig.bg}`}>
        <Icon className={`h-4 w-4 ${iconConfig.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {resource.title}
        </p>
        <p className="text-xs text-muted-foreground">{getResourceInfo()}</p>
      </div>

      {/* Delete button */}
      {!isSelecting && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 text-destructive hover:text-destructive/80 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
