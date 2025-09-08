import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Play, Pause, Square, Download, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceAnalysis {
  emotion: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  energy: number;
  timestamp: Date;
}

interface Recording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  analysis: VoiceAnalysis;
  timestamp: Date;
}

export const VoiceAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<VoiceAnalysis | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Mock voice emotion analysis (replace with real ML model)
  const analyzeVoice = useCallback((audioBlob: Blob): VoiceAnalysis => {
    const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'neutral'];
    const sentiments = ['positive', 'negative', 'neutral'] as const;
    
    // Simulate complex voice analysis
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = 0.7 + Math.random() * 0.3;
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const energy = Math.random() * 100;

    return {
      emotion,
      confidence,
      sentiment,
      energy,
      timestamp: new Date()
    };
  }, []);

  // Real-time audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value) / dataArray.length;
      setAudioLevel(average);
      
      if (isRecording) {
        requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const analysis = analyzeVoice(audioBlob);
        
        const recording: Recording = {
          id: Date.now().toString(),
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          analysis,
          timestamp: new Date()
        };
        
        setRecordings(prev => [recording, ...prev]);
        setCurrentAnalysis(analysis);
        toast.success("Voice analysis complete!");
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start audio level monitoring
      monitorAudioLevel();
      
      toast.success("Recording started!");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const playRecording = (recording: Recording) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    
    const audio = new Audio(recording.url);
    audioPlayerRef.current = audio;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);
    
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      toast.error("Failed to play recording");
    });
  };

  const pausePlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => {
      const updated = prev.filter(r => r.id !== id);
      const deleted = prev.find(r => r.id === id);
      if (deleted) {
        URL.revokeObjectURL(deleted.url);
      }
      return updated;
    });
    toast.success("Recording deleted");
  };

  const downloadRecording = (recording: Recording) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `voice-recording-${recording.timestamp.toISOString().slice(0, 19)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      sad: 'bg-blue-100 text-blue-800 border-blue-300',
      angry: 'bg-red-100 text-red-800 border-red-300',
      surprised: 'bg-purple-100 text-purple-800 border-purple-300',
      fearful: 'bg-orange-100 text-orange-800 border-orange-300',
      neutral: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-600'
    };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
  };

  useEffect(() => {
    return () => {
      stopRecording();
      recordings.forEach(recording => URL.revokeObjectURL(recording.url));
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Recording Interface */}
      <Card className="p-6 gradient-card shadow-emotion">
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Voice Emotion Analysis</h3>
            <p className="text-muted-foreground">Record your voice to analyze emotional patterns and sentiment</p>
          </div>

          {/* Audio Level Visualizer */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="flex items-end gap-1 h-16">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 bg-primary rounded-t transition-all duration-150"
                      style={{
                        height: `${Math.max(4, (audioLevel / 255) * 64 * (1 + Math.sin((Date.now() / 100) + i) * 0.5))}px`
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Recording: {formatTime(recordingTime)}</p>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              className="transition-bounce shadow-glow"
            >
              {isRecording ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>

            {isPlaying && (
              <Button variant="outline" onClick={pausePlayback}>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Current Analysis */}
      {currentAnalysis && (
        <Card className="p-6 gradient-card shadow-soft">
          <h4 className="font-semibold mb-4">Latest Analysis Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Emotion</p>
              <Badge className={`${getEmotionColor(currentAnalysis.emotion)} border`}>
                {currentAnalysis.emotion.charAt(0).toUpperCase() + currentAnalysis.emotion.slice(1)}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Confidence</p>
              <p className="font-medium">{Math.round(currentAnalysis.confidence * 100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Sentiment</p>
              <p className={`font-medium capitalize ${getSentimentColor(currentAnalysis.sentiment)}`}>
                {currentAnalysis.sentiment}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Energy Level</p>
              <div className="space-y-1">
                <Progress value={currentAnalysis.energy} className="h-2" />
                <p className="text-sm font-medium">{Math.round(currentAnalysis.energy)}%</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recordings History */}
      {recordings.length > 0 && (
        <Card className="p-6 gradient-card shadow-soft">
          <h4 className="font-semibold mb-4">Voice Recordings ({recordings.length})</h4>
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div key={recording.id} className="p-4 border rounded-lg bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playRecording(recording)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    
                    <div>
                      <p className="font-medium">
                        {recording.timestamp.toLocaleDateString()} at {recording.timestamp.toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {formatTime(recording.duration)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className={`${getEmotionColor(recording.analysis.emotion)} border text-xs`}>
                        {recording.analysis.emotion}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(recording.analysis.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadRecording(recording)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRecording(recording.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};