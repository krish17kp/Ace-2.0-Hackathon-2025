import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, RotateCcw, Brain, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

export const EmotionDetector = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'neutral'];

  // Mock emotion detection (in a real app, you'd use ML models like face-api.js)
  const analyzeEmotion = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Draw current frame to canvas for analysis
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Mock emotion detection with random results (replace with real ML model)
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = 0.6 + Math.random() * 0.4; // 60-100% confidence

    const emotionData: EmotionData = {
      emotion,
      confidence,
      timestamp: new Date()
    };

    setCurrentEmotion(emotionData);
    setEmotionHistory(prev => [...prev.slice(-9), emotionData]); // Keep last 10 readings
  }, [emotions]);

  const startCamera = async () => {
    try {
      setIsAnalyzing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setIsActive(true);
          setIsAnalyzing(false);
          toast.success("Camera activated! Emotion detection starting...");
          
          // Start emotion analysis every 2 seconds
          analysisIntervalRef.current = setInterval(analyzeEmotion, 2000);
        };
      }
    } catch (error) {
      setIsAnalyzing(false);
      console.error('Error accessing camera:', error);
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    setIsActive(false);
    setCurrentEmotion(null);
    toast.info("Camera stopped");
  };

  const resetAnalysis = () => {
    setEmotionHistory([]);
    setCurrentEmotion(null);
    toast.success("Analysis reset");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'emotion-happy',
      sad: 'emotion-sad',
      angry: 'emotion-angry',
      surprised: 'emotion-surprised',
      fearful: 'emotion-fearful',
      neutral: 'emotion-neutral'
    };
    return colors[emotion as keyof typeof colors] || 'emotion-neutral';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 gradient-card shadow-emotion">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-wellness">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Real-time Emotion Detection</h3>
              <p className="text-muted-foreground">Analyze your emotional state through facial expressions</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={isActive ? "destructive" : "default"}
              onClick={isActive ? stopCamera : startCamera}
              disabled={isAnalyzing}
              className="transition-bounce"
            >
              {isAnalyzing ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : isActive ? (
                <CameraOff className="h-4 w-4" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {isAnalyzing ? "Starting..." : isActive ? "Stop Camera" : "Start Camera"}
            </Button>
            
            {emotionHistory.length > 0 && (
              <Button variant="outline" onClick={resetAnalysis}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Camera Feed */}
        <div className="relative rounded-lg overflow-hidden bg-muted">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-64 object-cover transition-opacity duration-300 ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Click "Start Camera" to begin emotion detection</p>
              </div>
            </div>
          )}

          {/* Current Emotion Overlay */}
          {currentEmotion && isActive && (
            <div className="absolute top-4 right-4">
              <Badge 
                className={`text-lg px-4 py-2 ${getEmotionColor(currentEmotion.emotion)} border transition-smooth`}
              >
                {currentEmotion.emotion.charAt(0).toUpperCase() + currentEmotion.emotion.slice(1)}
                <span className="ml-2 text-sm opacity-75">
                  {Math.round(currentEmotion.confidence * 100)}%
                </span>
              </Badge>
            </div>
          )}
        </div>

        {/* Current Analysis */}
        {currentEmotion && (
          <div className="mt-6 p-4 rounded-lg gradient-card border">
            <h4 className="font-semibold mb-2">Current Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Detected Emotion</p>
                <p className="font-medium capitalize">{currentEmotion.emotion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence Level</p>
                <p className="font-medium">{Math.round(currentEmotion.confidence * 100)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p className="font-medium">{currentEmotion.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Emotion History */}
      {emotionHistory.length > 0 && (
        <Card className="p-6 gradient-card shadow-soft">
          <h4 className="font-semibold mb-4">Emotion Timeline</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {emotionHistory.slice(-10).map((emotion, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border text-center transition-smooth hover:scale-105 ${getEmotionColor(emotion.emotion)}`}
              >
                <p className="font-medium capitalize">{emotion.emotion}</p>
                <p className="text-xs opacity-75">{emotion.timestamp.toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 border-blue-200 bg-blue-50">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900">How it works</h5>
            <p className="text-sm text-blue-700 mt-1">
              Look directly at the camera with good lighting. The system analyzes your facial expressions 
              every 2 seconds to detect your emotional state. Make sure your face is clearly visible.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};