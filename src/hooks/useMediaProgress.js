"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing media playback progress in localStorage
 * Stores progress for YouTube videos, Google Drive videos, PDFs, and articles
 * 
 * @param {string} instanceId - The instance ID
 * @param {string} resourceId - The resource ID
 * @returns {object} Progress state and methods
 */
export default function useMediaProgress(instanceId, resourceId) {
    const storageKey = `media_progress_${instanceId}_${resourceId}`;

    const [progress, setProgress] = useState({
        currentTime: 0,
        duration: 0,
        percentage: 0,
        lastUpdated: null,
        completed: false,
        timeSpent: 0, // For non-video content (PDFs, articles)
    });

    const [isLoaded, setIsLoaded] = useState(false);

    // Load progress from localStorage on mount
    useEffect(() => {
        if (!instanceId || !resourceId) {
            setIsLoaded(true);
            return;
        }

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object') {
                    setProgress(prev => ({ ...prev, ...parsed }));
                }
            }
        } catch (error) {
            console.error('Error loading media progress:', error);
        } finally {
            setIsLoaded(true);
        }
    }, [storageKey, instanceId, resourceId]);

    // Save progress to localStorage
    const saveProgress = useCallback((currentTime, duration, additionalData = {}) => {
        if (!instanceId || !resourceId) return;

        const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
        const newProgress = {
            currentTime,
            duration,
            percentage,
            lastUpdated: new Date().toISOString(),
            completed: percentage >= 95, // Auto-complete at 95%
            ...additionalData,
        };

        setProgress(newProgress);

        try {
            localStorage.setItem(storageKey, JSON.stringify(newProgress));
        } catch (error) {
            console.error('Error saving media progress:', error);
        }

        return newProgress;
    }, [storageKey, instanceId, resourceId]);

    // Save time spent (for PDFs, articles)
    const saveTimeSpent = useCallback((timeSpent, estimatedTotal = 0) => {
        if (!instanceId || !resourceId) return;

        const percentage = estimatedTotal > 0 ? (timeSpent / estimatedTotal) * 100 : 0;
        const newProgress = {
            ...progress,
            timeSpent,
            percentage: Math.min(percentage, 100),
            lastUpdated: new Date().toISOString(),
            completed: percentage >= 95,
        };

        setProgress(newProgress);

        try {
            localStorage.setItem(storageKey, JSON.stringify(newProgress));
        } catch (error) {
            console.error('Error saving time spent:', error);
        }

        return newProgress;
    }, [storageKey, instanceId, resourceId, progress]);

    // Mark as complete
    const markAsComplete = useCallback(() => {
        if (!instanceId || !resourceId) return;

        const newProgress = {
            ...progress,
            completed: true,
            percentage: 100,
            lastUpdated: new Date().toISOString(),
        };

        setProgress(newProgress);

        try {
            localStorage.setItem(storageKey, JSON.stringify(newProgress));
        } catch (error) {
            console.error('Error marking as complete:', error);
        }

        return newProgress;
    }, [storageKey, instanceId, resourceId, progress]);

    // Clear progress
    const clearProgress = useCallback(() => {
        if (!instanceId || !resourceId) return;

        const emptyProgress = {
            currentTime: 0,
            duration: 0,
            percentage: 0,
            lastUpdated: null,
            completed: false,
            timeSpent: 0,
        };

        setProgress(emptyProgress);

        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error('Error clearing media progress:', error);
        }
    }, [storageKey, instanceId, resourceId]);

    // Check if there's saved progress
    const hasSavedProgress = progress.currentTime > 0 || progress.timeSpent > 0;

    return {
        progress,
        saveProgress,
        saveTimeSpent,
        markAsComplete,
        clearProgress,
        hasSavedProgress,
        isLoaded,
    };
}

/**
 * Utility function to format seconds to MM:SS or HH:MM:SS
 */
export function formatPlaybackTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url) {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Extract Google Drive file ID from URL
 */
export function extractGoogleDriveId(url) {
    if (!url) return null;

    const patterns = [
        /drive\.google\.com\/file\/d\/([^/]+)/,
        /drive\.google\.com\/open\?id=([^&]+)/,
        /docs\.google\.com\/.*\/d\/([^/]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Determine the media type from URL
 */
export function getMediaType(url, resourceType) {
    if (!url) return 'unknown';

    // Check resource type first
    if (resourceType === 'youtube-video') return 'youtube';
    if (resourceType === 'pdf') return 'pdf';
    if (resourceType === 'google-drive') {
        // Check if it's a video or other file
        if (url.includes('/file/d/')) return 'google-drive-video';
        return 'google-drive';
    }

    // URL-based detection
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('drive.google.com')) return 'google-drive-video';
    if (url.endsWith('.pdf') || url.includes('/pdf')) return 'pdf';

    return 'article';
}
