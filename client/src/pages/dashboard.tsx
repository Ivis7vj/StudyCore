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
    // TODO: Implement PhET simulations browser
    alert('PhET Simulations browser - to be implemented');
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
        <h2 className="font-orbitron text-2xl font-bold text-foreground mb-8">MISSION CONTROL</h2>
        
        {/* PDF Upload and Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <PDFUpload onUploadSuccess={handleUploadSuccess} />

          {/* Quick Actions */}
          <div className="studycore-card p-6">
            <h3 className="font-orbitron text-lg text-neon-cyan mb-4">QUICK ACCESS</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleHistoryClick}
                className="studycore-button py-4 px-4 flex flex-col items-center"
                data-testid="button-history"
              >
                <History className="text-neon-cyan w-6 h-6 mb-2" />
                <span className="font-orbitron text-sm">HISTORY</span>
              </button>
              
              <button
                onClick={handleResourcesClick}
                className="studycore-button py-4 px-4 flex flex-col items-center"
                data-testid="button-resources"
              >
                <Video className="text-neon-cyan w-6 h-6 mb-2" />
                <span className="font-orbitron text-sm">VIDEOS</span>
              </button>
              
              <button
                onClick={handleSimulationsClick}
                className="studycore-button py-4 px-4 flex flex-col items-center"
                data-testid="button-simulations"
              >
                <FlaskConical className="text-neon-cyan w-6 h-6 mb-2" />
                <span className="font-orbitron text-sm">SIMULATIONS</span>
              </button>
              
              <button
                onClick={handleVoiceChatClick}
                className="studycore-button py-4 px-4 flex flex-col items-center"
                data-testid="button-voice-chat"
              >
                <Mic className="text-neon-cyan w-6 h-6 mb-2" />
                <span className="font-orbitron text-sm">VOICE Q&A</span>
              </button>
              
              <button
                onClick={handleDailyChallengeClick}
                className="studycore-button py-4 px-4 flex flex-col items-center col-span-2"
                data-testid="button-daily-challenge"
              >
                <Trophy className="text-neon-yellow w-6 h-6 mb-2" />
                <span className="font-orbitron text-sm">DAILY CHALLENGE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="studycore-card p-6">
          <h3 className="font-orbitron text-lg text-neon-cyan mb-4">RECENT DOCUMENTS</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="text-muted-foreground font-orbitron">LOADING DOCUMENTS...</div>
            ) : documents.length === 0 ? (
              <div className="text-muted-foreground font-orbitron col-span-full">
                NO DOCUMENTS UPLOADED YET. UPLOAD YOUR FIRST PDF TO GET STARTED.
              </div>
            ) : (
              documents.map(document => (
                <div
                  key={document.id}
                  className="studycore-card p-4 cursor-pointer"
                  onClick={() => handleResumeDocument(document.id)}
                  data-testid={`card-document-${document.id}`}
                >
                  <div className="flex items-center mb-3">
                    <FileText className="text-neon-red text-xl mr-3 w-6 h-6" />
                    <div>
                      <h4 className="font-orbitron text-foreground text-sm">{document.originalName}</h4>
                      <p className="text-muted-foreground text-xs">
                        {document.topicCount} topics extracted
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                  </div>
                  <button
                    className="studycore-button px-4 py-1 text-xs w-full"
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
