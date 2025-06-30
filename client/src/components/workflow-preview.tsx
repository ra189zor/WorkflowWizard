import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Zap, Settings, Database, Globe, MessageSquare } from "lucide-react";
import type { N8nWorkflow, N8nNode } from "@/lib/types";

interface WorkflowPreviewProps {
  workflow: N8nWorkflow;
  className?: string;
}

interface AnimatedNode extends N8nNode {
  x: number;
  y: number;
  isActive: boolean;
  isCompleted: boolean;
  delay: number;
}

interface ConnectionPath {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  progress: number;
}

export function WorkflowPreview({ workflow, className = "" }: WorkflowPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedNodes, setAnimatedNodes] = useState<AnimatedNode[]>([]);
  const [connections, setConnections] = useState<ConnectionPath[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Initialize nodes and connections
  useEffect(() => {
    if (!workflow?.nodes?.length) return;

    const nodes = workflow.nodes.map((node, index) => {
      // Calculate positions in a grid layout
      const cols = Math.ceil(Math.sqrt(workflow.nodes.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      return {
        ...node,
        x: 100 + col * 200,
        y: 80 + row * 120,
        isActive: false,
        isCompleted: false,
        delay: index * 800, // Stagger animation
      };
    });

    setAnimatedNodes(nodes);

    // Generate connections based on workflow connections
    const connectionPaths: ConnectionPath[] = [];
    const workflowConnections = workflow.connections || {};

    Object.entries(workflowConnections).forEach(([fromNodeName, connections]) => {
      const fromNode = nodes.find(n => n.name === fromNodeName);
      if (!fromNode) return;

      connections.main?.forEach((mainConnections) => {
        mainConnections?.forEach((connection) => {
          const toNode = nodes.find(n => n.name === connection.node);
          if (toNode) {
            connectionPaths.push({
              from: { x: fromNode.x + 80, y: fromNode.y + 30 },
              to: { x: toNode.x, y: toNode.y + 30 },
              isActive: false,
              progress: 0,
            });
          }
        });
      });
    });

    setConnections(connectionPaths);
  }, [workflow]);

  // Animation logic
  useEffect(() => {
    if (!isPlaying || !animatedNodes.length) return;

    const animate = () => {
      setAnimatedNodes(prev => 
        prev.map((node, index) => {
          const shouldBeActive = index <= currentStep;
          const shouldBeCompleted = index < currentStep;
          
          return {
            ...node,
            isActive: shouldBeActive,
            isCompleted: shouldBeCompleted,
          };
        })
      );

      setConnections(prev =>
        prev.map((conn, index) => ({
          ...conn,
          isActive: index < currentStep,
          progress: index < currentStep ? 100 : (index === currentStep ? 50 : 0),
        }))
      );

      if (currentStep < animatedNodes.length - 1) {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 1200);
      } else {
        setIsPlaying(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, animatedNodes.length]);

  const handlePlay = () => {
    if (currentStep >= animatedNodes.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setAnimatedNodes(prev => 
      prev.map(node => ({ ...node, isActive: false, isCompleted: false }))
    );
    setConnections(prev =>
      prev.map(conn => ({ ...conn, isActive: false, progress: 0 }))
    );
  };

  const getNodeIcon = (nodeType: string) => {
    const type = nodeType.toLowerCase();
    
    // Enhanced icons with brand recognition
    if (type.includes('slack')) return '💬';
    if (type.includes('gmail') || type.includes('email')) return '📧';
    if (type.includes('sheets')) return '📊';
    if (type.includes('airtable')) return '🗃️';
    if (type.includes('notion')) return '📝';
    if (type.includes('discord')) return '🎮';
    if (type.includes('twitter')) return '🐦';
    if (type.includes('dropbox')) return '📦';
    if (type.includes('drive')) return '📁';
    if (type.includes('webhook') || type.includes('http')) return '🔗';
    if (type.includes('trigger')) return '⚡';
    if (type.includes('cron') || type.includes('schedule')) return '⏰';
    if (type.includes('filter')) return '🔍';
    if (type.includes('if')) return '❓';
    if (type.includes('set')) return '⚙️';
    if (type.includes('code')) return '💻';
    
    return '⚡';
  };

  const getNodeBrandColor = (node: AnimatedNode) => {
    const type = node.type.toLowerCase();
    
    if (node.isCompleted) {
      return 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 text-white shadow-lg';
    }
    if (node.isActive) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 text-white animate-pulse shadow-xl';
    }
    
    // Brand colors for inactive state
    if (type.includes('slack')) return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 text-purple-700 hover:border-purple-400';
    if (type.includes('gmail')) return 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 text-red-700 hover:border-red-400';
    if (type.includes('sheets')) return 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-green-700 hover:border-green-400';
    if (type.includes('airtable')) return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300 text-orange-700 hover:border-orange-400';
    if (type.includes('notion')) return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-700 hover:border-gray-400';
    if (type.includes('discord')) return 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-300 text-indigo-700 hover:border-indigo-400';
    if (type.includes('twitter')) return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-700 hover:border-blue-400';
    
    return 'bg-white border-slate-300 text-slate-700 hover:border-slate-400';
  };

  const getServiceName = (nodeType: string): string => {
    const type = nodeType.toLowerCase();
    
    if (type.includes('slack')) return 'Slack';
    if (type.includes('gmail')) return 'Gmail';
    if (type.includes('sheets')) return 'Sheets';
    if (type.includes('airtable')) return 'Airtable';
    if (type.includes('notion')) return 'Notion';
    if (type.includes('discord')) return 'Discord';
    if (type.includes('twitter')) return 'Twitter';
    if (type.includes('dropbox')) return 'Dropbox';
    if (type.includes('drive')) return 'Drive';
    if (type.includes('webhook')) return 'Webhook';
    if (type.includes('trigger')) return 'Trigger';
    if (type.includes('filter')) return 'Filter';
    if (type.includes('if')) return 'Condition';
    if (type.includes('set')) return 'Transform';
    if (type.includes('code')) return 'Code';
    
    return nodeType.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || 'Node';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Workflow Preview</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Interactive execution simulation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isPlaying}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? handlePause : handlePlay}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={canvasRef}
          className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden border border-slate-200"
          style={{ 
            minHeight: '400px',
            height: `${Math.max(400, Math.ceil(animatedNodes.length / Math.ceil(Math.sqrt(animatedNodes.length))) * 120 + 160)}px`
          }}
        >
          {/* Connection Lines */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {connections.map((connection, index) => (
              <g key={index}>
                {/* Base line */}
                <line
                  x1={connection.from.x}
                  y1={connection.from.y}
                  x2={connection.to.x}
                  y2={connection.to.y}
                  stroke="#e2e8f0"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {/* Animated progress line */}
                {connection.progress > 0 && (
                  <line
                    x1={connection.from.x}
                    y1={connection.from.y}
                    x2={
                      connection.from.x + 
                      (connection.to.x - connection.from.x) * (connection.progress / 100)
                    }
                    y2={
                      connection.from.y + 
                      (connection.to.y - connection.from.y) * (connection.progress / 100)
                    }
                    stroke="#3b82f6"
                    strokeWidth="3"
                    className="animate-pulse"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;10"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </line>
                )}
                {/* Arrow head */}
                {connection.isActive && (
                  <polygon
                    points={`${connection.to.x-8},${connection.to.y-4} ${connection.to.x},${connection.to.y} ${connection.to.x-8},${connection.to.y+4}`}
                    fill="#3b82f6"
                    className="animate-pulse"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Enhanced Nodes with Brand Styling */}
          {animatedNodes.map((node, index) => (
            <div
              key={node.id}
              className={`absolute transition-all duration-300 transform ${
                node.isActive ? 'scale-110' : 'scale-100'
              }`}
              style={{
                left: node.x,
                top: node.y,
                zIndex: 2,
              }}
            >
              <div className={`
                relative p-4 rounded-xl border-2 shadow-lg transition-all duration-300
                ${getNodeBrandColor(node)}
                ${node.isActive ? 'shadow-2xl' : 'shadow-md'}
              `}>
                {/* Execution indicator */}
                {node.isActive && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                )}
                {node.isCompleted && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full">
                    <div className="w-full h-full bg-green-600 rounded-full animate-pulse" />
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">
                    {getNodeIcon(node.type)}
                  </div>
                  <Badge 
                    variant={node.isCompleted ? "default" : "secondary"} 
                    className="text-xs font-medium"
                  >
                    {getServiceName(node.type)}
                  </Badge>
                </div>
                
                <div className="text-sm font-semibold truncate max-w-36 mb-1">
                  {node.name}
                </div>
                
                <div className="text-xs opacity-75">
                  {node.isCompleted ? 'Completed' : node.isActive ? 'Executing...' : 'Ready'}
                </div>
                
                {/* Progress indicator */}
                {node.isActive && (
                  <div className="mt-3 w-full bg-white bg-opacity-30 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full animate-pulse w-full" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Execution Status */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                }`} />
                <span className="font-medium">
                  {isPlaying ? 'Executing' : 'Ready'}
                </span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                Step {currentStep + 1} of {animatedNodes.length}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
            <div className="text-xs text-slate-600 space-y-2">
              <div className="flex justify-between space-x-6">
                <span>Duration:</span>
                <span className="font-medium">{(animatedNodes.length * 1.2).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between space-x-6">
                <span>Nodes:</span>
                <span className="font-medium">{animatedNodes.length}</span>
              </div>
              <div className="flex justify-between space-x-6">
                <span>Connections:</span>
                <span className="font-medium">{connections.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Log */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-slate-700">Execution Timeline</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {animatedNodes.map((node, index) => (
              <div 
                key={node.id}
                className={`text-xs p-3 rounded-lg flex items-center space-x-3 transition-all duration-300 ${
                  node.isCompleted 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : node.isActive 
                      ? 'bg-blue-50 text-blue-800 animate-pulse border border-blue-200' 
                      : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}
              >
                <div className="text-lg">
                  {getNodeIcon(node.type)}
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  node.isCompleted 
                    ? 'bg-green-500' 
                    : node.isActive 
                      ? 'bg-blue-500' 
                      : 'bg-slate-300'
                }`} />
                <span className="flex-1 font-medium">{node.name}</span>
                <Badge variant="outline" className="text-xs">
                  {getServiceName(node.type)}
                </Badge>
                <span className="text-xs opacity-60">
                  {node.isCompleted ? 'Completed' : node.isActive ? 'Executing...' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}