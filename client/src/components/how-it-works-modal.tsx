import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Cpu, Download } from "lucide-react";

export function HowItWorksModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenModal = localStorage.getItem('hasSeenHowItWorksModal');
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenHowItWorksModal', 'true');
  };

  const steps = [
    {
      number: 1,
      title: "Describe Automation",
      description: "Tell us what you want to automate in plain English. No technical knowledge required!",
      icon: <MessageCircle className="w-6 h-6 text-blue-600" />,
      example: "Send me a Slack message when I receive urgent emails"
    },
    {
      number: 2,
      title: "Generate Workflow",
      description: "Our AI processes your request and creates a complete n8n workflow configuration.",
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      example: "AI analyzes and builds the automation logic"
    },
    {
      number: 3,
      title: "Copy & Import to n8n",
      description: "Download the JSON file and import it directly into your n8n instance. Ready to use!",
      icon: <Download className="w-6 h-6 text-green-600" />,
      example: "One-click download and import to n8n"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-slate-900">
            How It Works
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <p className="text-center text-slate-600 mb-8">
            Transform your automation ideas into working n8n workflows in just 3 simple steps
          </p>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Step {step.number}
                    </Badge>
                    <h3 className="font-semibold text-slate-900">
                      {step.title}
                    </h3>
                  </div>
                  
                  <p className="text-slate-600 mb-2">
                    {step.description}
                  </p>
                  
                  <p className="text-sm text-slate-500 italic">
                    {step.example}
                  </p>
                </div>
                

              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">💡</span>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  Be specific about your automation needs. The more details you provide, 
                  the better our AI can create the perfect workflow for you!
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button onClick={handleClose} className="px-8">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}