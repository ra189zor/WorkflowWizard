import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Trash2 } from "lucide-react";
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
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Templates</h2>
        
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
                className="w-full text-left p-4 h-auto justify-start hover:border-primary hover:bg-blue-50 transition-colors group"
                onClick={() => handleTemplateClick(template)}
              >
                <div>
                  <div className="font-medium text-slate-900 group-hover:text-primary">
                    {template.name}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {template.description}
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>
      
      {/* Recent Workflows Section with increased spacing */}
      {recentWorkflows.length > 0 && (
        <div className="p-8 border-b border-slate-200 recent-workflows">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
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
                className="w-full text-left p-3 h-auto justify-start hover:bg-blue-50 transition-colors group"
                onClick={() => handleRecentWorkflowClick(workflow)}
              >
                <div className="flex items-start space-x-2 w-full">
                  <Clock className="w-3 h-3 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 group-hover:text-primary truncate">
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
        <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">
          Example Prompts
        </h3>
        <div className="space-y-3">
          {examplePrompts.map((prompt, index) => (
            <div
              key={index}
              className="text-sm text-slate-600 p-3 bg-slate-50 rounded cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => handlePromptClick(prompt)}
            >
              "{prompt}"
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}