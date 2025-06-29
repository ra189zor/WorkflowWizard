import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, X, Code, Eye, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkflowVisualization } from "./workflow-visualization";
import { WorkflowPreview } from "./workflow-preview";
import { ComplexityMeter } from "./complexity-meter";
import type { N8nWorkflow } from "@/lib/types";

interface WorkflowModalProps {
  workflow: N8nWorkflow | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'overview' | 'json';
}

export function WorkflowModal({ workflow, isOpen, onClose, mode = 'overview' }: WorkflowModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(mode);

  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const copyToClipboard = async () => {
    if (!workflow) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
      toast({
        title: "Copied to clipboard",
        description: "Workflow JSON has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy workflow to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadWorkflow = () => {
    if (!workflow) return;

    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name || 'workflow'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Workflow JSON file is being downloaded.",
    });
  };

  if (!workflow) return null;

  const nodeCount = workflow.nodes?.length || 0;
  const integrations = Array.from(new Set(
    workflow.nodes?.map(node => {
      const parts = node.type.split('.');
      return parts[parts.length - 1];
    }) || []
  ));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[90vw] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-slate-200">
          <DialogTitle className="sr-only">Workflow Modal</DialogTitle>
          <DialogDescription className="sr-only">
            Full-screen view of the generated workflow with detailed analysis and configuration
          </DialogDescription>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {workflow.name || 'Generated Workflow'}
              </h2>
              <p className="text-slate-600 mt-2">
                Complete workflow overview and configuration
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadWorkflow}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Workflow Stats */}
          <div className="flex items-center space-x-6 mt-4 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>{nodeCount} nodes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{integrations.length} integrations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>{Object.keys(workflow.connections || {}).length} connections</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="json" className="flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>JSON</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full p-6 overflow-auto">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                  {/* Main Visualization */}
                  <div className="xl:col-span-2">
                    <Card className="h-full">
                      <CardContent className="p-6 h-full">
                        <h3 className="text-lg font-semibold mb-4">Workflow Structure</h3>
                        <div className="h-full overflow-auto">
                          <WorkflowVisualization workflow={workflow} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Side Panel */}
                  <div className="space-y-6">
                    {/* Integrations */}
                    {integrations.length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3">Required Integrations</h4>
                          <div className="space-y-2">
                            {integrations.map((integration, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                <span className="text-sm capitalize">{integration}</span>
                                <Badge variant="secondary" className="text-xs">
                                  Auth Required
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Node Details */}
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Node Breakdown</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {workflow.nodes?.map((node, index) => (
                            <div key={node.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <div>
                                <div className="text-sm font-medium">{node.name}</div>
                                <div className="text-xs text-slate-500">{node.type}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                            </div>
                          )) || []}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="h-full p-6 overflow-auto">
                <WorkflowPreview workflow={workflow} className="h-full" />
              </TabsContent>

              <TabsContent value="analysis" className="h-full p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  <ComplexityMeter workflow={workflow} />
                </div>
              </TabsContent>

              <TabsContent value="json" className="h-full overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-semibold">Workflow JSON Configuration</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadWorkflow}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <pre className="p-6 text-sm bg-slate-900 text-slate-100 h-full font-mono leading-relaxed">
                      <code>
                        {JSON.stringify(workflow, null, 2)}
                      </code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}