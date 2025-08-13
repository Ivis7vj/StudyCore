import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search, BookOpen, Play, Home, Filter, FlaskConical } from "lucide-react";
import { DocumentWithTopics } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

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
  const [, navigate] = useLocation();
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithTopics | null>(null);
  const [relatedSimulations, setRelatedSimulations] = useState<PhETSimulation[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<VideoResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch all documents
  const { data: documents = [] } = useQuery<DocumentWithTopics[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch all available simulations
  const { data: allSimulations = [] } = useQuery<PhETSimulation[]>({
    queryKey: ["/api/simulations"],
  });

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Simulations", icon: FlaskConical },
    { id: "physics", name: "Physics", icon: FlaskConical },
    { id: "chemistry", name: "Chemistry", icon: FlaskConical },
    { id: "math", name: "Mathematics", icon: FlaskConical },
    { id: "biology", name: "Biology", icon: FlaskConical },
  ];

  // Filter simulations based on search and category
  const filteredSimulations = useMemo(() => {
    let filtered = allSimulations;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(sim => 
        sim.keywords.some(keyword => 
          keyword.toLowerCase().includes(selectedCategory)
        )
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sim =>
        sim.title.toLowerCase().includes(query) ||
        sim.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [allSimulations, selectedCategory, searchQuery]);

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
        {/* Header with Home Button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/')}
            className="studycore-button px-4 py-2"
            data-testid="button-home"
          >
            <Home className="w-4 h-4 mr-2" />
            HOME
          </Button>
          <div className="text-center flex-1">
            <h1 className="font-orbitron text-4xl text-neon-cyan mb-2">PHET SIMULATIONS</h1>
            <p className="text-muted-foreground font-poppins">
              Interactive physics, chemistry, and math simulations for hands-on learning
            </p>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Search and Filter Controls */}
        <div className="studycore-card p-6 mb-8">
          <h2 className="font-orbitron text-xl text-neon-cyan mb-4">EXPLORE SIMULATIONS</h2>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search simulations by name or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 studycore-input"
              data-testid="input-search-simulations"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 ${
                    selectedCategory === category.id 
                      ? 'studycore-button-active' 
                      : 'studycore-button'
                  }`}
                  data-testid={`button-category-${category.id}`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground font-orbitron">
            SHOWING {filteredSimulations.length} OF {allSimulations.length} SIMULATIONS
          </div>
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

        {/* Filtered Simulations Display */}
        <div className="studycore-card p-6 mb-8">
          <h2 className="font-orbitron text-xl text-neon-cyan mb-6">
            {selectedCategory === "all" ? "ALL SIMULATIONS" : categories.find(c => c.id === selectedCategory)?.name?.toUpperCase() + " SIMULATIONS"}
          </h2>
          
          {filteredSimulations.length === 0 ? (
            <div className="text-center py-12">
              <FlaskConical className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-orbitron text-lg text-muted-foreground mb-2">NO SIMULATIONS FOUND</h3>
              <p className="text-muted-foreground font-poppins">
                Try adjusting your search terms or selecting a different category.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSimulations.map(simulation => (
                <div
                  key={simulation.id}
                  className="bg-card border border-border rounded-lg p-6 neon-glow-hover transition-all duration-300 hover:border-neon-cyan"
                  data-testid={`card-simulation-${simulation.id}`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1 mb-4">
                      <h3 className="font-orbitron text-foreground text-lg mb-3 line-clamp-2">{simulation.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {simulation.keywords.slice(0, 3).map(keyword => (
                          <span
                            key={keyword}
                            className="bg-neon-cyan bg-opacity-20 text-neon-cyan px-2 py-1 text-xs font-poppins rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                        {simulation.keywords.length > 3 && (
                          <span className="text-muted-foreground text-xs font-poppins px-2 py-1">
                            +{simulation.keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSimulationLaunch(simulation)}
                      className="studycore-button w-full py-3"
                      data-testid={`button-launch-${simulation.id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      LAUNCH SIMULATION
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document-based Related Content (Optional Section) */}
        {documents.length > 0 && (
          <div className="studycore-card p-6">
            <h2 className="font-orbitron text-xl text-neon-cyan mb-4">DOCUMENT-RELATED CONTENT</h2>
            <p className="text-muted-foreground font-poppins text-sm mb-6">
              Select a document to see related simulations and videos based on extracted topics.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

            {selectedDocument ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-orbitron text-lg text-neon-cyan mb-4">
                    RELATED SIMULATIONS FOR "{selectedDocument.originalName}"
                  </h3>
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
                            <Button
                              onClick={() => handleSimulationLaunch(simulation)}
                              className="studycore-button px-3 py-1 text-xs"
                              data-testid={`button-launch-related-${simulation.id}`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              LAUNCH
                            </Button>
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
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-poppins text-sm">
                  Select a document above to see related content
                </p>
              </div>
            )}
          </div>
        )}
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