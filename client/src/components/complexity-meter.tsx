import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Zap, 
  Settings, 
  Network, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Clock,
  Layers
} from "lucide-react";
import type { N8nWorkflow } from "@/lib/types";

interface ComplexityAnalysis {
  score: number;
  level: 'Simple' | 'Moderate' | 'Complex' | 'Advanced';
  factors: {
    nodeCount: number;
    integrationCount: number;
    conditionalLogic: number;
    errorHandling: number;
    dataTransformation: number;
    asyncOperations: number;
  };
  estimatedSetupTime: string;
  skillLevel: string;
  recommendations: string[];
}

interface ComplexityMeterProps {
  workflow: N8nWorkflow;
  className?: string;
}

export function ComplexityMeter({ workflow, className = "" }: ComplexityMeterProps) {
  const analyzeComplexity = (workflow: N8nWorkflow): ComplexityAnalysis => {
    const nodes = workflow.nodes || [];
    const nodeCount = nodes.length;
    
    // Count unique integrations (node types)
    const integrationTypes = new Set(nodes.map(node => node.type.split('.')[0]));
    const integrationCount = integrationTypes.size;
    
    // Analyze conditional logic (IF nodes, Switch nodes, etc.)
    const conditionalNodes = nodes.filter(node => 
      node.type.includes('If') || 
      node.type.includes('Switch') || 
      node.type.includes('Merge') ||
      node.type.includes('Router')
    );
    const conditionalLogic = conditionalNodes.length;
    
    // Analyze error handling (error workflows, try-catch patterns)
    const errorHandlingNodes = nodes.filter(node => 
      node.type.includes('ErrorTrigger') ||
      node.type.includes('StopAndError') ||
      (node.parameters && node.parameters.continueOnFail)
    );
    const errorHandling = errorHandlingNodes.length;
    
    // Analyze data transformation complexity
    const transformationNodes = nodes.filter(node => 
      node.type.includes('Code') ||
      node.type.includes('Function') ||
      node.type.includes('Set') ||
      node.type.includes('Edit') ||
      node.type.includes('Transform')
    );
    const dataTransformation = transformationNodes.length;
    
    // Analyze async operations (webhooks, triggers, delays)
    const asyncNodes = nodes.filter(node => 
      node.type.includes('Webhook') ||
      node.type.includes('Trigger') ||
      node.type.includes('Wait') ||
      node.type.includes('Schedule')
    );
    const asyncOperations = asyncNodes.length;
    
    // Calculate complexity score (0-100)
    let score = 0;
    score += Math.min(nodeCount * 3, 30); // Max 30 points for node count
    score += Math.min(integrationCount * 8, 24); // Max 24 points for integrations
    score += conditionalLogic * 12; // 12 points per conditional
    score += errorHandling * 8; // 8 points per error handling
    score += dataTransformation * 10; // 10 points per transformation
    score += asyncOperations * 6; // 6 points per async operation
    
    score = Math.min(score, 100);
    
    // Determine complexity level
    let level: ComplexityAnalysis['level'];
    let estimatedSetupTime: string;
    let skillLevel: string;
    
    if (score <= 25) {
      level = 'Simple';
      estimatedSetupTime = '5-15 minutes';
      skillLevel = 'Beginner friendly';
    } else if (score <= 50) {
      level = 'Moderate';
      estimatedSetupTime = '15-45 minutes';
      skillLevel = 'Basic n8n knowledge';
    } else if (score <= 75) {
      level = 'Complex';
      estimatedSetupTime = '45 minutes - 2 hours';
      skillLevel = 'Intermediate experience';
    } else {
      level = 'Advanced';
      estimatedSetupTime = '2+ hours';
      skillLevel = 'Advanced n8n user';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (nodeCount > 10) {
      recommendations.push('Consider breaking this into smaller, focused workflows');
    }
    
    if (integrationCount > 5) {
      recommendations.push('Test each integration connection before running the full workflow');
    }
    
    if (conditionalLogic > 2) {
      recommendations.push('Document your conditional logic for easier maintenance');
    }
    
    if (errorHandling === 0 && nodeCount > 3) {
      recommendations.push('Add error handling for more robust automation');
    }
    
    if (dataTransformation > 3) {
      recommendations.push('Consider using reusable functions for complex transformations');
    }
    
    if (asyncOperations > 2) {
      recommendations.push('Plan for proper timing and coordination between async operations');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('This workflow looks well-structured and ready to implement');
    }
    
    return {
      score,
      level,
      factors: {
        nodeCount,
        integrationCount,
        conditionalLogic,
        errorHandling,
        dataTransformation,
        asyncOperations
      },
      estimatedSetupTime,
      skillLevel,
      recommendations
    };
  };

  const analysis = analyzeComplexity(workflow);
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Simple': return 'text-green-600 bg-green-50 border-green-200';
      case 'Moderate': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Complex': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Simple': return <CheckCircle className="w-4 h-4" />;
      case 'Moderate': return <Zap className="w-4 h-4" />;
      case 'Complex': return <Settings className="w-4 h-4" />;
      case 'Advanced': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getProgressColor = (score: number) => {
    if (score <= 25) return 'bg-green-500';
    if (score <= 50) return 'bg-blue-500';
    if (score <= 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <TooltipProvider>
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
                  Complexity Analysis
                </h3>
              </div>
              <Badge className={`${getLevelColor(analysis.level)} flex items-center space-x-1 font-semibold`}>
                {getLevelIcon(analysis.level)}
                <span>{analysis.level}</span>
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-semibold">Complexity Score</span>
                <span className="font-bold">{analysis.score}/100</span>
              </div>
              <div className="relative">
                <Progress value={analysis.score} className="h-2" />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor(analysis.score)}`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>

            {/* Time and Skill Estimates */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-slate-600 font-semibold uppercase text-xs tracking-wide">Setup Time</div>
                  <div className="font-bold">{analysis.estimatedSetupTime}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-slate-600 font-semibold uppercase text-xs tracking-wide">Skill Level</div>
                  <div className="font-bold">{analysis.skillLevel}</div>
                </div>
              </div>
            </div>

            {/* Complexity Factors */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
                Complexity Factors
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="font-semibold">Nodes</span>
                      <span className="font-bold">{analysis.factors.nodeCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of workflow nodes</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="font-semibold">Integrations</span>
                      <span className="font-bold">{analysis.factors.integrationCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of different services connected</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="font-semibold">Logic</span>
                      <span className="font-bold">{analysis.factors.conditionalLogic}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Conditional and routing logic complexity</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="font-semibold">Transforms</span>
                      <span className="font-bold">{analysis.factors.dataTransformation}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data transformation and manipulation nodes</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-700 flex items-center space-x-1 uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
                <Info className="w-4 h-4" />
                <span>Recommendations</span>
              </h4>
              <div className="space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="text-xs text-slate-600 flex items-start space-x-2">
                    <div className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}