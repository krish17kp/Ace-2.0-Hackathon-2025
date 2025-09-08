import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Heart, 
  Users, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";

interface EmotionEntry {
  date: string;
  emotion: string;
  confidence: number;
  source: 'camera' | 'voice' | 'text';
}

interface EQProgress {
  date: string;
  overallScore: number;
  categoryScores: Record<string, number>;
}

// Mock data for demonstration
const mockEmotionData: EmotionEntry[] = [
  { date: '2024-01-15', emotion: 'happy', confidence: 85, source: 'camera' },
  { date: '2024-01-15', emotion: 'neutral', confidence: 78, source: 'voice' },
  { date: '2024-01-16', emotion: 'sad', confidence: 72, source: 'text' },
  { date: '2024-01-16', emotion: 'surprised', confidence: 90, source: 'camera' },
  { date: '2024-01-17', emotion: 'happy', confidence: 88, source: 'voice' },
  { date: '2024-01-17', emotion: 'angry', confidence: 65, source: 'camera' },
  { date: '2024-01-18', emotion: 'neutral', confidence: 82, source: 'text' },
  { date: '2024-01-18', emotion: 'happy', confidence: 91, source: 'voice' },
];

const mockEQProgress: EQProgress[] = [
  {
    date: '2024-01-01',
    overallScore: 65,
    categoryScores: {
      'self-awareness': 60,
      'self-regulation': 55,
      'motivation': 70,
      'empathy': 68,
      'social-skills': 72
    }
  },
  {
    date: '2024-01-15',
    overallScore: 72,
    categoryScores: {
      'self-awareness': 68,
      'self-regulation': 65,
      'motivation': 75,
      'empathy': 74,
      'social-skills': 78
    }
  }
];

export const ProgressDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  // Calculate emotion patterns
  const emotionStats = useMemo(() => {
    const emotionCounts = mockEmotionData.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalEntries = mockEmotionData.length;
    const emotionPercentages = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: (count / totalEntries) * 100
    }));

    return emotionPercentages.sort((a, b) => b.percentage - a.percentage);
  }, []);

  // Calculate EQ progression
  const eqProgression = useMemo(() => {
    if (mockEQProgress.length < 2) return null;
    
    const latest = mockEQProgress[mockEQProgress.length - 1];
    const previous = mockEQProgress[mockEQProgress.length - 2];
    
    const overallChange = latest.overallScore - previous.overallScore;
    const categoryChanges = Object.keys(latest.categoryScores).map(category => ({
      category,
      change: latest.categoryScores[category] - previous.categoryScores[category],
      current: latest.categoryScores[category]
    }));

    return {
      overallChange,
      categoryChanges,
      latest: latest.overallScore
    };
  }, []);

  // Source distribution
  const sourceStats = useMemo(() => {
    const sourceCounts = mockEmotionData.reduce((acc, entry) => {
      acc[entry.source] = (acc[entry.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = mockEmotionData.length;
    return Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
      percentage: (count / total) * 100
    }));
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

  const getCategoryIcon = (category: string) => {
    const icons = {
      'self-awareness': Brain,
      'self-regulation': Heart,
      'motivation': Target,
      'empathy': Users,
      'social-skills': Users
    };
    return icons[category as keyof typeof icons] || Brain;
  };

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 gradient-card shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{mockEmotionData.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 gradient-card shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current EQ Score</p>
              <p className="text-2xl font-bold">{eqProgression?.latest || 0}%</p>
            </div>
            <Brain className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 gradient-card shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 gradient-card shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
              <p className="text-2xl font-bold">82%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="emotions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emotions">Emotion Patterns</TabsTrigger>
          <TabsTrigger value="progress">EQ Progress</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Emotion Patterns Tab */}
        <TabsContent value="emotions" className="space-y-6">
          <Card className="p-6 gradient-card shadow-emotion">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Emotion Distribution</h3>
              <div className="flex gap-2">
                {['week', 'month', 'all'].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe as any)}
                  >
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Emotion Breakdown</h4>
                {emotionStats.map(({ emotion, count, percentage }) => (
                  <div key={emotion} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge className={`${getEmotionColor(emotion)} border`}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </Badge>
                      <span className="text-sm font-medium">
                        {count} times ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Recent Activity</h4>
                <div className="space-y-3">
                  {mockEmotionData.slice(-5).map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-background/50">
                      <Badge className={`${getEmotionColor(entry.emotion)} border text-xs`}>
                        {entry.emotion}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.confidence}% confidence
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {entry.source}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* EQ Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card className="p-6 gradient-card shadow-emotion">
            <h3 className="text-xl font-semibold mb-6">EQ Development Progress</h3>

            {eqProgression && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    {eqProgression.overallChange >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Overall Progress:</span>
                  </div>
                  <span className={`font-bold ${
                    eqProgression.overallChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {eqProgression.overallChange > 0 ? '+' : ''}{eqProgression.overallChange.toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Category Progress</h4>
                  {eqProgression.categoryChanges.map(({ category, change, current }) => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="capitalize">
                              {category.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{current}%</span>
                            <span className={`text-sm ${
                              change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ({change > 0 ? '+' : ''}{change.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <Progress value={current} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card className="p-6 gradient-card shadow-emotion">
            <h3 className="text-xl font-semibold mb-6">Data Collection Sources</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sourceStats.map(({ source, count, percentage }) => (
                <div key={source} className="text-center p-6 border rounded-lg bg-background/50">
                  <div className="mb-4">
                    {source === 'camera' && <Brain className="h-12 w-12 mx-auto text-primary" />}
                    {source === 'voice' && <Heart className="h-12 w-12 mx-auto text-primary" />}
                    {source === 'text' && <PieChart className="h-12 w-12 mx-auto text-primary" />}
                  </div>
                  <h4 className="font-semibold capitalize mb-2">{source} Analysis</h4>
                  <p className="text-2xl font-bold text-primary mb-1">{count}</p>
                  <p className="text-sm text-muted-foreground">
                    {percentage.toFixed(1)}% of total sessions
                  </p>
                  <Progress value={percentage} className="h-2 mt-3" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 gradient-card shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Positive Trends</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">
                    Your happiness detection has increased by 15% this week
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">
                    Voice emotion analysis shows improved confidence levels
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <span className="text-sm">
                    Social skills category shows consistent improvement
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 gradient-card shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Recommendations</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <span className="text-sm">
                    Practice self-regulation exercises during stressful moments
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <span className="text-sm">
                    Try voice journaling to improve emotional expression
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <span className="text-sm">
                    Focus on empathy building exercises this week
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          <Card className="p-6 gradient-card shadow-emotion">
            <h4 className="font-semibold mb-4">Weekly Goals</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg bg-background/50">
                <span>Complete 5 emotion detection sessions</span>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg bg-background/50">
                <span>Maintain 80%+ confidence in voice analysis</span>
                <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg bg-background/50">
                <span>Complete EQ assessment</span>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};