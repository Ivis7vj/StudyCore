import { useQuery } from "@tanstack/react-query";
import { DocumentWithTopics } from "@shared/schema";
import { FileText } from "lucide-react";
import { useLocation } from "wouter";

export default function History() {
  const [, navigate] = useLocation();

  const { data: documents = [], isLoading } = useQuery<DocumentWithTopics[]>({
    queryKey: ['/api/documents'],
  });

  const handleResumeDocument = (documentId: string) => {
    navigate(`/topics/${documentId}`);
  };

  const getProgressPercentage = (topicCount: number) => {
    // Simplified progress calculation - in a real app would track actual completion
    return Math.min(100, (topicCount || 0) * 15);
  };

  const getStatusLabel = (processingStatus: string, topicCount: number) => {
    if (processingStatus === 'ready' && topicCount > 0) {
      return 'COMPLETE';
    } else if (processingStatus === 'ready') {
      return 'READY';
    } else if (processingStatus === 'analyzing') {
      return 'PROCESSING';
    } else if (processingStatus === 'uploading') {
      return 'UPLOADING';
    } else {
      return 'ERROR';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE': return 'text-neon-green';
      case 'READY': return 'text-neon-cyan';
      case 'PROCESSING': return 'text-neon-yellow';
      case 'UPLOADING': return 'text-neon-yellow';
      default: return 'text-neon-red';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-orbitron text-2xl font-bold text-foreground">STUDY HISTORY</h2>
        <button
          onClick={() => navigate('/')}
          className="studycore-button px-6 py-2"
          data-testid="button-back-to-dashboard"
        >
          BACK TO DASHBOARD
        </button>
      </div>

      <div className="studycore-card p-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground font-orbitron">
            LOADING HISTORY...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center text-muted-foreground font-orbitron">
            NO DOCUMENTS IN HISTORY. UPLOAD YOUR FIRST PDF TO GET STARTED.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="font-orbitron text-neon-cyan py-3">DOCUMENT</th>
                  <th className="font-orbitron text-neon-cyan py-3">TOPICS</th>
                  <th className="font-orbitron text-neon-cyan py-3">PROGRESS</th>
                  <th className="font-orbitron text-neon-cyan py-3">DATE</th>
                  <th className="font-orbitron text-neon-cyan py-3">STATUS</th>
                  <th className="font-orbitron text-neon-cyan py-3">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(document => {
                  const status = getStatusLabel(document.processingStatus, document.topicCount);
                  const progress = getProgressPercentage(document.topicCount);
                  
                  return (
                    <tr key={document.id} className="border-b border-border">
                      <td className="py-4 text-foreground">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-neon-red" />
                          {document.originalName}
                        </div>
                      </td>
                      <td className="py-4 text-foreground">{document.topicCount || 0}</td>
                      <td className="py-4">
                        <div className="bg-card h-2 w-32 border border-border">
                          <div 
                            className="bg-neon-cyan h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {new Date(document.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`font-orbitron text-xs ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleResumeDocument(document.id)}
                          className={`studycore-button px-3 py-1 text-xs ${
                            status === 'COMPLETE' || status === 'READY' 
                              ? 'studycore-button-primary' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                          disabled={status !== 'COMPLETE' && status !== 'READY'}
                          data-testid={`button-resume-${document.id}`}
                        >
                          {status === 'COMPLETE' ? 'REVIEW' : 'RESUME'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
