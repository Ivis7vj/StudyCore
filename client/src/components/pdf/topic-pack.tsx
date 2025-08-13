import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Question, TopicWithQuestionsAndResources } from "@shared/schema";
import { ArrowLeft, Play, ExternalLink, Trophy, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import VideoPopup from "@/components/video/video-popup";

interface TopicPackProps {
  topicId: string;
}

export default function TopicPack({ topicId }: TopicPackProps) {
  const [, navigate] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const { data: topic, isLoading } = useQuery<TopicWithQuestionsAndResources>({
    queryKey: ['/api/topics', topicId],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neon-cyan font-orbitron">LOADING TOPIC PACK...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neon-red font-orbitron">TOPIC NOT FOUND</div>
      </div>
    );
  }

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleStartQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    topic.questions.forEach(question => {
      if (question.type === 'MCQ' && question.correctAnswer) {
        const userAnswer = quizAnswers[question.id];
        if (userAnswer === question.correctAnswer) {
          correct++;
        }
      }
    });
    return { correct, total: topic.questions.filter(q => q.type === 'MCQ').length };
  };

  const score = showResults ? calculateScore() : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-orbitron text-2xl font-bold text-foreground">
          {topic.title}
        </h2>
        <button
          onClick={handleBackClick}
          className="studycore-button px-6 py-2"
          data-testid="button-back-to-topics"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK TO TOPICS
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <div className="studycore-card p-6">
            <h3 className="font-orbitron text-lg text-neon-cyan mb-4">SUMMARY</h3>
            <div className="text-foreground space-y-3">
              <p>{topic.summary}</p>
            </div>
          </div>

          {/* Questions */}
          <div className="studycore-card p-6">
            <h3 className="font-orbitron text-lg text-neon-cyan mb-4">PRACTICE QUESTIONS</h3>
            <div className="space-y-4">
              {topic.questions.map((question, index) => (
                <div key={question.id} className="bg-card border border-border p-4">
                  <p className="text-foreground mb-3 font-medium">
                    Q{index + 1}. {question.question}
                  </p>
                  
                  {question.type === 'MCQ' && question.options ? (
                    <div className="space-y-2">
                      {(question.options as string[]).map((option, i) => (
                        <label
                          key={i}
                          className="block text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        >
                          <input
                            type="radio"
                            name={`q${question.id}`}
                            value={option}
                            onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                            className="mr-2"
                            data-testid={`radio-question-${question.id}-option-${i}`}
                          />
                          {String.fromCharCode(65 + i)}. {option}
                        </label>
                      ))}
                      
                      {showResults && (
                        <div className="mt-3 p-3 bg-secondary border border-border rounded">
                          {quizAnswers[question.id] === question.correctAnswer ? (
                            <div className="text-neon-green flex items-center mb-2">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Correct!
                            </div>
                          ) : (
                            <div className="text-neon-red mb-2">
                              Incorrect. Correct answer: {question.correctAnswer}
                            </div>
                          )}
                          <div className="text-sm text-foreground">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        className="w-full bg-input border border-border text-foreground p-3 outline-none focus:border-neon-cyan mb-3"
                        rows={3}
                        placeholder="Type your answer..."
                        data-testid={`textarea-question-${question.id}`}
                      />
                      {showResults && (
                        <div className="mt-2 p-3 bg-secondary border border-border rounded">
                          <div className="text-sm text-foreground">
                            <strong>Sample Answer:</strong> {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Always show explanation for better learning */}
                  {!showResults && (
                    <div className="mt-2 p-2 bg-muted/20 border border-muted rounded text-xs text-muted-foreground">
                      💡 Click "START QUIZ" to see detailed explanations and answers
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {!showResults ? (
              <button
                onClick={handleStartQuiz}
                className="mt-6 studycore-button-primary px-6 py-3"
                data-testid="button-start-quiz"
              >
                <Play className="w-4 h-4 mr-2" />
                START QUIZ
              </button>
            ) : (
              <div className="mt-6 p-4 bg-secondary border border-border">
                <div className="flex items-center text-neon-cyan font-orbitron">
                  <Trophy className="w-5 h-5 mr-2" />
                  QUIZ RESULTS: {score?.correct}/{score?.total} Correct
                </div>
              </div>
            )}
          </div>

          {/* Real-world Example */}
          <div className="studycore-card p-6">
            <h3 className="font-orbitron text-lg text-neon-cyan mb-4">REAL-WORLD APPLICATION</h3>
            <div className="text-foreground space-y-3">
              <p>{topic.realWorldExample}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Resources */}
        <div className="space-y-6">
          {/* YouTube Videos */}
          <div className="studycore-card p-6">
            <h3 className="font-orbitron text-lg text-neon-cyan mb-4">VIDEO RESOURCES</h3>
            <div className="space-y-4">
              {topic.youtubeVideos.map(video => (
                <div
                  key={video.id}
                  className="bg-card border border-border p-3 cursor-pointer neon-glow-hover transition-all duration-300"
                  onClick={() => handleVideoClick(video)}
                  data-testid={`card-video-${video.id}`}
                >
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-20 object-cover mb-2"
                    />
                  )}
                  <h4 className="font-orbitron text-foreground text-sm mb-1">{video.title}</h4>
                  <p className="text-muted-foreground text-xs">{video.channel}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PhET Simulation */}
          {topic.phetSimulation && (
            <div className="studycore-card p-6">
              <h3 className="font-orbitron text-lg text-neon-cyan mb-4">INTERACTIVE SIMULATION</h3>
              <div className="bg-card border border-border p-4">
                <h4 className="font-orbitron text-foreground text-sm mb-3">{topic.phetSimulation.title}</h4>
                <div className="space-y-2 mb-4">
                  {(topic.phetSimulation.inquiryPrompts as string[]).map((prompt, index) => (
                    <p key={index} className="text-xs text-neon-cyan">• {prompt}</p>
                  ))}
                </div>
                <button
                  onClick={() => window.open(topic.phetSimulation!.url, '_blank')}
                  className="studycore-button w-full"
                  data-testid="button-launch-simulation"
                >
                  <Play className="w-4 h-4 mr-2" />
                  LAUNCH SIMULATION
                </button>
              </div>
            </div>
          )}

          {/* PDF Reference */}
          <div className="studycore-card p-6">
            <h3 className="font-orbitron text-lg text-neon-cyan mb-4">SOURCE REFERENCE</h3>
            <div className="space-y-3">
              <p className="text-foreground text-sm">
                Pages: <span className="text-neon-cyan">{topic.pages}</span>
              </p>
              <button
                className="studycore-button w-full"
                data-testid="button-view-pdf-page"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                VIEW PDF PAGE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Popup */}
      {selectedVideo && (
        <VideoPopup
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
