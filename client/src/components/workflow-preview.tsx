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
    if (nodeType.includes('Trigger')) return <Zap className="w-4 h-4" />;
    if (nodeType.includes('HTTP') || nodeType.includes('Webhook')) return <Globe className="w-4 h-4" />;
    if (nodeType.includes('Database') || nodeType.includes('MySQL') || nodeType.includes('Postgres')) return <Database className="w-4 h-4" />;
    if (nodeType.includes('Slack') || nodeType.includes('Discord') || nodeType.includes('Teams')) return <MessageSquare className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  const getNodeColor = (node: AnimatedNode) => {
    if (node.isCompleted) return 'bg-green-500 border-green-600 text-white';
    if (node.isActive) return 'bg-blue-500 border-blue-600 text-white animate-pulse';
    return 'bg-white border-slate-300 text-slate-700 hover:border-slate-400';
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
          className="relative bg-slate-50 rounded-lg overflow-hidden"
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

          {/* Nodes */}
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
                relative p-3 rounded-lg border-2 shadow-lg transition-all duration-300
                ${getNodeColor(node)}
                ${node.isActive ? 'shadow-xl' : 'shadow-md'}
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

                <div className="flex items-center space-x-2 mb-2">
                  {getNodeIcon(node.type)}
                  <Badge variant={node.isCompleted ? "default" : "secondary"} className="text-xs">
                    {node.type.split('.').pop()}
                  </Badge>
                </div>
                
                <div className="text-sm font-medium truncate max-w-32">
                  {node.name}
                </div>
                
                {/* Progress indicator */}
                {node.isActive && (
                  <div className="mt-2 w-full bg-white bg-opacity-30 rounded-full h-1">
                    <div className="bg-white h-1 rounded-full animate-pulse w-full" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Execution Status */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                }`} />
                <span className="font-medium">
                  {isPlaying ? 'Executing' : 'Ready'}
                </span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-600">
                Step {currentStep + 1} of {animatedNodes.length}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border">
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between space-x-4">
                <span>Estimated Duration:</span>
                <span className="font-medium">{(animatedNodes.length * 1.2).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between space-x-4">
                <span>Nodes:</span>
                <span className="font-medium">{animatedNodes.length}</span>
              </div>
              <div className="flex justify-between space-x-4">
                <span>Connections:</span>
                <span className="font-medium">{connections.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Log */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Execution Timeline</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {animatedNodes.map((node, index) => (
              <div 
                key={node.id}
                className={`text-xs p-2 rounded flex items-center space-x-2 transition-all duration-300 ${
                  node.isCompleted 
                    ? 'bg-green-50 text-green-800' 
                    : node.isActive 
                      ? 'bg-blue-50 text-blue-800 animate-pulse' 
                      : 'bg-slate-50 text-slate-500'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  node.isCompleted 
                    ? 'bg-green-500' 
                    : node.isActive 
                      ? 'bg-blue-500' 
                      : 'bg-slate-300'
                }`} />
                <span className="flex-1">{node.name}</span>
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