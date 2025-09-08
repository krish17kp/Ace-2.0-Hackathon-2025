import { useState } from "react";
import { HomePage } from "@/components/HomePage";
import { Navigation } from "@/components/Navigation";
import { EmotionDetector } from "@/components/EmotionDetector";
import { VoiceAnalyzer } from "@/components/VoiceAnalyzer";
import { EQAssessment } from "@/components/EQAssessment";
import { TextJournal } from "@/components/TextJournal";
import { ProgressDashboard } from "@/components/ProgressDashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} />;
      case 'camera':
        return <EmotionDetector />;
      case 'voice':
        return <VoiceAnalyzer />;
      case 'assessment':
        return <EQAssessment />;
      case 'journal':
        return <TextJournal />;
      case 'dashboard':
        return <ProgressDashboard />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 lg:shrink-0">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-h-0 pb-20 md:pb-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
