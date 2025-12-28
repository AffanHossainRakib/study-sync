import { Plus, Loader2 } from "lucide-react";

const RESOURCE_TYPES = [
  {
    value: "youtube-playlist",
    label: "YouTube Playlist",
    placeholder: "https://www.youtube.com/playlist?list=...",
  },
  {
    value: "youtube-video",
    label: "YouTube Video",
    placeholder: "https://www.youtube.com/watch?v=...",
  },
  {
    value: "article",
    label: "Article/Blog Post",
    placeholder: "https://example.com/article",
  },
  {
    value: "google-drive",
    label: "Google Drive Link",
    placeholder: "https://drive.google.com/...",
  },
  {
    value: "pdf",
    label: "PDF Document",
    placeholder: "https://example.com/document.pdf",
  },
  {
    value: "custom-link",
    label: "Custom Link",
    placeholder: "https://example.com/resource",
  },
];

export default function AddResourceForm({
  resourceForm,
  onChange,
  onAdd,
  isAdding,
}) {
  const selectedType = RESOURCE_TYPES.find(
    (t) => t.value === resourceForm.type
  );
  const needsTitle = ["pdf", "article", "google-drive", "custom-link"].includes(
    resourceForm.type
  );
  const needsMetadata =
    resourceForm.type === "pdf" || resourceForm.type === "article";
  const needsEstimatedMins =
    resourceForm.type === "google-drive" || resourceForm.type === "custom-link";

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Add Resources
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Resource Type
          </label>
          <select
            name="type"
            value={resourceForm.type}
            onChange={onChange}
            className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {RESOURCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            URL *
          </label>
          <input
            type="url"
            name="url"
            value={resourceForm.url}
            onChange={onChange}
            placeholder={selectedType?.placeholder}
            className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>

        {needsTitle && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title {resourceForm.type === "custom-link" ? "*" : ""}
            </label>
            <input
              type="text"
              name="title"
              value={resourceForm.title}
              onChange={onChange}
              placeholder="Resource title"
              required={resourceForm.type === "custom-link"}
              className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        )}

        {needsMetadata && (
          <>
            {resourceForm.type === "pdf" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Number of Pages
                  </label>
                  <input
                    type="number"
                    name="pages"
                    value={resourceForm.pages}
                    onChange={onChange}
                    placeholder="50"
                    min="1"
                    className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Minutes per Page
                  </label>
                  <input
                    type="number"
                    name="minsPerPage"
                    value={resourceForm.minsPerPage}
                    onChange={onChange}
                    placeholder="3"
                    min="1"
                    className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estimated Reading Time (minutes)
                </label>
                <input
                  type="number"
                  name="estimatedMins"
                  value={resourceForm.estimatedMins}
                  onChange={onChange}
                  placeholder="15"
                  min="1"
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            )}
          </>
        )}

        {needsEstimatedMins && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              name="estimatedMins"
              value={resourceForm.estimatedMins}
              onChange={onChange}
              placeholder="15"
              min="1"
              className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        )}

        <button
          type="button"
          onClick={onAdd}
          disabled={isAdding || !resourceForm.url}
          className="w-full inline-flex items-center justify-center rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </>
          )}
        </button>
      </div>
    </div>
  );
}
