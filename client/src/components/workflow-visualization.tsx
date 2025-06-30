import type { N8nWorkflow } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface WorkflowVisualizationProps {
  workflow: N8nWorkflow;
}

interface Phase {
  name: string;
  color: string;
  bgColor: string;
  nodes: any[];
}

export function WorkflowVisualization({ workflow }: WorkflowVisualizationProps) {
  if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8">
        No workflow data to visualize
      </div>
    );
  }

  const categorizeNodesByPhase = (nodes: any[]): Phase[] => {
    const phases: Phase[] = [
      { name: "Triggers & Input", color: "text-blue-700", bgColor: "bg-blue-50", nodes: [] },
      { name: "Processing & Logic", color: "text-orange-700", bgColor: "bg-orange-50", nodes: [] },
      { name: "Actions & Output", color: "text-green-700", bgColor: "bg-green-50", nodes: [] }
    ];

    nodes.forEach(node => {
      const nodeType = node.type.toLowerCase();
      
      // Trigger Phase
      if (nodeType.includes('trigger') || nodeType.includes('webhook') || 
          nodeType.includes('cron') || nodeType.includes('manual')) {
        phases[0].nodes.push(node);
      }
      // Action/Output Phase
      else if (nodeType.includes('slack') || nodeType.includes('discord') || 
               nodeType.includes('email') || nodeType.includes('gmail') || 
               nodeType.includes('sheets') || nodeType.includes('airtable') || 
               nodeType.includes('notion') || nodeType.includes('drive') || 
               nodeType.includes('dropbox') || nodeType.includes('aws')) {
        phases[2].nodes.push(node);
      }
      // Processing Phase (everything else)
      else {
        phases[1].nodes.push(node);
      }
    });

    // Filter out empty phases
    return phases.filter(phase => phase.nodes.length > 0);
  };

  const getNodeBrandColor = (nodeType: string): string => {
    const type = nodeType.toLowerCase();
    
    // Brand colors for popular services
    if (type.includes('slack')) return 'bg-gradient-to-br from-purple-500 to-purple-600';
    if (type.includes('gmail') || type.includes('email')) return 'bg-gradient-to-br from-red-500 to-red-600';
    if (type.includes('sheets') || type.includes('google')) return 'bg-gradient-to-br from-green-500 to-green-600';
    if (type.includes('airtable')) return 'bg-gradient-to-br from-yellow-500 to-orange-500';
    if (type.includes('notion')) return 'bg-gradient-to-br from-gray-800 to-gray-900';
    if (type.includes('discord')) return 'bg-gradient-to-br from-indigo-500 to-purple-600';
    if (type.includes('twitter')) return 'bg-gradient-to-br from-blue-400 to-blue-500';
    if (type.includes('dropbox')) return 'bg-gradient-to-br from-blue-600 to-blue-700';
    if (type.includes('drive')) return 'bg-gradient-to-br from-blue-500 to-green-500';
    if (type.includes('hubspot')) return 'bg-gradient-to-br from-orange-500 to-red-500';
    if (type.includes('webhook') || type.includes('http')) return 'bg-gradient-to-br from-blue-500 to-cyan-500';
    if (type.includes('trigger') || type.includes('cron')) return 'bg-gradient-to-br from-emerald-500 to-teal-600';
    if (type.includes('filter') || type.includes('if')) return 'bg-gradient-to-br from-amber-500 to-orange-500';
    if (type.includes('set') || type.includes('code')) return 'bg-gradient-to-br from-purple-500 to-indigo-600';
    
    // Default gradient
    return 'bg-gradient-to-br from-slate-500 to-slate-600';
  };

  const getNodeIcon = (nodeType: string): string => {
    const type = nodeType.toLowerCase();
    
    // Use actual service icons/emojis for better recognition
    if (type.includes('slack')) return '💬'; // Slack purple
    if (type.includes('gmail') || type.includes('email')) return '📧'; // Gmail red
    if (type.includes('sheets')) return '📊'; // Google Sheets green
    if (type.includes('airtable')) return '🗃️'; // Airtable orange
    if (type.includes('notion')) return '📝'; // Notion black
    if (type.includes('discord')) return '🎮'; // Discord purple
    if (type.includes('twitter')) return '🐦'; // Twitter blue
    if (type.includes('dropbox')) return '📦'; // Dropbox blue
    if (type.includes('drive')) return '📁'; // Google Drive
    if (type.includes('hubspot')) return '🏢'; // HubSpot orange
    if (type.includes('webhook') || type.includes('http')) return '🔗'; // Webhook
    if (type.includes('cron') || type.includes('schedule')) return '⏰'; // Schedule
    if (type.includes('trigger')) return '⚡'; // Trigger
    if (type.includes('filter')) return '🔍'; // Filter
    if (type.includes('if')) return '❓'; // Conditional
    if (type.includes('set')) return '⚙️'; // Set/Transform
    if (type.includes('code')) return '💻'; // Code
    
    return '⚡'; // Default
  };

  const getServiceName = (nodeType: string): string => {
    const type = nodeType.toLowerCase();
    
    if (type.includes('slack')) return 'Slack';
    if (type.includes('gmail')) return 'Gmail';
    if (type.includes('sheets')) return 'Google Sheets';
    if (type.includes('airtable')) return 'Airtable';
    if (type.includes('notion')) return 'Notion';
    if (type.includes('discord')) return 'Discord';
    if (type.includes('twitter')) return 'Twitter';
    if (type.includes('dropbox')) return 'Dropbox';
    if (type.includes('drive')) return 'Google Drive';
    if (type.includes('hubspot')) return 'HubSpot';
    if (type.includes('webhook')) return 'Webhook';
    if (type.includes('cron')) return 'Schedule';
    if (type.includes('trigger')) return 'Trigger';
    if (type.includes('filter')) return 'Filter';
    if (type.includes('if')) return 'Condition';
    if (type.includes('set')) return 'Transform';
    if (type.includes('code')) return 'Code';
    
    // Fallback to cleaned up type name
    return nodeType.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || 'Node';
  };

  const phases = categorizeNodesByPhase(workflow.nodes);
  let nodeCounter = 0;

  return (
    <div className="space-y-6">
      {phases.map((phase, phaseIndex) => (
        <div key={phase.name} className="space-y-4">
          {/* Phase Header */}
          <div className={`${phase.bgColor} rounded-lg p-4 border-l-4 border-l-current ${phase.color}`}>
            <div className="flex items-center justify-between">
              <h5 className={`font-semibold ${phase.color}`}>
                {phase.name}
              </h5>
              <Badge variant="secondary" className="text-xs">
                {phase.nodes.length} node{phase.nodes.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Phase Nodes */}
          <div className="space-y-4 pl-4">
            {phase.nodes.map((node, nodeIndex) => {
              nodeCounter++;
              return (
                <div key={`${node.id}-${nodeCounter}`}>
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Enhanced Node Icon with Brand Colors */}
                    <div className={`w-12 h-12 ${getNodeBrandColor(node.type)} rounded-xl text-white text-lg flex items-center justify-center font-medium shadow-lg relative overflow-hidden`}>
                      {/* Background pattern for visual interest */}
                      <div className="absolute inset-0 bg-white opacity-10 transform rotate-45 scale-150"></div>
                      <div className="relative z-10 flex flex-col items-center">
                        <span className="text-lg leading-none">{getNodeIcon(node.type)}</span>
                        <span className="text-xs font-bold leading-none mt-0.5">{nodeCounter}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 flex items-center space-x-3 mb-1">
                        <span>{node.name}</span>
                        <Badge variant="outline" className="text-xs font-medium">
                          {getServiceName(node.type)}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        {node.type.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      
                      {/* Additional visual indicators for node status */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-slate-500">Ready to configure</span>
                      </div>
                    </div>

                    {/* Connection indicator */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-3 h-3 border-2 border-slate-300 rounded-full bg-white"></div>
                      {nodeIndex < phase.nodes.length - 1 && (
                        <div className="w-px h-6 bg-slate-300"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced connection line within phase */}
                  {nodeIndex < phase.nodes.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="flex flex-col items-center">
                        <div className="w-px h-4 bg-gradient-to-b from-slate-300 to-slate-400"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <div className="w-px h-4 bg-gradient-to-b from-slate-400 to-slate-300"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Phase Separator */}
          {phaseIndex < phases.length - 1 && (
            <div className="flex items-center space-x-4 py-6">
              <Separator className="flex-1" />
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-slate-200">
                <div className="w-8 h-8 rounded-full border-2 border-blue-300 flex items-center justify-center bg-white">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-700">NEXT PHASE</span>
                <div className="w-8 h-8 rounded-full border-2 border-purple-300 flex items-center justify-center bg-white">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                </div>
              </div>
              <Separator className="flex-1" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}