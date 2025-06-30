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
    <aside className="w-full bg-white flex flex-col h-full">
      <div className="p-8 border-b border-slate-200">
        {/* Enhanced Section Header */}
        <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
          Quick Templates
        </h2>
        
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
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
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-4 h-4 text-blue-500 mt-1 group-hover:text-primary transition-colors" />
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                      {template.name}
                    </div>
                    <div className="text-sm text-slate-500 mt-1 group-hover:text-slate-600 transition-colors">
                      {template.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>
      
      {/* Recent Workflows Section with enhanced typography */}
      {recentWorkflows.length > 0 && (
        <div className="p-8 border-b border-slate-200 recent-workflows">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest" style={{ letterSpacing: '0.05em' }}>
              Recent Workflows
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
          
          <div className="space-y-3">
            {recentWorkflows.map((workflow) => (
              <Button
                key={workflow.id}
                variant="ghost"
                className="w-full text-left p-3 h-auto justify-start hover:bg-blue-50 transition-all duration-200 group hover:shadow-sm"
                onClick={() => handleRecentWorkflowClick(workflow)}
              >
                <div className="flex items-start space-x-2 w-full">
                  <Clock className="w-3 h-3 text-slate-400 mt-1 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-primary truncate transition-colors">
                      {workflow.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(workflow.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-8 flex-1">
        {/* Enhanced Section Header */}
        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest" style={{ letterSpacing: '0.05em' }}>
          Example Prompts
        </h3>
        <div className="space-y-3">
          {examplePrompts.map((prompt, index) => (
            <div
              key={index}
              className="text-sm text-slate-600 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 border border-transparent transition-all duration-200 hover:shadow-sm group"
              onClick={() => handlePromptClick(prompt)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 group-hover:bg-blue-500 transition-colors"></div>
                <span className="group-hover:text-slate-800 transition-colors leading-relaxed">
                  "{prompt}"
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                Click to try this example →
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}