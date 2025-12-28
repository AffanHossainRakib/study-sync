import { google } from "googleapis";

/**
 * YouTube API Service for Next.js
 * Handles fetching video and playlist metadata from YouTube Data API v3
 */

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * Extract video ID from various YouTube URL formats
 */
const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Extract playlist ID from YouTube URL
 */
const extractPlaylistId = (url) => {
  const match = url.match(/[?&]list=([^&\n?#]+)/);
  return match ? match[1] : null;
};

/**
 * Convert ISO 8601 duration to minutes
 */
const parseDuration = (isoDuration) => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 60 + minutes + seconds / 60;
};

/**
 * Fetch metadata for a single YouTube video
 */
export const getVideoMetadata = async (url) => {
  try {
    const videoId = extractVideoId(url);

    if (!videoId) {
      throw new Error("Invalid YouTube video URL");
    }

    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: [videoId],
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = response.data.items[0];
    const duration = parseDuration(video.contentDetails.duration);

    return {
      videoId: video.id,
      title: video.snippet.title,
      duration: Math.round(duration),
      thumbnailUrl:
        video.snippet.thumbnails?.medium?.url ||
        video.snippet.thumbnails?.default?.url ||
        "",
      url: `https://www.youtube.com/watch?v=${video.id}`,
    };
  } catch (error) {
    console.error("YouTube API error (video):", error.message);
    throw new Error(`Failed to fetch video metadata: ${error.message}`);
  }
};

/**
 * Fetch all videos from a YouTube playlist
 */
export const getPlaylistVideos = async (url) => {
  try {
    const playlistId = extractPlaylistId(url);

    if (!playlistId) {
      throw new Error("Invalid YouTube playlist URL");
    }

    const videos = [];
    let nextPageToken = null;

    do {
      const response = await youtube.playlistItems.list({
        part: ["contentDetails"],
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      const videoIds = response.data.items.map(
        (item) => item.contentDetails.videoId
      );

      const videosResponse = await youtube.videos.list({
        part: ["snippet", "contentDetails"],
        id: videoIds,
      });

      for (const video of videosResponse.data.items) {
        const duration = parseDuration(video.contentDetails.duration);
        videos.push({
          videoId: video.id,
          title: video.snippet.title,
          duration: Math.round(duration),
          thumbnailUrl:
            video.snippet.thumbnails?.medium?.url ||
            video.snippet.thumbnails?.default?.url ||
            "",
          url: `https://www.youtube.com/watch?v=${video.id}`,
        });
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return videos;
  } catch (error) {
    console.error("YouTube API error (playlist):", error.message);
    throw new Error(`Failed to fetch playlist videos: ${error.message}`);
  }
};
