'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Youtube, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import { createStudyPlan, updateStudyPlan, createOrGetResource } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateStudyPlanPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    courseCode: '',
    isPublic: false
  });

  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({
    type: 'youtube-video',
    url: '',
    title: '',
    pages: '',
    minsPerPage: '3',
    estimatedMins: ''
  });

  const [loading, setLoading] = useState(false);
  const [addingResource, setAddingResource] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleResourceFormChange = (e) => {
    const { name, value } = e.target;
    setResourceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddResource = async () => {
    if (!resourceForm.url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setAddingResource(true);

      let resourceData = {
        type: resourceForm.type,
        url: resourceForm.url
      };

      // Add type-specific fields
      if (resourceForm.type === 'pdf') {
        if (!resourceForm.title || !resourceForm.pages) {
          toast.error('Please fill in all PDF fields');
          return;
        }
        resourceData = {
          ...resourceData,
          title: resourceForm.title,
          pages: parseInt(resourceForm.pages),
          minsPerPage: parseInt(resourceForm.minsPerPage)
        };
      } else if (resourceForm.type === 'article') {
        if (!resourceForm.title || !resourceForm.estimatedMins) {
          toast.error('Please fill in all article fields');
          return;
        }
        resourceData = {
          ...resourceData,
          title: resourceForm.title,
          estimatedMins: parseInt(resourceForm.estimatedMins)
        };
      }

      const result = await createOrGetResource(resourceData, token);

      if (resourceForm.type === 'youtube-playlist' && result.resources) {
        // Add all videos from playlist
        setResources(prev => [...prev, ...result.resources]);
        toast.success(`Added ${result.resources.length} videos from playlist`);
      } else if (result.resource) {
        // Add single resource
        setResources(prev => [...prev, result.resource]);
        toast.success(result.isNew ? 'Resource added' : 'Existing resource added');
      }

      // Reset form
      setResourceForm({
        type: 'youtube-video',
        url: '',
        title: '',
        pages: '',
        minsPerPage: '3',
        estimatedMins: ''
      });
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error(error.message || 'Failed to add resource');
    } finally {
      setAddingResource(false);
    }
  };

  const handleRemoveResource = (index) => {
    setResources(prev => prev.filter((_, i) => i !== index));
    toast.success('Resource removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.shortDescription || !formData.courseCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Create study plan
      const planData = {
        ...formData,
        resourceIds: []
      };

      const planResult = await createStudyPlan(planData, token);
      const planId = planResult.studyPlan._id;

      // Add resources to the plan if any
      if (resources.length > 0) {
        const resourceIds = resources.map(r => r._id);
        await updateStudyPlan(planId, { resourceIds }, token);
      }

      toast.success('Study plan created successfully!');
      router.push(`/plans/${planId}`);
    } catch (error) {
      console.error('Error creating study plan:', error);
      toast.error('Failed to create study plan');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/my-plans"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Plans
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Create Study Plan</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., CS50 Midterm Preparation"
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-foreground mb-2">
                Course Code *
              </label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                placeholder="e.g., CSE110, EEE220, ECO101"
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-foreground mb-2">
                Short Description *
              </label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
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
              <label htmlFor="fullDescription" className="block text-sm font-medium text-foreground mb-2">
                Full Description (Optional)
              </label>
              <textarea
                id="fullDescription"
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="isPublic" className="text-sm text-foreground">
                Make this plan public (others can view and clone it)
              </label>
            </div>
          </div>

          {/* Add Resources */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Add Resources</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resource Type
                </label>
                <select
                  name="type"
                  value={resourceForm.type}
                  onChange={handleResourceFormChange}
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="youtube-video">YouTube Video</option>
                  <option value="youtube-playlist">YouTube Playlist</option>
                  <option value="pdf">PDF Document</option>
                  <option value="article">Article/Blog Post</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL
                </label>
                <input
                  type="url"
                  name="url"
                  value={resourceForm.url}
                  onChange={handleResourceFormChange}
                  placeholder={
                    resourceForm.type.includes('youtube')
                      ? 'https://www.youtube.com/watch?v=...'
                      : 'https://example.com/resource'
                  }
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              {(resourceForm.type === 'pdf' || resourceForm.type === 'article') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={resourceForm.title}
                      onChange={handleResourceFormChange}
                      placeholder="Resource title"
                      className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>

                  {resourceForm.type === 'pdf' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Number of Pages
                        </label>
                        <input
                          type="number"
                          name="pages"
                          value={resourceForm.pages}
                          onChange={handleResourceFormChange}
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
                          onChange={handleResourceFormChange}
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
                        onChange={handleResourceFormChange}
                        placeholder="15"
                        min="1"
                        className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={handleAddResource}
                disabled={addingResource || !resourceForm.url}
                className="w-full inline-flex items-center justify-center rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingResource ? (
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

            {/* Resources List */}
            {resources.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Added Resources ({resources.length})
                </h3>
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className={`flex-shrink-0 p-2 rounded-md ${resource.type === 'youtube-video' ? 'bg-red-100 dark:bg-red-900/20' :
                        resource.type === 'pdf' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-green-100 dark:bg-green-900/20'
                      }`}>
                      {resource.type === 'youtube-video' ? (
                        <Youtube className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : resource.type === 'pdf' ? (
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <LinkIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {resource.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {resource.type === 'youtube-video' && `${resource.metadata?.duration || 0} mins`}
                        {resource.type === 'pdf' && `${resource.metadata?.pages || 0} pages`}
                        {resource.type === 'article' && `${resource.metadata?.estimatedMins || 0} mins`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveResource(index)}
                      className="flex-shrink-0 text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Study Plan'
              )}
            </button>
            <Link
              href="/my-plans"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
