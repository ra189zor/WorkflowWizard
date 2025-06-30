import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Trash2, Sparkles } from "lucide-react";
import { useRecentWorkflows } from "@/hooks/use-local-storage";
import type { Template } from "@/lib/types";

interface SidebarProps {
  onSelectTemplate: (workflow: any) => void;
}

export function Sidebar({ onSelectTemplate }: SidebarProps) {
  const { data: templates, isLoading } = useQuery<{ success: boolean; data: Template[] }>({
    queryKey: ["/api/templates"],
  });

  const { recentWorkflows, clearWorkflows } = useRecentWorkflows();

  const examplePrompts = [
    "Send me a Slack message when I receive emails from my boss containing 'urgent'",
    "Sync new Airtable records to Google Sheets every hour",
    "When a CSV file is uploaded to Dropbox, process it and email me a summary",
    "Add new form submissions to CRM and send welcome email",
    "Post to Twitter when I publish a new blog post"
  ];

  const handleTemplateClick = (template: Template) => {
    onSelectTemplate(template.n8nJson);
  };

  const handleRecentWorkflowClick = (workflow: any) => {
    onSelectTemplate(workflow.workflow);
  };

  const handlePromptClick = (prompt: string) => {
    // Dispatch custom event to fill the chat input
    window.dispatchEvent(new CustomEvent('fillChatInput', { detail: prompt }));
  };

  return (
    <aside className="w-full bg-white flex flex-col h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="p-6 border-b border-slate-200">
        {/* Enhanced Section Header with Refined Typography */}
        <h2 className="text-lg text-slate-900 mb-4" style={{ 
          fontFamily: 'Inter, sans-serif',
          fontWeight: '700',
          letterSpacing: '0.025em'
        }}>
          <span className="font-bold">Quick</span>
          <span className="font-normal ml-1">Templates</span>
        </h2>
        
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </Card>
            ))
          ) : (
            templates?.data?.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="w-full text-left p-4 h-auto justify-start hover:border-primary hover:bg-blue-50 transition-all duration-200 group hover:shadow-md"
                onClick={() => handleTemplateClick(template)}
              >
                <div className="flex items-start space-x-3 w-full min-w-0">
                  <Sparkles className="w-4 h-4 text-blue-500 mt-1 group-hover:text-primary transition-colors flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm leading-tight mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {template.name}
                    </div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors leading-relaxed" style={{ 
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {template.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>
      
      {/* Recent Workflows Section with Enhanced Typography */}
      {recentWorkflows.length > 0 && (
        <div className="p-6 border-b border-slate-200 recent-workflows">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-slate-900" style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              letterSpacing: '0.025em'
            }}>
              <span className="font-semibold">Recent</span>
              <span className="font-normal ml-1">Workflows</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWorkflows}
              className="text-slate-500 hover:text-slate-700 p-1 h-auto"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {recentWorkflows.map((workflow) => (
              <Button
                key={workflow.id}
                variant="ghost"
                className="w-full text-left p-3 h-auto justify-start hover:bg-blue-50 transition-all duration-200 group hover:shadow-sm"
                onClick={() => handleRecentWorkflowClick(workflow)}
              >
                <div className="flex items-start space-x-3 w-full min-w-0">
                  <Clock className="w-3 h-3 text-slate-400 mt-1 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors" style={{ 
                      fontFamily: 'Inter, sans-serif',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {workflow.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {new Date(workflow.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-6 flex-1">
        {/* Enhanced Section Header with Refined Typography */}
        <h3 className="text-sm text-slate-900 mb-4" style={{ 
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          letterSpacing: '0.025em'
        }}>
          <span className="font-semibold">Example</span>
          <span className="font-normal ml-1">Prompts</span>
        </h3>
        <div className="space-y-3">
          {examplePrompts.map((prompt, index) => (
            <div
              key={index}
              className="text-sm text-slate-600 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 border border-transparent transition-all duration-200 hover:shadow-sm group"
              onClick={() => handlePromptClick(prompt)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 group-hover:bg-blue-500 transition-colors flex-shrink-0"></div>
                <span className="group-hover:text-slate-800 transition-colors" style={{ 
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '1.5',
                  fontSize: '0.875rem'
                }}>
                  "{prompt}"
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" style={{ fontFamily: 'Inter, sans-serif' }}>
                Click to try this example →
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}