export default function BasicInfoForm({ formData, onChange }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Basic Information
      </h2>

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="e.g., CS50 Midterm Preparation"
          required
          className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="courseCode"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Course Code *
        </label>
        <input
          type="text"
          id="courseCode"
          name="courseCode"
          value={formData.courseCode}
          onChange={onChange}
          placeholder="e.g., CSE110, EEE220, ECO101"
          required
          className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="shortDescription"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Short Description *
        </label>
        <input
          type="text"
          id="shortDescription"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={onChange}
          placeholder="Brief description (1-2 lines)"
          required
          maxLength={150}
          className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.shortDescription.length}/150 characters
        </p>
      </div>

      <div>
        <label
          htmlFor="fullDescription"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Full Description (Optional)
        </label>
        <textarea
          id="fullDescription"
          name="fullDescription"
          value={formData.fullDescription}
          onChange={onChange}
          placeholder="Detailed description of what this study plan covers..."
          rows={4}
          className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={onChange}
          className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="isPublic" className="text-sm text-foreground">
          Make this plan public (others can view and clone it)
        </label>
      </div>
    </div>
  );
}
