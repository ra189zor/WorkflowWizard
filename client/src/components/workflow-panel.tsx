import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, ExternalLink, Loader2, Play, BarChart3 } from "lucide-react";
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
      <div className="w-1/2 border-l border-slate-200 bg-white flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Generating Workflow</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Creating Your Automation</h4>
            <p className="text-slate-600">Analyzing your request and generating the n8n configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="w-1/2 border-l border-slate-200 bg-white flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Generated Workflow</h3>
          <p className="text-sm text-slate-500 mt-1">n8n JSON Configuration</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-300 rounded text-slate-600 text-xs flex items-center justify-center font-medium">
                n8
              </div>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">No Workflow Generated</h4>
            <p className="text-slate-600">Describe your automation needs to get started.</p>
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
    <div className="w-1/2 min-w-[600px] lg:w-2/5 xl:w-1/2 border-l border-slate-200 bg-white flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Generated Workflow</h3>
            <p className="text-sm text-slate-500 mt-1">n8n JSON Configuration</p>
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

      {/* Workflow Stats */}
      <div className="p-6 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{nodeCount}</div>
              <div className="text-xs text-slate-600">Nodes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{integrations.length}</div>
              <div className="text-xs text-slate-600">Integrations</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="preview" className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="preview" className="mt-4 h-full overflow-auto">
                <WorkflowPreview workflow={workflow} />
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-4 h-full overflow-auto">
                <ComplexityMeter workflow={workflow} />
              </TabsContent>
              
              <TabsContent value="overview" className="mt-4 h-full overflow-auto">
                <Card className="h-full">
                  <CardContent className="p-4 h-full overflow-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-slate-900">Workflow Structure</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open workflow in full-screen modal
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

        {/* Integration Requirements */}
        {integrations.length > 0 && (
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Required Integrations</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {integrations.map((integration, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-sm text-slate-700 capitalize">{integration}</span>
                  <span className="ml-auto px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                    Auth Required
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JSON Display */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex-shrink-0 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">n8n Workflow JSON</h4>
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
            <pre className="p-4 text-xs bg-slate-900 text-slate-100 min-h-full leading-relaxed">
              <code>
                {JSON.stringify(workflow, null, 2)}
              </code>
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-200 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center justify-center"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy JSON
            </Button>
            <Button
              onClick={downloadWorkflow}
              className="flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
    </div>
  );
}
