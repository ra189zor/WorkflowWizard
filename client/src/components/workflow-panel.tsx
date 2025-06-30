import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, ExternalLink, Loader2, Play, BarChart3, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkflowVisualization } from "./workflow-visualization";
import { WorkflowPreview } from "./workflow-preview";
import { ComplexityMeter } from "./complexity-meter";
import type { N8nWorkflow } from "@/lib/types";

interface WorkflowPanelProps {
  workflow: N8nWorkflow | null;
  isGenerating: boolean;
}

export function WorkflowPanel({ workflow, isGenerating }: WorkflowPanelProps) {
  const { toast } = useToast();
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [previousWorkflow, setPreviousWorkflow] = useState<N8nWorkflow | null>(null);

  // Animation sequence when new workflow is generated
  useEffect(() => {
    if (workflow && workflow !== previousWorkflow && !isGenerating) {
      // Reset animation state
      setShowWorkflow(false);
      setAnimationStep(0);
      
      // Start animation sequence
      const animationSequence = async () => {
        // Step 1: Show workflow structure (500ms delay)
        setTimeout(() => {
          setAnimationStep(1);
          setShowWorkflow(true);
        }, 500);
        
        // Step 2: Show stats and tabs (800ms delay)
        setTimeout(() => {
          setAnimationStep(2);
        }, 1300);
        
        // Step 3: Show integration requirements (1100ms delay)
        setTimeout(() => {
          setAnimationStep(3);
        }, 2100);
        
        // Step 4: Show JSON and action buttons (1400ms delay)
        setTimeout(() => {
          setAnimationStep(4);
        }, 2800);
      };
      
      animationSequence();
      setPreviousWorkflow(workflow);
    }
  }, [workflow, isGenerating, previousWorkflow]);

  const copyToClipboard = async () => {
    if (!workflow) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
      toast({
        title: "JSON Copied!",
        description: "Workflow JSON copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadWorkflow = () => {
    if (!workflow) return;
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `n8n-workflow-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started!",
      description: "Your workflow JSON is being downloaded.",
    });
  };

  if (isGenerating) {
    return (
      <div className="w-full bg-white flex flex-col h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="p-8 border-b border-slate-200">
          <h3 className="text-xl text-slate-900" style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            letterSpacing: '0.025em'
          }}>
            <span className="font-bold">Generating</span>
            <span className="font-normal ml-1">Workflow</span>
          </h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* Enhanced loading animation with n8n branding */}
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                <div className="text-white font-bold text-lg">n8</div>
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto animate-ping opacity-20"></div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
            
            <h4 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Creating Your Automation
            </h4>
            <div className="space-y-2 text-slate-600 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Analyzing your request...</span>
              </div>
              <div className="text-sm opacity-75" style={{ fontFamily: 'Inter, sans-serif' }}>
                Building the perfect n8n workflow for you
              </div>
            </div>
            
            {/* Progress indicators */}
            <div className="mt-8 space-y-3">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className="w-2 h-2 rounded-full bg-blue-200 animate-pulse"
                    style={{ animationDelay: `${step * 200}ms` }}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                This usually takes 5-10 seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="w-full bg-white flex flex-col h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="p-8 border-b border-slate-200">
          <h3 className="text-xl text-slate-900" style={{ 
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            letterSpacing: '0.025em'
          }}>
            <span className="font-bold">Generated</span>
            <span className="font-normal ml-1">Workflow</span>
          </h3>
          <p className="text-sm text-slate-500 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            n8n JSON Configuration
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-300 rounded text-slate-600 text-xs flex items-center justify-center font-medium">
                n8
              </div>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              No Workflow Generated
            </h4>
            <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Describe your automation needs to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const nodeCount = workflow.nodes?.length || 0;
  const integrations = Array.from(new Set(
    workflow.nodes?.map(node => {
      const parts = node.type.split('.');
      return parts[parts.length - 1];
    }) || []
  ));

  return (
    <div className="w-full bg-white flex flex-col h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header - Always visible with Enhanced Typography */}
      <div className="p-8 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl text-slate-900" style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700',
              letterSpacing: '0.025em'
            }}>
              <span className="font-bold">Generated</span>
              <span className="font-normal ml-1">Workflow</span>
            </h3>
            <p className="text-sm text-slate-500 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              n8n JSON Configuration
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="text-slate-600 hover:text-slate-900"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadWorkflow}
              className="text-slate-600 hover:text-slate-900"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Animated Content with Enhanced Typography */}
      {showWorkflow && (
        <>
          {/* Workflow Stats - Animated Step 2 */}
          <div 
            className={`p-8 border-b border-slate-200 transition-all duration-700 ${
              animationStep >= 2 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-4'
            }`}
          >
            <div className="grid grid-cols-2 gap-6 mb-6">
              <Card className="transform transition-all duration-500" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary animate-pulse">{nodeCount}</div>
                  <div className="text-xs text-slate-600 font-semibold" style={{ 
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.05em'
                  }}>
                    NODES
                  </div>
                </CardContent>
              </Card>
              <Card className="transform transition-all duration-500" style={{ animationDelay: '200ms' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 animate-pulse">{integrations.length}</div>
                  <div className="text-xs text-slate-600 font-semibold" style={{ 
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.05em'
                  }}>
                    INTEGRATIONS
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Workflow Tabs - Animated Step 2 with Enhanced Typography */}
          <div 
            className={`flex-1 flex flex-col overflow-hidden transition-all duration-700 ${
              animationStep >= 2 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-4'
            }`}
            style={{ animationDelay: '300ms' }}
          >
            <div className="p-8 border-b border-slate-200 flex-shrink-0">
              <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                  <TabsTrigger value="preview" className="flex items-center space-x-2 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <Play className="w-4 h-4" />
                    <span>Preview</span>
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="flex items-center space-x-2 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <BarChart3 className="w-4 h-4" />
                    <span>Analysis</span>
                  </TabsTrigger>
                  <TabsTrigger value="overview" className="flex items-center space-x-2 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <ExternalLink className="w-4 h-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="preview" className="mt-6 h-full overflow-auto">
                    <WorkflowPreview workflow={workflow} />
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="mt-6 h-full overflow-auto">
                    <ComplexityMeter workflow={workflow} />
                  </TabsContent>
                  
                  <TabsContent value="overview" className="mt-6 h-full overflow-auto">
                    <Card className="h-full">
                      <CardContent className="p-6 h-full overflow-auto">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg text-slate-900" style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: '700',
                            letterSpacing: '0.025em'
                          }}>
                            <span className="font-bold">Workflow</span>
                            <span className="font-normal ml-1">Structure</span>
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const event = new CustomEvent('openWorkflowModal', { 
                                detail: { workflow } 
                              });
                              window.dispatchEvent(event);
                            }}
                            className="text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Full View
                          </Button>
                        </div>
                        <div className="overflow-auto">
                          <WorkflowVisualization workflow={workflow} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Integration Requirements - Animated Step 3 with Enhanced Typography */}
          {integrations.length > 0 && (
            <div 
              className={`p-8 border-b border-slate-200 flex-shrink-0 transition-all duration-700 ${
                animationStep >= 3 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-4'
              }`}
              style={{ animationDelay: '500ms' }}
            >
              <h4 className="text-lg text-slate-900 mb-4" style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: '700',
                letterSpacing: '0.025em'
              }}>
                <span className="font-bold">Required</span>
                <span className="font-normal ml-1">Integrations</span>
              </h4>
              <div className="space-y-3 max-h-32 overflow-y-auto">
                {integrations.map((integration, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 p-3 bg-orange-50 rounded-lg transform transition-all duration-500 ${
                      animationStep >= 3 ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-700 capitalize font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {integration}
                    </span>
                    <span className="ml-auto px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Auth Required
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JSON Display - Animated Step 4 with Enhanced Typography */}
          <div 
            className={`flex-1 overflow-hidden flex flex-col min-h-0 transition-all duration-700 ${
              animationStep >= 4 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-4'
            }`}
            style={{ animationDelay: '700ms' }}
          >
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex-shrink-0 flex items-center justify-between">
              <h4 className="text-lg text-slate-900" style={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: '700',
                letterSpacing: '0.025em'
              }}>
                <span className="font-bold">n8n Workflow</span>
                <span className="font-normal ml-1">JSON</span>
              </h4>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const event = new CustomEvent('openJsonModal', { 
                      detail: { workflow } 
                    });
                    window.dispatchEvent(event);
                  }}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Expand
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="p-6 text-xs bg-slate-900 text-slate-100 min-h-full leading-relaxed" style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}>
                <code>
                  {JSON.stringify(workflow, null, 2)}
                </code>
              </pre>
            </div>
          </div>

          {/* Action Buttons - Animated Step 4 with Enhanced Typography */}
          <div 
            className={`p-8 border-t border-slate-200 flex-shrink-0 transition-all duration-700 ${
              animationStep >= 4 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-4'
            }`}
            style={{ animationDelay: '900ms' }}
          >
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex items-center justify-center font-medium transform transition-all duration-300 hover:scale-105"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON
              </Button>
              <Button
                onClick={downloadWorkflow}
                className="flex items-center justify-center font-medium transform transition-all duration-300 hover:scale-105"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}