import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, History, Video, FlaskConical, Mic, Trophy } from "lucide-react";
import { DocumentWithTopics } from "@shared/schema";
import PDFUpload from "@/components/pdf/pdf-upload";
import VoiceChat from "@/components/voice/voice-chat";
import VideoSearch from "@/components/video/video-search";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showVideoSearch, setShowVideoSearch] = useState(false);

  const { data: documents = [], isLoading } = useQuery<DocumentWithTopics[]>({
    queryKey: ['/api/documents'],
  });

  const handleUploadSuccess = (documentId: string) => {
    navigate(`/topics/${documentId}`);
  };

  const handleHistoryClick = () => {
    navigate('/history');
  };

  const handleResourcesClick = () => {
    setShowVideoSearch(true);
  };

  const handleSimulationsClick = () => {
    navigate('/simulations');
  };

  const handleVoiceChatClick = () => {
    setShowVoiceChat(true);
  };

  const handleDailyChallengeClick = async () => {
    try {
      const response = await fetch('/api/daily-challenge');
      const questions = await response.json();
      // TODO: Navigate to daily challenge quiz page
      alert(`Daily Challenge - ${questions.length} questions ready!`);
    } catch (error) {
      alert('Daily Challenge - Random quiz from all topics - to be implemented');
    }
  };

  const handleResumeDocument = (documentId: string) => {
    navigate(`/topics/${documentId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <h2 className="font-orbitron text-2xl font-bold gradient-text mb-8 animate-fade-in-up">MISSION CONTROL</h2>
        
        {/* PDF Upload and Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="animate-slide-in-left">
            <PDFUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Quick Actions */}
          <div className="studycore-card p-6 animate-slide-in-right">
            <h3 className="font-orbitron text-lg text-neon-cyan mb-4 text-glow-pulse">QUICK ACCESS</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleHistoryClick}
                className="studycore-button py-4 px-4 flex flex-col items-center hover-lift animate-float"
                style={{ animationDelay: '0.1s' }}
                data-testid="button-history"
              >
                <History className="text-neon-cyan w-6 h-6 mb-2 animate-pulse-glow" />
                <span className="font-orbitron text-sm">HISTORY</span>
              </button>
              
              <button
                onClick={handleResourcesClick}
                className="studycore-button py-4 px-4 flex flex-col items-center hover-lift animate-float"
                style={{ animationDelay: '0.2s' }}
                data-testid="button-resources"
              >
                <Video className="text-neon-cyan w-6 h-6 mb-2 animate-pulse-glow" />
                <span className="font-orbitron text-sm">VIDEOS</span>
              </button>
              
              <button
                onClick={handleSimulationsClick}
                className="studycore-button py-4 px-4 flex flex-col items-center hover-lift animate-float"
                style={{ animationDelay: '0.3s' }}
                data-testid="button-simulations"
              >
                <FlaskConical className="text-neon-cyan w-6 h-6 mb-2 animate-pulse-glow" />
                <span className="font-orbitron text-sm">SIMULATIONS</span>
              </button>
              
              <button
                onClick={handleVoiceChatClick}
                className="studycore-button py-4 px-4 flex flex-col items-center hover-lift animate-float"
                style={{ animationDelay: '0.4s' }}
                data-testid="button-voice-chat"
              >
                <Mic className="text-neon-cyan w-6 h-6 mb-2 animate-pulse-glow" />
                <span className="font-orbitron text-sm">VOICE Q&A</span>
              </button>
              
              <button
                onClick={handleDailyChallengeClick}
                className="studycore-button-primary py-4 px-4 flex flex-col items-center col-span-2 hover-lift animate-float"
                style={{ animationDelay: '0.5s' }}
                data-testid="button-daily-challenge"
              >
                <Trophy className="text-neon-yellow w-6 h-6 mb-2 animate-pulse-glow" />
                <span className="font-orbitron text-sm">DAILY CHALLENGE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="studycore-card p-6 animate-fade-in-up">
          <h3 className="font-orbitron text-lg text-neon-cyan mb-4 text-glow-pulse">RECENT DOCUMENTS</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="loading-spinner"></div>
                <span className="text-muted-foreground font-orbitron ml-3">LOADING DOCUMENTS...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="col-span-full text-center py-8 animate-scale-in">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
                <div className="text-muted-foreground font-orbitron mb-2">
                  NO DOCUMENTS UPLOADED YET
                </div>
                <p className="text-muted-foreground font-poppins text-sm">
                  Upload your first PDF to get started with AI-powered study assistance
                </p>
              </div>
            ) : (
              documents.map((document, index) => (
                <div
                  key={document.id}
                  className="glass-card p-4 cursor-pointer hover-lift animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleResumeDocument(document.id)}
                  data-testid={`card-document-${document.id}`}
                >
                  <div className="flex items-center mb-3">
                    <FileText className="text-neon-red text-xl mr-3 w-6 h-6 animate-pulse-glow" />
                    <div className="flex-1">
                      <h4 className="font-orbitron text-foreground text-sm truncate">{document.originalName}</h4>
                      <p className="text-muted-foreground text-xs">
                        {document.topicCount} topics extracted
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                  </div>
                  <button
                    className="studycore-button-primary px-4 py-2 text-xs w-full hover-lift"
                    data-testid={`button-resume-study-${document.id}`}
                  >
                    RESUME STUDY
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Voice Chat Modal */}
      {showVoiceChat && (
        <VoiceChat onClose={() => setShowVoiceChat(false)} />
      )}

      {/* Video Search Modal */}
      {showVideoSearch && (
        <VideoSearch onClose={() => setShowVideoSearch(false)} />
      )}
    </div>
  );
}
