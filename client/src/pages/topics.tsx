import { useQuery } from "@tanstack/react-query";
import { Topic } from "@shared/schema";
import TopicCard from "@/components/pdf/topic-card";
import { useLocation } from "wouter";

interface TopicsProps {
  params: {
    documentId: string;
  };
}

export default function Topics({ params }: TopicsProps) {
  const [, navigate] = useLocation();
  const { documentId } = params;

  const { data: topics = [], isLoading, error } = useQuery<Topic[]>({
    queryKey: ['/api/documents', documentId, 'topics'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neon-cyan font-orbitron">EXTRACTING TOPICS...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neon-red font-orbitron">ERROR LOADING TOPICS</div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-yellow font-orbitron mb-4">PROCESSING DOCUMENT...</div>
          <div className="text-muted-foreground">Topics are being extracted. Please wait.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-orbitron text-2xl font-bold text-foreground">EXTRACTED TOPICS</h2>
        <button
          onClick={() => navigate('/')}
          className="studycore-button px-6 py-2"
          data-testid="button-back-to-dashboard"
        >
          BACK TO DASHBOARD
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map(topic => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
