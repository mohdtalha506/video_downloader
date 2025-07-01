import React, { useState } from 'react';
import { Download, Link, Play, Clock, CheckCircle, AlertCircle, Loader2, Music, Video, Globe, ExternalLink } from 'lucide-react';
import { 
  getYouTubeVideoInfo, 
  getGenericVideoInfo, 
  downloadVideo, 
  detectPlatform, 
  validateUrl,
  VideoInfo,
  DownloadOptions 
} from '../utils/videoDownloader';

interface DownloadHistory {
  id: string;
  title: string;
  platform: string;
  downloadedAt: Date;
  format: string;
}

const VideoDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [history, setHistory] = useState<DownloadHistory[]>([]);

  const platforms = [
    { name: 'YouTube', color: 'bg-red-500', icon: Play },
    { name: 'Instagram', color: 'bg-pink-500', icon: Video },
    // { name: 'TikTok', color: 'bg-black', icon: Music },
    // { name: 'Twitter', color: 'bg-blue-500', icon: Globe },
  ];

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    
    try {
    const platform = detectPlatform(url);
    let videoData: VideoInfo;

    if (platform === 'Instagram') {
      // Directly download for Instagram, skip info
      setLoading(false);
      setDownloading(true);
      await downloadVideo(
        {
          id: '',
          title: 'Instagram Video',
          thumbnail: '',
          duration: '',
          platform: 'Instagram',
          url,
          quality: ['720p'],
        },
        { format: selectedFormat, quality: selectedQuality }
      );
      setDownloading(false);
      return;
    }

    if (platform === 'YouTube') {
      videoData = await getYouTubeVideoInfo(url);
    } else {
      videoData = await getGenericVideoInfo(url);
    }
    
    setVideoInfo(videoData);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch video information');
  } finally {
    setLoading(false);
  }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    
    setDownloading(true);
    setDownloadProgress(0);
    setError('');
    
    try {
      const options: DownloadOptions = {
        format: selectedFormat,
        quality: selectedQuality
      };
      
      await downloadVideo(videoInfo, options, (progress) => {
        console.log(progress,"pr");
        
        setDownloadProgress(progress);
      });
      
      // Add to history
      const newDownload: DownloadHistory = {
        id: videoInfo.id,
        title: videoInfo.title,
        platform: videoInfo.platform,
        downloadedAt: new Date(),
        format: selectedFormat.toUpperCase()
      };
      setHistory(prev => [newDownload, ...prev.slice(0, 4)]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const clearResults = () => {
    setVideoInfo(null);
    setUrl('');
    setError('');
    setDownloadProgress(0);
  };

  const formatDuration = (duration: string | number) => {
  const totalSeconds = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  if (isNaN(totalSeconds)) return duration;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video Downloader
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Download videos from YouTube, Instagram, TikTok, and more. 
            High quality, fast downloads, multiple formats supported.
          </p>
        </div>

        {/* Supported Platforms */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-4">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <div
                  key={platform.name}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className={`w-6 h-6 ${platform.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <form onSubmit={handleUrlSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-sm font-semibold text-gray-900 mb-3">
                      Video URL
                    </label>
                    <div className="relative">
                      <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste your video link here..."
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 transition-colors"
                        disabled={loading || downloading}
                      />
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 mt-3 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || downloading || !url.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Video...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Get Video Info
                      </>
                    )}
                  </button>
                </form>

                {/* Video Info */}
                {videoInfo && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                    <div className="flex gap-4">
                      <img
                        src={videoInfo.thumbnail}
                        alt="Video thumbnail"
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{videoInfo.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(videoInfo.duration)}
                          </span>
                          <span className="px-2 py-1 bg-white rounded-full text-xs font-medium">
                            {videoInfo.platform}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Format</label>
                            <select
                              value={selectedFormat}
                              onChange={(e) => setSelectedFormat(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="mp4">MP4 (Video)</option>
                              <option value="mp3">MP3 (Audio)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Quality</label>
                            <select
                              value={selectedQuality}
                              onChange={(e) => setSelectedQuality(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              {videoInfo.quality.map(quality => (
                                <option key={quality} value={quality}>{quality}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {downloading && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Downloading...</span>
                              <span>{Math.round(downloadProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${downloadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {downloading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Download
                              </>
                            )}
                          </button>
                          <button
                            onClick={clearResults}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Features */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="space-y-3">
                  {[
                    'High quality downloads',
                    'Multiple format support',
                    'Fast processing',
                    'No registration required',
                    'Mobile friendly'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Downloads */}
              {history.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Downloads</h3>
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{item.platform}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{item.format}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Browser Limitations Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Browser Limitations</h4>
                    <p className="text-xs text-blue-700">
                      Due to CORS policies, some downloads may require browser extensions or desktop applications for full functionality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-amber-800">Important Note</h4>
            </div>
            <p className="text-sm text-amber-700">
              Always respect copyright and platform terms of service when downloading content. 
              This tool is for personal use and educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDownloader;