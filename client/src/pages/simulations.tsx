import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search, BookOpen, Play } from "lucide-react";
import { DocumentWithTopics } from "@shared/schema";

interface PhETSimulation {
  id: number;
  title: string;
  url: string;
  keywords: string[];
  documentId?: number;
}

interface VideoResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  description: string;
}

export default function Simulations() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithTopics | null>(null);
  const [relatedSimulations, setRelatedSimulations] = useState<PhETSimulation[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<VideoResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);

  // Fetch all documents
  const { data: documents = [] } = useQuery<DocumentWithTopics[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch all available simulations
  const { data: allSimulations = [] } = useQuery<PhETSimulation[]>({
    queryKey: ["/api/simulations"],
  });

  const handleDocumentSelect = async (document: DocumentWithTopics) => {
    setSelectedDocument(document);
    
    try {
      // Fetch related simulations for this document
      const simResponse = await fetch(`/api/simulations/${document.id}`);
      const simulations = await simResponse.json();
      setRelatedSimulations(simulations);

      // Fetch related videos for this document's topics
      if (document.topics && document.topics.length > 0) {
        const topicKeywords = document.topics.map(t => t.title).join(' ');
        const videoResponse = await fetch(`/api/videos?query=${encodeURIComponent(topicKeywords + ' educational tutorial')}&maxResults=4`);
        const videos = await videoResponse.json();
        setRelatedVideos(videos);
      }
    } catch (error) {
      console.error('Error fetching related content:', error);
    }
  };

  const handleVideoClick = (video: VideoResult) => {
    setSelectedVideo(video);
  };

  const handleSimulationLaunch = (simulation: PhETSimulation) => {
    window.open(simulation.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-4xl text-neon-cyan mb-4">PHET SIMULATIONS</h1>
          <p className="text-muted-foreground font-poppins">
            Interactive physics, chemistry, and math simulations for hands-on learning
          </p>
        </div>

        {/* Document Selection */}
        {documents.length > 0 && (
          <div className="mb-8">
            <h2 className="font-orbitron text-xl text-neon-cyan mb-4">SELECT DOCUMENT FOR RELATED CONTENT</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className={`bg-card border-2 p-4 cursor-pointer transition-all duration-300 ${
                    selectedDocument?.id === doc.id 
                      ? 'border-neon-cyan neon-glow' 
                      : 'border-border hover:border-neon-cyan'
                  }`}
                  onClick={() => handleDocumentSelect(doc)}
                  data-testid={`card-document-${doc.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-neon-cyan" />
                    <div>
                      <h3 className="font-orbitron text-foreground text-sm">{doc.originalName}</h3>
                      <p className="text-muted-foreground text-xs">
                        {doc.topics?.length || 0} topics extracted
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* All Available Simulations */}
          <div>
            <h2 className="font-orbitron text-xl text-neon-cyan mb-4">ALL AVAILABLE SIMULATIONS</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {allSimulations.map(simulation => (
                <div
                  key={simulation.id}
                  className="bg-card border border-border p-4 neon-glow-hover transition-all duration-300"
                  data-testid={`card-simulation-${simulation.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-orbitron text-foreground text-lg mb-2">{simulation.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {simulation.keywords.map(keyword => (
                          <span
                            key={keyword}
                            className="bg-neon-cyan bg-opacity-20 text-neon-cyan px-2 py-1 text-xs font-poppins"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSimulationLaunch(simulation)}
                      className="studycore-button px-4 py-2 ml-4"
                      data-testid={`button-launch-${simulation.id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      LAUNCH
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document-Related Content */}
          <div>
            {selectedDocument ? (
              <div className="space-y-6">
                <div>
                  <h2 className="font-orbitron text-xl text-neon-cyan mb-4">
                    RELATED SIMULATIONS FOR "{selectedDocument.originalName}"
                  </h2>
                  {relatedSimulations.length > 0 ? (
                    <div className="space-y-3">
                      {relatedSimulations.map(simulation => (
                        <div
                          key={simulation.id}
                          className="bg-card border border-neon-cyan p-3 neon-glow-hover transition-all duration-300"
                          data-testid={`card-related-simulation-${simulation.id}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-orbitron text-foreground text-sm">{simulation.title}</h4>
                              <div className="flex gap-1 mt-1">
                                {simulation.keywords.slice(0, 3).map(keyword => (
                                  <span key={keyword} className="text-neon-cyan text-xs">{keyword}</span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => handleSimulationLaunch(simulation)}
                              className="studycore-button px-3 py-1 text-xs"
                              data-testid={`button-launch-related-${simulation.id}`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              LAUNCH
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-poppins text-sm">
                      No related simulations found for this document.
                    </p>
                  )}
                </div>

                <div>
                  <h2 className="font-orbitron text-xl text-neon-cyan mb-4">RELATED LEARNING VIDEOS</h2>
                  {relatedVideos.length > 0 ? (
                    <div className="space-y-3">
                      {relatedVideos.map(video => (
                        <div
                          key={video.videoId}
                          className="bg-card border border-border p-3 cursor-pointer neon-glow-hover transition-all duration-300"
                          onClick={() => handleVideoClick(video)}
                          data-testid={`card-related-video-${video.videoId}`}
                        >
                          <div className="flex space-x-3">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-16 h-12 object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-orbitron text-foreground text-sm line-clamp-2">{video.title}</h4>
                              <p className="text-muted-foreground text-xs">{video.channel}</p>
                            </div>
                            <Play className="w-4 h-4 text-neon-cyan" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-poppins text-sm">
                      No related videos found for this document.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-orbitron text-muted-foreground text-lg mb-2">SELECT A DOCUMENT</h3>
                <p className="text-muted-foreground font-poppins text-sm">
                  Choose a document above to see related simulations and learning videos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
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
                <ExternalLink className="w-6 h-6" />
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
                  data-testid="iframe-related-video"
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