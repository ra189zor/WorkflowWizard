
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

  const getNodeColor = (nodeType: string): string => {
    if (nodeType.includes('trigger') || nodeType.includes('webhook') || nodeType.includes('cron')) {
      return 'bg-blue-500';
    }
    if (nodeType.includes('gmail') || nodeType.includes('email')) {
      return 'bg-red-500';
    }
    if (nodeType.includes('slack') || nodeType.includes('discord')) {
      return 'bg-purple-500';
    }
    if (nodeType.includes('sheets') || nodeType.includes('airtable') || nodeType.includes('notion')) {
      return 'bg-green-500';
    }
    if (nodeType.includes('drive') || nodeType.includes('dropbox')) {
      return 'bg-yellow-500';
    }
    if (nodeType.includes('filter') || nodeType.includes('if') || nodeType.includes('set')) {
      return 'bg-orange-500';
    }
    return 'bg-slate-500';
  };

  const getNodeIcon = (nodeType: string): string => {
    if (nodeType.includes('trigger') || nodeType.includes('webhook')) return '🔗';
    if (nodeType.includes('cron') || nodeType.includes('schedule')) return '⏰';
    if (nodeType.includes('gmail') || nodeType.includes('email')) return '📧';
    if (nodeType.includes('slack')) return '💬';
    if (nodeType.includes('sheets')) return '📊';
    if (nodeType.includes('airtable')) return '🗃️';
    if (nodeType.includes('drive')) return '📁';
    if (nodeType.includes('dropbox')) return '📦';
    if (nodeType.includes('filter')) return '🔍';
    if (nodeType.includes('if')) return '❓';
    if (nodeType.includes('set')) return '⚙️';
    if (nodeType.includes('code')) return '💻';
    if (nodeType.includes('twitter')) return '🐦';
    return '⚡';
  };

  const phases = categorizeNodesByPhase(workflow.nodes);
  let nodeCounter = 0;

  return (
    <div className="space-y-6">
      {phases.map((phase, phaseIndex) => (
        <div key={phase.name} className="space-y-3">
          {/* Phase Header */}
          <div className={`${phase.bgColor} rounded-lg p-3 border-l-4 border-l-current ${phase.color}`}>
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
          <div className="space-y-3 pl-4">
            {phase.nodes.map((node, nodeIndex) => {
              nodeCounter++;
              return (
                <div key={`${node.id}-${nodeCounter}`}>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className={`w-8 h-8 ${getNodeColor(node.type)} rounded text-white text-xs flex items-center justify-center font-medium`}>
                      {nodeCounter}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 flex items-center space-x-2">
                        <span>{getNodeIcon(node.type)}</span>
                        <span>{node.name}</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        {node.type.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection line within phase */}
                  {nodeIndex < phase.nodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-px h-4 bg-slate-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Phase Separator */}
          {phaseIndex < phases.length - 1 && (
            <div className="flex items-center space-x-4 py-4">
              <Separator className="flex-1" />
              <div className="flex items-center space-x-2 text-slate-500">
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                </div>
                <span className="text-xs font-medium">NEXT PHASE</span>
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
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
