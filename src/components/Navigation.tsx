import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Camera, 
  Mic, 
  PenTool, 
  BarChart3, 
  Home, 
  Menu,
  X
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, description: 'Welcome & Overview' },
    { id: 'camera', label: 'Camera', icon: Camera, description: 'Emotion Detection' },
    { id: 'voice', label: 'Voice', icon: Mic, description: 'Voice Analysis' },
    { id: 'assessment', label: 'Assessment', icon: Brain, description: 'EQ Test' },
    { id: 'journal', label: 'Journal', icon: PenTool, description: 'Text Analysis' },
    { id: 'dashboard', label: 'Progress', icon: BarChart3, description: 'Analytics' },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden md:block p-4 gradient-card shadow-emotion sticky top-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "hero" : "ghost"}
                className={`w-full justify-start h-auto p-4 ${
                  isActive ? 'shadow-glow' : ''
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Mobile Navigation Header */}
      <div className="md:hidden">
        <Card className="p-4 gradient-card shadow-emotion mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-wellness">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">EQ Platform</h1>
                <p className="text-sm text-muted-foreground">Emotional Intelligence</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </Card>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden">
            <div className="fixed inset-y-0 left-0 w-80 bg-background border-r shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-wellness">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">EQ Platform</h2>
                      <p className="text-sm text-muted-foreground">Navigation</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "hero" : "ghost"}
                        className={`w-full justify-start h-auto p-4 ${
                          isActive ? 'shadow-glow' : ''
                        }`}
                        onClick={() => handleNavClick(item.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Icon className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs opacity-75">{item.description}</div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex-col h-auto py-2 px-3 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};