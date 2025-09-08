import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Brain, RotateCcw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  category: 'self-awareness' | 'self-regulation' | 'motivation' | 'empathy' | 'social-skills';
  question: string;
  options: string[];
  weights: number[]; // Scoring weights for each option
}

interface AssessmentResult {
  overallScore: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  improvements: string[];
  level: 'Developing' | 'Proficient' | 'Advanced' | 'Expert';
  completedAt: Date;
}

const questions: Question[] = [
  {
    id: 1,
    category: 'self-awareness',
    question: "How well do you understand your own emotions when they arise?",
    options: [
      "I rarely notice my emotions until they become overwhelming",
      "I sometimes recognize my emotions but struggle to understand why I feel them",
      "I generally understand my emotions and can identify their triggers",
      "I have excellent awareness of my emotions and their underlying causes"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 2,
    category: 'self-awareness',
    question: "When facing a stressful situation, how accurately can you predict your emotional response?",
    options: [
      "I have no idea how I'll react emotionally",
      "I can sometimes predict my reactions but am often surprised",
      "I usually know how I'll react emotionally to situations",
      "I can accurately predict and prepare for my emotional responses"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 3,
    category: 'self-regulation',
    question: "How do you handle anger or frustration in professional settings?",
    options: [
      "I often express anger immediately without thinking",
      "I struggle to control my anger but sometimes manage to hold back",
      "I can usually manage my anger and express it appropriately",
      "I effectively control my anger and channel it constructively"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 4,
    category: 'self-regulation',
    question: "When you make a mistake, how do you typically respond?",
    options: [
      "I become overwhelmed with negative emotions and shut down",
      "I feel bad but eventually move on without learning much",
      "I acknowledge the mistake, feel disappointed, but learn from it",
      "I view mistakes as learning opportunities and regulate my emotions effectively"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 5,
    category: 'motivation',
    question: "What drives you to achieve your goals?",
    options: [
      "External rewards and avoiding punishment",
      "Recognition from others and competitive success",
      "Personal satisfaction and meaningful achievement",
      "Intrinsic fulfillment and contributing to something greater"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 6,
    category: 'motivation',
    question: "How do you handle setbacks in pursuing your goals?",
    options: [
      "I give up quickly when things get difficult",
      "I persist for a while but eventually lose motivation",
      "I bounce back from setbacks with renewed determination",
      "I view setbacks as valuable feedback and maintain strong motivation"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 7,
    category: 'empathy',
    question: "How well can you sense what others are feeling without them telling you?",
    options: [
      "I rarely pick up on others' emotions unless they're very obvious",
      "I sometimes notice but often misinterpret others' emotions",
      "I'm generally good at reading others' emotional states",
      "I'm very skilled at sensing and understanding others' emotions"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 8,
    category: 'empathy',
    question: "When a friend is going through a difficult time, what's your typical response?",
    options: [
      "I feel uncomfortable and try to change the subject",
      "I offer practical advice to fix their problem",
      "I listen and try to understand their perspective",
      "I deeply connect with their emotions and provide both emotional and practical support"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 9,
    category: 'social-skills',
    question: "How do you handle conflicts with colleagues or friends?",
    options: [
      "I avoid conflict at all costs, even when resolution is needed",
      "I tend to get defensive and focus on being right",
      "I try to find compromise while expressing my needs",
      "I skillfully navigate conflicts to find win-win solutions"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 10,
    category: 'social-skills',
    question: "How effectively can you influence others to see your perspective?",
    options: [
      "I struggle to get others to understand my viewpoint",
      "I can sometimes convince others through persistence",
      "I'm generally able to communicate my perspective clearly",
      "I'm very skilled at influencing others through emotional intelligence"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 11,
    category: 'self-awareness',
    question: "How well do you recognize your personal strengths and weaknesses?",
    options: [
      "I have little insight into my abilities and limitations",
      "I have some awareness but often over or underestimate myself",
      "I have a realistic understanding of my strengths and weaknesses",
      "I have excellent self-knowledge and continuously work on self-improvement"
    ],
    weights: [1, 2, 3, 4]
  },
  {
    id: 12,
    category: 'motivation',
    question: "How do you maintain motivation during long-term projects?",
    options: [
      "I lose steam quickly and struggle to maintain focus",
      "I need frequent external motivation to keep going",
      "I can maintain motivation with occasional self-encouragement",
      "I maintain strong intrinsic motivation throughout long projects"
    ],
    weights: [1, 2, 3, 4]
  }
];

export const EQAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = (): AssessmentResult => {
    let totalScore = 0;
    const categoryScores: Record<string, { score: number; count: number }> = {};

    // Initialize category tracking
    questions.forEach(q => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { score: 0, count: 0 };
      }
    });

    // Calculate scores
    questions.forEach(question => {
      const answerIndex = answers[question.id];
      if (answerIndex !== undefined) {
        const score = question.weights[answerIndex];
        totalScore += score;
        categoryScores[question.category].score += score;
        categoryScores[question.category].count += 1;
      }
    });

    // Calculate percentages
    const maxPossibleScore = questions.length * 4;
    const overallScore = (totalScore / maxPossibleScore) * 100;

    const finalCategoryScores: Record<string, number> = {};
    Object.keys(categoryScores).forEach(category => {
      const { score, count } = categoryScores[category];
      finalCategoryScores[category] = (score / (count * 4)) * 100;
    });

    // Determine level
    let level: AssessmentResult['level'];
    if (overallScore >= 85) level = 'Expert';
    else if (overallScore >= 70) level = 'Advanced';
    else if (overallScore >= 55) level = 'Proficient';
    else level = 'Developing';

    // Identify strengths and improvements
    const sortedCategories = Object.entries(finalCategoryScores)
      .sort(([,a], [,b]) => b - a);

    const strengths = sortedCategories.slice(0, 2).map(([category]) => 
      category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );

    const improvements = sortedCategories.slice(-2).map(([category]) => 
      category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );

    return {
      overallScore,
      categoryScores: finalCategoryScores,
      strengths,
      improvements,
      level,
      completedAt: new Date()
    };
  };

  const completeAssessment = () => {
    const assessmentResult = calculateResults();
    setResult(assessmentResult);
    setIsCompleted(true);
    toast.success("Assessment completed! Check your results.");
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsCompleted(false);
    setResult(null);
    setIsStarted(false);
    toast.info("Assessment reset. You can start over.");
  };

  const startAssessment = () => {
    setIsStarted(true);
    toast.success("EQ Assessment started! Take your time with each question.");
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'self-awareness': 'bg-blue-100 text-blue-800',
      'self-regulation': 'bg-green-100 text-green-800',
      'motivation': 'bg-orange-100 text-orange-800',
      'empathy': 'bg-purple-100 text-purple-800',
      'social-skills': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Developing': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Proficient': 'bg-blue-100 text-blue-800 border-blue-300',
      'Advanced': 'bg-green-100 text-green-800 border-green-300',
      'Expert': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (!isStarted) {
    return (
      <Card className="p-8 gradient-card shadow-emotion text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full gradient-wellness">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-4">Start Your EQ Journey</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Take our comprehensive 12-question Emotional Intelligence Assessment to discover 
              your strengths and areas for growth across five key EQ domains.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 border rounded-lg bg-background/50">
                <h4 className="font-semibold mb-2">What You'll Discover</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your overall EQ level and score</li>
                  <li>• Strengths across 5 EQ domains</li>
                  <li>• Areas for improvement</li>
                  <li>• Personalized recommendations</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg bg-background/50">
                <h4 className="font-semibold mb-2">Assessment Details</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 12 carefully crafted questions</li>
                  <li>• 5-10 minutes to complete</li>
                  <li>• Based on scientific EQ research</li>
                  <li>• Immediate detailed results</li>
                </ul>
              </div>
            </div>
          </div>
          
          <Button size="lg" onClick={startAssessment} className="gradient-primary text-white shadow-glow">
            <Brain className="h-5 w-5 mr-2" />
            Start EQ Assessment
          </Button>
        </div>
      </Card>
    );
  }

  if (isCompleted && result) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card className="p-6 gradient-card shadow-emotion text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
          <p className="text-muted-foreground mb-4">
            Completed on {result.completedAt.toLocaleDateString()}
          </p>
          
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{Math.round(result.overallScore)}%</div>
              <p className="text-sm text-muted-foreground">Overall EQ Score</p>
            </div>
            
            <div className="text-center">
              <Badge className={`${getLevelColor(result.level)} border text-lg px-4 py-2`}>
                {result.level}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">EQ Level</p>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6 gradient-card shadow-soft">
          <h3 className="text-xl font-semibold mb-4">EQ Domain Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(result.categoryScores).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className={getCategoryColor(category)}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <span className="font-medium">{Math.round(score)}%</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 gradient-card shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Your Strengths</h4>
            </div>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 gradient-card shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Growth Opportunities</h4>
            </div>
            <ul className="space-y-2">
              {result.improvements.map((improvement, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button variant="outline" onClick={resetAssessment}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Take Assessment Again
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="p-4 gradient-card shadow-soft">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</span>
          <Badge className={getCategoryColor(question.category)}>
            {question.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Question */}
      <Card className="p-6 gradient-card shadow-emotion">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold leading-relaxed">{question.question}</h3>
          
          <RadioGroup
            value={currentAnswer?.toString()}
            onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
            className="space-y-4"
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-background/50 transition-smooth">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer leading-relaxed">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <Button 
          onClick={nextQuestion}
          disabled={currentAnswer === undefined}
          className="transition-bounce"
        >
          {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
};