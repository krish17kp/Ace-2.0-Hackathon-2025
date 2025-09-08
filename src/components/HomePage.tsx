import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Camera, 
  Mic, 
  PenTool, 
  BarChart3, 
  TrendingUp,
  Heart,
  Target,
  Users,
  Award,
  Zap,
  Star
} from "lucide-react";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const features = [
    {
      id: 'camera',
      title: 'Camera Emotion Detection',
      description: 'Real-time facial emotion analysis using advanced computer vision',
      icon: Camera,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'voice',
      title: 'Voice Sentiment Analysis',
      description: 'Analyze emotional patterns in your speech and tone',
      icon: Mic,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'assessment',
      title: 'EQ Assessment',
      description: 'Comprehensive 12-question emotional intelligence evaluation',
      icon: Brain,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'journal',
      title: 'Emotional Journaling',
      description: 'AI-powered text analysis for emotional insights',
      icon: PenTool,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { label: 'EQ Score', value: '78', icon: Brain, color: 'text-blue-600' },
    { label: 'Sessions', value: '24', icon: Target, color: 'text-green-600' },
    { label: 'Streak', value: '7 days', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Level', value: 'Advanced', icon: Award, color: 'text-orange-600' }
  ];

  const recentActivity = [
    { type: 'camera', emotion: 'happy', confidence: 89, time: '2 hours ago' },
    { type: 'voice', emotion: 'calm', confidence: 76, time: '5 hours ago' },
    { type: 'journal', emotion: 'grateful', confidence: 92, time: '1 day ago' },
    { type: 'assessment', emotion: 'progress', confidence: 85, time: '3 days ago' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="p-8 gradient-card shadow-emotion text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-glow/10" />
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full gradient-wellness shadow-glow">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Emotional Intelligence Platform
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover, track, and enhance your emotional intelligence through cutting-edge AI analysis 
            across multiple channels: camera, voice, text, and comprehensive assessments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => onNavigate('assessment')}
              className="text-lg px-8 py-3"
            >
              <Brain className="h-5 w-5 mr-2" />
              Start Your EQ Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onNavigate('dashboard')}
              className="text-lg px-8 py-3"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              View Progress
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 gradient-card shadow-soft text-center hover:scale-105 transition-bounce">
              <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Explore EQ Analysis Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.id} 
                className="p-6 gradient-card shadow-emotion hover:scale-105 transition-bounce cursor-pointer group"
                onClick={() => onNavigate(feature.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient} shadow-soft`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-smooth">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        AI Powered
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Real-time
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 gradient-card shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Activity</h3>
          <Button variant="outline" size="sm" onClick={() => onNavigate('dashboard')}>
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border rounded-lg bg-background/50 hover:bg-background/70 transition-smooth">
              <div className="p-2 rounded-lg gradient-wellness">
                {activity.type === 'camera' && <Camera className="h-4 w-4 text-white" />}
                {activity.type === 'voice' && <Mic className="h-4 w-4 text-white" />}
                {activity.type === 'journal' && <PenTool className="h-4 w-4 text-white" />}
                {activity.type === 'assessment' && <Brain className="h-4 w-4 text-white" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium capitalize">{activity.type} Analysis</span>
                  <Badge variant="outline" className="text-xs">
                    {activity.emotion}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <Progress value={activity.confidence} className="h-2 w-16" />
                    <span className="text-sm font-medium">{activity.confidence}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="p-8 gradient-card shadow-emotion text-center">
        <div className="max-w-md mx-auto">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to Enhance Your EQ?</h3>
          <p className="text-muted-foreground mb-6">
            Take the next step in your emotional intelligence journey with our comprehensive assessment.
          </p>
          <Button 
            variant="wellness" 
            size="lg"
            onClick={() => onNavigate('assessment')}
            className="shadow-glow"
          >
            <Target className="h-5 w-5 mr-2" />
            Begin Assessment
          </Button>
        </div>
      </Card>
    </div>
  );
};