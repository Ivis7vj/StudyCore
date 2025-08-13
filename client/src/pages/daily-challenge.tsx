import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";

interface DailyChallenge {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  date: string;
  type: string;
}

export default function DailyChallenge() {
  const [, navigate] = useLocation();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const { data: challenges = [], isLoading } = useQuery<DailyChallenge[]>({
    queryKey: ['/api/daily-challenge'],
  });

  const challenge = challenges[0];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const handleTryAgain = () => {
    setSelectedAnswer("");
    setShowResult(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neon-cyan font-orbitron text-xl">
          GENERATING DAILY CHALLENGE...
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-red font-orbitron text-xl mb-4">
            CHALLENGE NOT AVAILABLE
          </div>
          <button
            onClick={handleBack}
            className="studycore-button px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === challenge.correctAnswer;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-foreground mb-2">
              DAILY CHALLENGE
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-neon-cyan font-orbitron text-sm">
                {challenge.subject.toUpperCase()}
              </span>
              <span className="text-muted-foreground text-sm">
                {challenge.date}
              </span>
              <span className="text-neon-yellow text-sm font-orbitron">
                {challenge.difficulty.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="studycore-button px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO DASHBOARD
          </button>
        </div>

        {/* Challenge Card */}
        <div className="studycore-card p-8">
          <div className="flex items-center mb-6">
            <Trophy className="w-6 h-6 text-neon-cyan mr-3" />
            <h2 className="font-orbitron text-xl text-foreground">
              TODAY'S CHALLENGE
            </h2>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-foreground mb-6">
              {challenge.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {challenge.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedAnswer === optionLetter;
                const isCorrectOption = challenge.correctAnswer === optionLetter;
                
                let optionStyle = "bg-card border border-border hover:border-neon-cyan transition-all duration-200 cursor-pointer";
                
                if (showResult) {
                  if (isCorrectOption) {
                    optionStyle = "bg-neon-green/10 border-neon-green text-neon-green";
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = "bg-neon-red/10 border-neon-red text-neon-red";
                  } else {
                    optionStyle = "bg-muted/20 border-muted text-muted-foreground";
                  }
                } else if (isSelected) {
                  optionStyle = "bg-neon-cyan/10 border-neon-cyan text-neon-cyan";
                }

                return (
                  <label
                    key={index}
                    className={`block p-4 rounded-lg ${optionStyle}`}
                    onClick={() => !showResult && handleAnswerSelect(optionLetter)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 font-orbitron text-sm">
                        {optionLetter}
                      </div>
                      <span className="text-sm">{option}</span>
                      {showResult && isCorrectOption && (
                        <CheckCircle className="w-5 h-5 ml-auto text-neon-green" />
                      )}
                      {showResult && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 ml-auto text-neon-red" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          {!showResult ? (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="studycore-button-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SUBMIT ANSWER
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Result */}
              <div className="text-center p-6 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-center mb-4">
                  {isCorrect ? (
                    <div className="flex items-center text-neon-green">
                      <CheckCircle className="w-8 h-8 mr-3" />
                      <span className="font-orbitron text-xl">CORRECT!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-neon-red">
                      <XCircle className="w-8 h-8 mr-3" />
                      <span className="font-orbitron text-xl">INCORRECT</span>
                    </div>
                  )}
                </div>
                
                {/* Explanation */}
                <div className="text-left">
                  <h4 className="font-orbitron text-sm text-neon-cyan mb-2">EXPLANATION:</h4>
                  <p className="text-foreground text-sm leading-relaxed">
                    {challenge.explanation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleTryAgain}
                  className="studycore-button px-6 py-3"
                >
                  TRY AGAIN
                </button>
                <button
                  onClick={handleBack}
                  className="studycore-button-primary px-6 py-3"
                >
                  BACK TO DASHBOARD
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}