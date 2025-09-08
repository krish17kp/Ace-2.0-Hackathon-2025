import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PenTool, Save, Trash2, Calendar, TrendingUp, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  content: string;
  timestamp: Date;
  analysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    emotions: string[];
    confidence: number;
    keyThemes: string[];
    wordCount: number;
  };
}

interface EmotionalInsight {
  pattern: string;
  description: string;
  frequency: number;
}

export const TextJournal = () => {
  const [currentEntry, setCurrentEntry] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Mock text analysis (replace with real NLP/ML analysis)
  const analyzeText = useCallback((text: string) => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Simple sentiment analysis based on keywords
    const positiveWords = ['happy', 'joy', 'excited', 'grateful', 'love', 'amazing', 'wonderful', 'great', 'excellent', 'good'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'upset', 'worried', 'anxious', 'terrible', 'bad', 'awful', 'hate'];
    
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    else sentiment = 'neutral';

    // Detect emotions based on keywords
    const emotionKeywords = {
      happy: ['happy', 'joy', 'excited', 'cheerful', 'delighted'],
      sad: ['sad', 'depressed', 'melancholy', 'down', 'upset'],
      angry: ['angry', 'furious', 'annoyed', 'irritated', 'mad'],
      anxious: ['anxious', 'worried', 'nervous', 'stressed', 'concerned'],
      grateful: ['grateful', 'thankful', 'blessed', 'appreciative'],
      confused: ['confused', 'lost', 'uncertain', 'unclear', 'puzzled']
    };

    const detectedEmotions: string[] = [];
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        detectedEmotions.push(emotion);
      }
    });

    // Extract key themes (simplified)
    const commonThemes = ['work', 'family', 'relationship', 'health', 'goals', 'friends', 'stress', 'happiness'];
    const keyThemes = commonThemes.filter(theme => 
      text.toLowerCase().includes(theme)
    );

    // Calculate confidence based on text length and keyword matches
    const confidence = Math.min(90, 50 + (wordCount / 10) + (detectedEmotions.length * 10));

    return {
      sentiment,
      emotions: detectedEmotions.length > 0 ? detectedEmotions : ['neutral'],
      confidence,
      keyThemes,
      wordCount
    };
  }, []);

  const saveEntry = async () => {
    if (!currentEntry.trim()) {
      toast.error("Please write something before saving");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = analyzeText(currentEntry);
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      content: currentEntry,
      timestamp: new Date(),
      analysis
    };

    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry("");
    setIsAnalyzing(false);
    
    toast.success("Journal entry saved and analyzed!");
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
    toast.success("Entry deleted");
  };

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: 'bg-green-100 text-green-800 border-green-300',
      negative: 'bg-red-100 text-red-800 border-red-300',
      neutral: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'emotion-happy',
      sad: 'emotion-sad',
      angry: 'emotion-angry',
      anxious: 'emotion-fearful',
      grateful: 'emotion-happy',
      confused: 'emotion-neutral',
      neutral: 'emotion-neutral'
    };
    return colors[emotion as keyof typeof colors] || 'emotion-neutral';
  };

  // Calculate insights from entries
  const getInsights = (): EmotionalInsight[] => {
    if (entries.length === 0) return [];

    const emotionFreq: Record<string, number> = {};
    const themeFreq: Record<string, number> = {};

    entries.forEach(entry => {
      entry.analysis.emotions.forEach(emotion => {
        emotionFreq[emotion] = (emotionFreq[emotion] || 0) + 1;
      });
      entry.analysis.keyThemes.forEach(theme => {
        themeFreq[theme] = (themeFreq[theme] || 0) + 1;
      });
    });

    const insights: EmotionalInsight[] = [];

    // Most frequent emotion
    const topEmotion = Object.entries(emotionFreq).sort(([,a], [,b]) => b - a)[0];
    if (topEmotion) {
      insights.push({
        pattern: `Frequent ${topEmotion[0]} emotions`,
        description: `You've expressed ${topEmotion[0]} feelings in ${topEmotion[1]} out of ${entries.length} entries`,
        frequency: (topEmotion[1] / entries.length) * 100
      });
    }

    // Most frequent theme
    const topTheme = Object.entries(themeFreq).sort(([,a], [,b]) => b - a)[0];
    if (topTheme) {
      insights.push({
        pattern: `Focus on ${topTheme[0]}`,
        description: `${topTheme[0]} appears frequently in your reflections`,
        frequency: (topTheme[1] / entries.length) * 100
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Writing Interface */}
      <Card className="p-6 gradient-card shadow-emotion">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg gradient-wellness">
              <PenTool className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Emotional Journaling</h3>
              <p className="text-muted-foreground">Express your thoughts and emotions for AI-powered insights</p>
            </div>
          </div>

          <Textarea
            placeholder="How are you feeling today? Write about your emotions, experiences, or thoughts..."
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            className="min-h-32 resize-none border-2 focus:border-primary transition-smooth"
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {currentEntry.length} characters • {currentEntry.split(/\s+/).filter(w => w.length > 0).length} words
            </div>
            
            <Button 
              onClick={saveEntry}
              disabled={!currentEntry.trim() || isAnalyzing}
              className="transition-bounce"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save & Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="p-6 gradient-card shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Your Emotional Patterns</h4>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg bg-background/50">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{insight.pattern}</h5>
                  <Badge variant="outline">{insight.frequency.toFixed(0)}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                <Progress value={insight.frequency} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Journal Entries */}
      {entries.length > 0 && (
        <Card className="p-6 gradient-card shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Journal Entries ({entries.length})</h4>
          </div>

          <div className="space-y-4">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-smooth hover:bg-background/50 ${
                  selectedEntry?.id === entry.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm mb-3 line-clamp-2">{entry.content}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className={`${getSentimentColor(entry.analysis.sentiment)} border text-xs`}>
                    {entry.analysis.sentiment}
                  </Badge>
                  {entry.analysis.emotions.slice(0, 3).map((emotion, index) => (
                    <Badge key={index} className={`${getEmotionColor(emotion)} border text-xs`}>
                      {emotion}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    {entry.analysis.confidence.toFixed(0)}% confidence
                  </Badge>
                </div>

                {selectedEntry?.id === entry.id && (
                  <div className="mt-4 p-4 border-t bg-background/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium mb-2">Analysis Details</h6>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Word count:</span> {entry.analysis.wordCount}</p>
                          <p><span className="font-medium">Sentiment:</span> {entry.analysis.sentiment}</p>
                          <p><span className="font-medium">Emotions:</span> {entry.analysis.emotions.join(', ')}</p>
                        </div>
                      </div>
                      
                      {entry.analysis.keyThemes.length > 0 && (
                        <div>
                          <h6 className="font-medium mb-2">Key Themes</h6>
                          <div className="flex flex-wrap gap-1">
                            {entry.analysis.keyThemes.map((theme, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {entries.length === 0 && (
        <Card className="p-8 gradient-card shadow-soft text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold mb-2">Start Your Emotional Journey</h4>
          <p className="text-muted-foreground">
            Write your first journal entry to begin tracking your emotional patterns and insights.
          </p>
        </Card>
      )}
    </div>
  );
};