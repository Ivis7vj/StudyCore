import { useState } from "react";
import { Search, X, Play, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VideoSearchProps {
  onClose: () => void;
}

interface VideoResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  description: string;
}

export default function VideoSearch({ onClose }: VideoSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('GET', `/api/videos?query=${encodeURIComponent(searchQuery)}&maxResults=6`);
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoClick = (video: VideoResult) => {
    setSelectedVideo(video);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-40 flex items-center justify-center p-4">
      <div className="bg-card border-2 border-neon-cyan max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-neon-cyan">
          <h3 className="font-orbitron text-lg text-neon-cyan">YOUTUBE VIDEO SEARCH</h3>
          <button
            onClick={onClose}
            className="text-foreground hover:text-neon-cyan transition-colors"
            data-testid="button-close-video-search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Search Bar */}
          <div className="flex space-x-4 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for educational videos..."
              className="flex-1 bg-input border border-border text-foreground py-3 px-4 font-poppins outline-none focus:border-neon-cyan"
              data-testid="input-video-search"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="studycore-button px-6 py-3"
              data-testid="button-search-videos"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-neon-cyan font-orbitron py-8">
                SEARCHING VIDEOS...
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center text-muted-foreground font-orbitron py-8">
                {searchQuery ? 'NO RESULTS FOUND. TRY A DIFFERENT SEARCH TERM.' : 'ENTER A SEARCH TERM TO FIND EDUCATIONAL VIDEOS.'}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(video => (
                  <div
                    key={video.videoId}
                    className="bg-card border border-border p-3 cursor-pointer neon-glow-hover transition-all duration-300"
                    onClick={() => handleVideoClick(video)}
                    data-testid={`card-search-video-${video.videoId}`}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-32 object-cover mb-3"
                    />
                    <h4 className="font-orbitron text-foreground text-sm mb-2 line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-muted-foreground text-xs mb-2">{video.channel}</p>
                    <button
                      className="studycore-button w-full py-1 text-xs"
                      data-testid={`button-watch-${video.videoId}`}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      WATCH
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Popup */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-card border-2 border-neon-cyan max-w-4xl w-full">
            <div className="flex justify-between items-center p-4 border-b border-neon-cyan">
              <h3 className="font-orbitron text-lg text-neon-cyan">NOW PLAYING</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-foreground hover:text-neon-cyan transition-colors"
                data-testid="button-close-video-player"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-black mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                  frameBorder="0"
                  allowFullScreen
                  title={selectedVideo.title}
                  data-testid="iframe-search-video"
                />
              </div>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-orbitron text-foreground text-xl mb-2">{selectedVideo.title}</h4>
                  <p className="text-muted-foreground mb-2">{selectedVideo.channel}</p>
                  <p className="text-foreground text-sm">{selectedVideo.description.substring(0, 200)}...</p>
                </div>
                <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.videoId}`, '_blank')}
                  className="studycore-button ml-4 px-4 py-2"
                  data-testid="button-open-youtube"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  OPEN IN YOUTUBE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}