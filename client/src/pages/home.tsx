import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { WorkflowPanel } from "@/components/workflow-panel";
import { WorkflowModal } from "@/components/workflow-modal";
import { HowItWorksModal } from "@/components/how-it-works-modal";
import { TutorialWalkthrough } from "@/components/tutorial-walkthrough";
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enhanced Header with WorkflowWizard branding */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                WW
              </div>
              <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
                WorkflowWizard
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-600 hover:text-slate-900 font-semibold">Templates</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 font-semibold">Docs</a>
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Layout with improved spacing and visual hierarchy */}
      <div className="h-[calc(100vh-4rem)] p-8">
        <div className="h-full grid grid-cols-[320px_1fr_600px] gap-8 max-w-[1800px] mx-auto">
          {/* Left Sidebar */}
          <div className="sidebar bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <Sidebar onSelectTemplate={setSelectedWorkflow} />
          </div>
          
          {/* Central Column - Dominant */}
          <div className="chat-input bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden" 
               style={{ backgroundColor: '#FAFAFA', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
            <ChatInterface 
              onWorkflowGenerated={setSelectedWorkflow}
              isGenerating={isGenerating}
              onGeneratingChange={setIsGenerating}
            />
          </div>

          {/* Right Panel */}
          <div className="workflow-panel bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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