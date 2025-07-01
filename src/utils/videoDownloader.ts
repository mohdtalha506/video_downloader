// Video downloader utility functions
export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  platform: string;
  url: string;
  quality: string[];
  formats?: any[];
}

export interface DownloadOptions {
  format: string;
  quality: string;
}

// YouTube video info extraction
// export const getYouTubeVideoInfo = async (url: string): Promise<VideoInfo> => {
//   try {
//     // For browser environment, we'll use YouTube's oEmbed API
//     const videoId = extractYouTubeVideoId(url);
//     if (!videoId) throw new Error('Invalid YouTube URL');

//     const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
//     const response = await fetch(oEmbedUrl);
//     console.log(response,"res");
    
//     if (!response.ok) throw new Error('Failed to fetch video info');
    
//     const data = await response.json();
//     console.log(data,'data');
    
//     return {
//       id: videoId,
//       title: data.title,
//       thumbnail: data.thumbnail_url,
//       duration: 'N/A', // oEmbed doesn't provide duration
//       platform: 'YouTube',
//       url: url,
//       quality: ['1080p', '720p', '480p', '360p'],
//       formats: []
//     };
//   } catch (error) {
//     throw new Error(`Failed to get YouTube video info: ${error}`);
//   }
// };
export const getYouTubeVideoInfo = async (url: string): Promise<VideoInfo> => {
  try {
    const apiUrl = import.meta.env.VITE_APP_BASEURL+`api/info/youtube?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) throw new Error('Failed to fetch video info');
    
    const data = await response.json();
    console.log(data,"data");
    
    return {
      id: '', // You can extract this if needed
      title: data.title,
      thumbnail: data.thumbnail,
      duration: data.duration,
      platform: 'YouTube',
      url,
      quality: data.availableQualities,
      formats: data.formats
    };
  } catch (error) {
    throw new Error(`Failed to get YouTube video info: ${error}`);
  }
};

// Extract YouTube video ID from URL
const extractYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Generic video info for other platforms
export const getGenericVideoInfo = async (url: string): Promise<VideoInfo> => {
  const platform = detectPlatform(url);
  
  // For demo purposes, return mock data for non-YouTube platforms
  // In a real implementation, you'd use appropriate APIs for each platform
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: `${platform} Video - Content Title`,
    thumbnail: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: '2:45',
    platform,
    url,
    quality: ['1080p', '720p', '480p', '360p']
  };
};

// Platform detection
export const detectPlatform = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
  if (url.includes('facebook.com')) return 'Facebook';
  return 'Other';
};

// Download video using browser download
export const downloadVideo = async (
  videoInfo: VideoInfo, 
  options: DownloadOptions,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    if (videoInfo.platform === 'YouTube') {
      await downloadYouTubeVideo(videoInfo, options, onProgress);
    } else if (videoInfo.platform === 'Instagram') {
      await downloadInstagramVideo(videoInfo, options, onProgress);
    } else {
      await downloadGenericVideo(videoInfo, options, onProgress);
    }
  } catch (error) {
    throw new Error(`Download failed: ${error}`);
  }
};

// YouTube video download (using public APIs and CORS proxies)
// const downloadYouTubeVideo = async (
//   videoInfo: VideoInfo,
//   options: DownloadOptions,
//   onProgress?: (progress: number) => void
// ): Promise<void> => {
//   try {
//     // Simulate download progress
//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += Math.random() * 15;
//       if (progress >= 100) {
//         progress = 100;
//         clearInterval(interval);
//       }
//       onProgress?.(progress);
//     }, 200);

//     // For YouTube, we'll use a CORS proxy to access video data
//     // Note: This is a simplified approach. In production, you'd need proper backend integration
//     const proxyUrl = `https://cors-anywhere.herokuapp.com/`;
//     const videoUrl = `${proxyUrl}https://www.youtube.com/watch?v=${videoInfo.id}`;
    
//     // Create download link
//     const link = document.createElement('a');
//     link.href = videoUrl;
//     link.download = `${videoInfo.title}.${options.format}`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//   } catch (error) {
//     throw new Error(`YouTube download failed: ${error}`);
//   }
// };

const downloadYouTubeVideo = async (
  videoInfo: VideoInfo,
  options: DownloadOptions,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const apiUrl = import.meta.env.VITE_APP_BASEURL+`api/download/youtube?url=${encodeURIComponent(videoInfo.url)}&format=${options.format}&quality=${options.quality}`;
    const anchor = document.createElement('a');
    anchor.href = apiUrl;
    anchor.download = `${videoInfo.title}.${options.format}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch (error) {
    throw new Error(`YouTube download failed: ${error}`);
  }
};

const downloadInstagramVideo = async (
  videoInfo: VideoInfo,
  options: DownloadOptions,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const apiUrl = import.meta.env.VITE_APP_BASEURL+`api/download/instagram-alt?url=${encodeURIComponent(videoInfo.url)}`;
    const anchor = document.createElement('a');
    anchor.href = apiUrl;
    anchor.download = `${videoInfo.title}.${options.format}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch (error) {
    throw new Error(`Instagram download failed: ${error}`);
  }
};


// Generic video download
// const downloadGenericVideo = async (
//   videoInfo: VideoInfo,
//   options: DownloadOptions,
//   onProgress?: (progress: number) => void
// ): Promise<void> => {
//   try {
//     // Simulate download progress
//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += Math.random() * 15;
//       if (progress >= 100) {
//         progress = 100;
//         clearInterval(interval);
//       }
//       onProgress?.(progress);
//     }, 200);

//     // For other platforms, attempt direct download
//     const response = await fetch(videoInfo.url);
//     if (!response.ok) throw new Error('Failed to fetch video');
    
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
    
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${videoInfo.title}.${options.format}`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//     window.URL.revokeObjectURL(url);
    
//   } catch (error) {
//     // If direct download fails, show instructions to user
//     throw new Error('Direct download not available. Please try using a browser extension or desktop application.');
//   }
// };
const downloadGenericVideo = async (
  videoInfo: VideoInfo,
  options: DownloadOptions,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const apiUrl = import.meta.env.VITE_APP_BASEURL+`api/download?url=${encodeURIComponent(videoInfo.url)}&format=${options.format}&quality=${options.quality}`;
    
    const anchor = document.createElement('a');
    anchor.href = apiUrl;
    anchor.download = `${videoInfo.title}.${options.format}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch (error) {
    throw new Error(`Download failed: ${error}`);
  }
};


// Validate URL
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};