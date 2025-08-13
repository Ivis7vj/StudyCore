import TopicPack from "@/components/pdf/topic-pack";

interface TopicDetailProps {
  params: {
    topicId: string;
  };
}

export default function TopicDetail({ params }: TopicDetailProps) {
  return <TopicPack topicId={params.topicId} />;
}
