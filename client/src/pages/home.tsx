import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { WorkflowPanel } from "@/components/workflow-panel";
import { WorkflowModal } from "@/components/workflow-modal";
import { HowItWorksModal } from "@/components/how-it-works-modal";
import { TutorialWalkthrough } from "@/components/tutorial-walkthrough";
import { Github, ExternalLink } from "lucide-react";
import type { N8nWorkflow } from "@/lib/types";

export default function Home() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalWorkflow, setModalWorkflow] = useState<N8nWorkflow | null>(null);
  const [modalMode, setModalMode] = useState<'overview' | 'json'>('overview');

  useEffect(() => {
    const handleOpenWorkflowModal = (event: CustomEvent) => {
      setModalWorkflow(event.detail.workflow);
      setModalMode('overview');
    };

    const handleOpenJsonModal = (event: CustomEvent) => {
      setModalWorkflow(event.detail.workflow);
      setModalMode('json');
    };

    window.addEventListener('openWorkflowModal', handleOpenWorkflowModal as EventListener);
    window.addEventListener('openJsonModal', handleOpenJsonModal as EventListener);

    return () => {
      window.removeEventListener('openWorkflowModal', handleOpenWorkflowModal as EventListener);
      window.removeEventListener('openJsonModal', handleOpenJsonModal as EventListener);
    };
  }, []);

  const handleGitHubClick = () => {
    window.open('https://github.com/ra189zor/WorkflowWizard', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Enhanced Header with Perfect Visual Balance */}
      <header 
        className="bg-white sticky top-0 z-50" 
        style={{ 
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' 
        }}
      >
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Left Side - Brand Identity */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                WW
              </div>
              <h1 className="text-2xl text-slate-900" style={{ 
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '700',
                letterSpacing: '0.02em'
              }}>
                <span className="font-bold">Workflow</span>
                <span className="font-normal ml-1">Wizard</span>
              </h1>
            </div>

            {/* Right Side - Balanced Navigation with GitHub CTA */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Secondary Navigation Links */}
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                Templates
              </a>
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                Docs
              </a>
              
              {/* GitHub CTA Button - Perfect Outline Style with Brand Colors */}
              <button 
                onClick={handleGitHubClick}
                className="flex items-center space-x-2 px-4 py-2.5 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 rounded-lg font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-semibold">View Source</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
              </button>

              {/* Primary CTA Button */}
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sign In
              </button>
            </nav>

            {/* Mobile Menu Button (for smaller screens) */}
            <div className="md:hidden flex items-center space-x-3">
              <button 
                onClick={handleGitHubClick}
                className="flex items-center space-x-2 px-3 py-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Github className="w-4 h-4" />
                <span className="text-sm font-semibold">Source</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Enhanced Typography Throughout */}
      <div className="h-[calc(100vh-5rem)] p-8 lg:p-12">
        <div className="h-full grid grid-cols-[340px_1fr_640px] gap-8 max-w-[1900px] mx-auto">
          {/* Left Sidebar - Enhanced with Better Typography */}
          <div className="sidebar bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <Sidebar onSelectTemplate={setSelectedWorkflow} />
          </div>
          
          {/* Central Column - Dominant with Enhanced Visual Presence */}
          <div className="chat-input bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden" 
               style={{ 
                 backgroundColor: '#FAFAFA', 
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)' 
               }}>
            <ChatInterface 
              onWorkflowGenerated={setSelectedWorkflow}
              isGenerating={isGenerating}
              onGeneratingChange={setIsGenerating}
            />
          </div>

          {/* Right Panel - Enhanced with Better Visual Balance */}
          <div className="workflow-panel bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <WorkflowPanel 
              workflow={selectedWorkflow}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
      
      <HowItWorksModal />
      <TutorialWalkthrough />
      <WorkflowModal 
        workflow={modalWorkflow}
        isOpen={!!modalWorkflow}
        onClose={() => setModalWorkflow(null)}
        mode={modalMode}
      />
    </div>
  );
}