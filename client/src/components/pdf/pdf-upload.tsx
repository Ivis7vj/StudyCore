import { useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PDFUploadProps {
  onUploadSuccess: (documentId: string) => void;
}

interface UploadProgress {
  status: string;
  percentage: number;
}

export default function PDFUpload({ onUploadSuccess }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileUpload(pdfFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress({ status: "uploading", percentage: 0 });

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        
        if (progress < 30) {
          setUploadProgress({ status: "UPLOADING...", percentage: progress });
        } else if (progress < 70) {
          setUploadProgress({ status: "ANALYZING CONTENT...", percentage: progress });
        } else {
          setUploadProgress({ status: "EXTRACTING TOPICS...", percentage: progress });
        }
      }, 200);

      const response = await apiRequest('POST', '/api/upload', formData);
      const data = await response.json();

      clearInterval(progressInterval);
      setUploadProgress({ status: "READY!", percentage: 100 });

      // Poll for completion
      await pollDocumentStatus(data.documentId);
      
      setTimeout(() => {
        onUploadSuccess(data.documentId);
        setIsUploading(false);
        setUploadProgress(null);
      }, 1000);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(null);
      toast({
        title: "Upload Failed",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pollDocumentStatus = async (documentId: string) => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        try {
          const response = await apiRequest('GET', `/api/documents/${documentId}/status`);
          const status = await response.json();
          
          if (status.status === 'ready' || status.status === 'error') {
            clearInterval(interval);
            resolve();
          }
        } catch (error) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  };

  return (
    <div className="studycore-card p-6">
      <h3 className="font-orbitron text-lg text-neon-cyan mb-4">DOCUMENT UPLOAD</h3>
      
      <div
        className={`pdf-drop-zone bg-card p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging ? 'drag-over' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="pdf-drop-zone"
      >
        <Upload className="text-neon-cyan text-4xl mb-4 mx-auto w-16 h-16" />
        <p className="text-foreground font-orbitron mb-2">DRAG & DROP PDF FILE</p>
        <p className="text-muted-foreground text-sm mb-4">or click to browse</p>
        <button
          className="studycore-button px-6 py-2"
          disabled={isUploading}
          data-testid="button-browse-files"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              PROCESSING...
            </>
          ) : (
            'BROWSE FILES'
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-file-upload"
        />
      </div>

      {uploadProgress && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-foreground">Processing...</span>
            <span className="text-neon-cyan" data-testid="text-upload-percentage">
              {Math.round(uploadProgress.percentage)}%
            </span>
          </div>
          <div className="bg-card h-2 border border-border">
            <div 
              className="bg-neon-cyan h-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
              data-testid="progress-upload-bar"
            />
          </div>
          <div className="text-neon-cyan text-sm mt-2 font-orbitron" data-testid="text-upload-status">
            {uploadProgress.status}
          </div>
        </div>
      )}
    </div>
  );
}
