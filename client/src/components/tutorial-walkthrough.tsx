import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, X, Sparkles, MessageSquare, Download, History } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  icon: React.ReactNode;
  position: 'center' | 'left' | 'right';
}

export function TutorialWalkthrough() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Welcome to n8n Automation Generator!",
      content: "This interactive tutorial will show you how to create powerful automations using simple English descriptions. Let's get started!",
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      position: 'center'
    },
    {
      id: "templates",
      title: "Quick Templates",
      content: "Start with pre-built templates on the left sidebar. These are common automation patterns that you can use as inspiration or modify for your needs.",
      target: ".sidebar",
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      position: 'right'
    },
    {
      id: "chat",
      title: "Describe Your Automation",
      content: "Simply describe what you want to automate in plain English in the chat area. Be specific about triggers (when something happens) and actions (what should happen).",
      target: ".chat-input",
      icon: <MessageSquare className="w-6 h-6 text-green-600" />,
      position: 'center'
    },
    {
      id: "generation",
      title: "AI Workflow Generation",
      content: "Our AI will analyze your request and generate a complete n8n workflow. You'll see detailed progress messages as it works.",
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      position: 'center'
    },
    {
      id: "workflow-panel",
      title: "Generated Workflow",
      content: "The workflow appears on the right with a visual overview, node count, and the complete JSON configuration ready for n8n.",
      target: ".workflow-panel",
      icon: <Download className="w-6 h-6 text-orange-600" />,
      position: 'left'
    },
    {
      id: "recent",
      title: "Recent Workflows",
      content: "Your last 5 workflows are automatically saved locally. Click any recent workflow to reload it instantly.",
      target: ".recent-workflows",
      icon: <History className="w-6 h-6 text-gray-600" />,
      position: 'right'
    },
    {
      id: "complete",
      title: "You're Ready to Go!",
      content: "Try describing an automation like: 'Send me a Slack message when I receive emails containing urgent'. Have fun automating!",
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      position: 'center'
    }
  ];

  useEffect(() => {
    const hasSeenTutorialFlag = localStorage.getItem('hasSeenTutorial');
    const hasSeenHowItWorks = localStorage.getItem('hasSeenHowItWorksModal');
    
    // Show tutorial if user hasn't seen it and has seen the how-it-works modal
    if (!hasSeenTutorialFlag && hasSeenHowItWorks) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Show after welcome animation
      
      return () => clearTimeout(timer);
    }
    
    setHasSeenTutorial(!!hasSeenTutorialFlag);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, tutorialSteps.length]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(0);
    localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
  };

  const handleSkip = () => {
    handleClose();
  };

  const restartTutorial = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const currentStepData = tutorialSteps[currentStep];

  if (hasSeenTutorial) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={restartTutorial}
          className="bg-white shadow-lg hover:shadow-xl border"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Tutorial
        </Button>
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem('hasSeenTutorial');
              localStorage.removeItem('hasSeenHowItWorksModal');
              window.location.reload();
            }}
            className="bg-red-50 text-red-600 hover:bg-red-100 shadow-lg border text-xs"
          >
            Reset Tutorial
          </Button>
        )}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogTitle className="sr-only">Tutorial Walkthrough</DialogTitle>
        <DialogDescription className="sr-only">
          Interactive tutorial to learn how to use the n8n automation generator
        </DialogDescription>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute -top-2 -right-2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                {currentStepData.icon}
              </div>
            </div>
            
            <Badge variant="secondary" className="mb-2">
              Step {currentStep + 1} of {tutorialSteps.length}
            </Badge>
            
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {currentStepData.title}
            </h2>
            
            <p className="text-slate-600 leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-slate-500"
              >
                Skip Tutorial
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  "Get Started!"
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 text-center text-xs text-slate-400">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}