import { X } from "lucide-react";

interface VideoPopupProps {
  video: {
    videoId: string;
    title: string;
    channel: string;
  };
  onClose: () => void;
}

export default function VideoPopup({ video, onClose }: VideoPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-40 flex items-center justify-center p-4">
      <div className="bg-card border-2 border-neon-cyan max-w-4xl w-full">
        <div className="flex justify-between items-center p-4 border-b border-neon-cyan">
          <h3 className="font-orbitron text-lg text-neon-cyan">YOUTUBE RESOURCE</h3>
          <button
            onClick={onClose}
            className="text-foreground hover:text-neon-cyan transition-colors"
            data-testid="button-close-video-popup"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="aspect-video bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              frameBorder="0"
              allowFullScreen
              title={video.title}
              data-testid="iframe-youtube-video"
            />
          </div>
          <div className="mt-4">
            <h4 className="font-orbitron text-foreground text-xl mb-2">{video.title}</h4>
            <p className="text-muted-foreground">{video.channel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
