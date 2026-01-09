// src/components/InstanceEditor.jsx
"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  updateInstance,
  createOrGetResource,
  getResourceTypeInfo,
  formatTime,
} from "@/lib/api";
import { X, Plus, Edit, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

const InstanceEditor = ({ instance, token, onUpdate }) => {
  const [resources, setResources] = useState(instance.resources || []);
  const [customTitles, setCustomTitles] = useState(instance.customTitles || {});

  const handleTitleChange = (id, title) => {
    setCustomTitles((prev) => ({ ...prev, [id]: title }));
  };

  const handleDelete = (id) => {
    setResources((prev) => prev.filter((r) => r._id !== id));
    const newTitles = { ...customTitles };
    delete newTitles[id];
    setCustomTitles(newTitles);
  };

  const handleAddResource = async () => {
    const url = window.prompt("Enter resource URL (YouTube video, PDF, etc.)");
    if (!url) return;
    try {
      const data = await createOrGetResource({ url }, token);
      // API returns { resource: {...}, isNew: boolean }
      const newRes = data.resource;
      setResources((prev) => [...prev, newRes]);
      toast.success("Resource added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add resource");
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(resources);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setResources(reordered);
  };

  const handleSave = async () => {
    const payload = {
      resourceIds: resources.map((r) => r._id),
      customTitles,
    };
    try {
      const updated = await updateInstance(instance._id, payload, token);
      toast.success("Instance saved");
      onUpdate(updated);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save instance");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Resources</h3>
        <div className="flex gap-2">
          <button
            onClick={handleAddResource}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Resource
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="resources">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {resources.map((res, index) => (
                <Draggable key={res._id} draggableId={res._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm ${
                        snapshot.isDragging ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={customTitles[res._id] ?? res.title}
                          onChange={(e) =>
                            handleTitleChange(res._id, e.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none text-sm"
                        />
                        <div className="text-xs text-slate-500">
                          {getResourceTypeInfo(res.type).label} •{" "}
                          {formatTime(
                            res.type === "youtube-video"
                              ? res.metadata?.duration
                              : res.type === "pdf"
                              ? (res.metadata?.pages || 0) *
                                (res.metadata?.minsPerPage || 0)
                              : res.metadata?.estimatedMins || 0
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(res._id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default InstanceEditor;
