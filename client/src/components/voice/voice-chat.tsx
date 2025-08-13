import { useState, useRef, useEffect } from "react";
import { X, Mic, MicOff, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VoiceChatProps {
  onClose: () => void;
  documentId?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function VoiceChat({ onClose, documentId }: VoiceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm StudyCore AI, ready to help you with your study questions. You can speak to me or type your questions.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Voice Recognition Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    } else {
      toast({
        title: "Voice Recognition Not Available",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        documentId,
        sessionId
      });
      const data = await response.json();

      setSessionId(data.sessionId);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 0.8;
        synthRef.current.speak(utterance);
      }

    } catch (error) {
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-40 flex items-center justify-center p-4">
      <div className="bg-card border-2 border-neon-cyan max-w-2xl w-full">
        <div className="flex justify-between items-center p-4 border-b border-neon-cyan">
          <h3 className="font-orbitron text-lg text-neon-cyan">VOICE Q&A ASSISTANT</h3>
          <button
            onClick={onClose}
            className="text-foreground hover:text-neon-cyan transition-colors"
            data-testid="button-close-voice-chat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div 
            className="h-64 overflow-y-auto mb-4 border border-border p-4 space-y-4"
            data-testid="chat-messages-container"
          >
            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                <div className={`font-orbitron text-sm ${
                  message.role === 'assistant' ? 'text-neon-cyan' : 'text-neon-yellow'
                }`}>
                  {message.role === 'assistant' ? 'StudyCore AI:' : 'You:'}
                </div>
                <div className="text-foreground">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="space-y-2">
                <div className="text-neon-cyan font-orbitron text-sm">StudyCore AI:</div>
                <div className="text-muted-foreground">Thinking...</div>
              </div>
            )}
          </div>
          
          {/* Voice Visualization */}
          <div className="flex justify-center mb-4">
            <div className={`flex items-end space-x-1 h-12 ${isRecording ? 'opacity-100' : 'opacity-30'}`}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-neon-cyan w-2 transition-all duration-300 ${
                    isRecording ? 'animate-voice-wave' : 'h-4'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 studycore-button py-3 px-4"
                disabled={isLoading}
                data-testid="button-start-recording"
              >
                <Mic className="w-4 h-4 mr-2" />
                START RECORDING
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 bg-neon-red border border-neon-red text-foreground py-3 px-4 font-orbitron neon-glow-hover transition-all duration-300"
                data-testid="button-stop-recording"
              >
                <MicOff className="w-4 h-4 mr-2" />
                STOP RECORDING
              </button>
            )}
            
            <div className="flex-1 flex">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 bg-input border border-border text-foreground py-3 px-4 font-poppins outline-none focus:border-neon-cyan"
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={isLoading || !inputText.trim()}
                className="studycore-button px-4"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
