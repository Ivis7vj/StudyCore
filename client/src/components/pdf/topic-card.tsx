import { Topic } from "@shared/schema";
import { useLocation } from "wouter";

interface TopicCardProps {
  topic: Topic;
}

export default function TopicCard({ topic }: TopicCardProps) {
  const [, navigate] = useLocation();

  const handleTopicClick = () => {
    navigate(`/topic/${topic.id}`);
  };

  return (
    <div 
      className="studycore-card p-6 cursor-pointer"
      onClick={handleTopicClick}
      data-testid={`card-topic-${topic.id}`}
    >
      <h3 className="font-orbitron text-foreground text-lg mb-3">{topic.title}</h3>
      <p className="text-muted-foreground text-sm mb-4">Pages: {topic.pages}</p>
      <p className="text-foreground text-sm mb-4 line-clamp-3">
        {topic.summary.substring(0, 150)}...
      </p>
      <div className="flex justify-between items-center">
        <span className="text-neon-cyan text-xs font-orbitron">
          STUDY PACK
        </span>
        <button 
          className="studycore-button px-4 py-2 text-xs"
          data-testid={`button-explore-topic-${topic.id}`}
        >
          EXPLORE
        </button>
      </div>
    </div>
  );
}
