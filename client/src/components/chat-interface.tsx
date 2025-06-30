import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, Bot, User, AlertCircle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useRecentWorkflows } from "@/hooks/use-local-storage";
import { DynamicLoading } from "@/components/dynamic-loading";
import { analyzeAIError, getHelpfulSuggestions } from "@/utils/error-handling";
import { TypingAnimation } from "@/components/typing-animation";
import { AIAvatar } from "@/components/ai-avatar";
import type { ChatMessage, N8nWorkflow } from "@/lib/types";

interface ChatInterfaceProps {
  onWorkflowGenerated: (workflow: N8nWorkflow) => void;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

export function ChatInterface({ 
  onWorkflowGenerated, 
  isGenerating, 
  onGeneratingChange 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showTypingWelcome, setShowTypingWelcome] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { addWorkflow } = useRecentWorkflows();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for template prompt injection
  useEffect(() => {
    const handleFillInput = (event: CustomEvent) => {
      setInputMessage(event.detail);
      textareaRef.current?.focus();
    };

    window.addEventListener('fillChatInput', handleFillInput as EventListener);
    return () => window.removeEventListener('fillChatInput', handleFillInput as EventListener);
  }, []);

  const [currentPrompt, setCurrentPrompt] = useState<string>("");

  // Shortened welcome message without the "Try something like" example
  const welcomeText = "👋 Hi! I'm your n8n automation assistant. Describe the workflow you'd like to create, and I'll generate the complete n8n configuration for you.";

  useEffect(() => {
    // Add welcome message after typing animation completes
    const timer = setTimeout(() => {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: welcomeText,
        timestamp: new Date().toISOString()
      }]);
      setShowTypingWelcome(false);
    }, welcomeText.length * 30 + 1000); // Typing speed + delay

    return () => clearTimeout(timer);
  }, []);

  const generateWorkflowMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/generate-workflow", { prompt });
      const data = await response.json();
      
      // Store the raw response for error analysis
      if (!data.success && data.error) {
        const error = new Error(data.error);
        (error as any).aiResponse = data.error;
        throw error;
      }
      
      return data;
    },
    onMutate: (prompt: string) => {
      onGeneratingChange(true);
      setCurrentPrompt(prompt);
    },
    onSuccess: (data) => {
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: data.data.explanation,
          timestamp: new Date().toISOString(),
          workflowData: data.data.workflow
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        onWorkflowGenerated(data.data.workflow);
        
        // Store in local storage
        const workflowTitle = data.data.workflow.name || 
          currentPrompt.split(' ').slice(0, 8).join(' ') || 
          'Untitled Workflow';
        
        addWorkflow(workflowTitle, data.data.explanation, data.data.workflow);
        
        toast({
          title: "Workflow Generated!",
          description: "Your n8n workflow is ready to download.",
        });
      }
    },
    onError: (error: any) => {
      // Analyze the error for specific user-friendly messaging
      const errorAnalysis = analyzeAIError(error, error.aiResponse);
      const suggestions = getHelpfulSuggestions(errorAnalysis);
      
      toast({
        title: "Generation Failed",
        description: errorAnalysis.userFriendlyMessage,
        variant: "destructive",
      });
      
      // Create enhanced error message with suggestions
      const errorContent = `${errorAnalysis.userFriendlyMessage}

Here are some suggestions to help you get better results:
${suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

Feel free to try again with a modified request!`;
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: errorContent,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    },
    onSettled: () => {
      onGeneratingChange(false);
    }
  });

  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (!message || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    generateWorkflowMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewWorkflow = (workflowData: N8nWorkflow) => {
    // Dispatch custom event to open the workflow modal
    const event = new CustomEvent('openWorkflowModal', { 
      detail: { workflow: workflowData } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex-1 flex flex-col h-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Chat Messages with increased padding */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Typing Welcome Message */}
          {showTypingWelcome && (
            <div className="flex items-start space-x-4">
              <AIAvatar size="lg" animated className="shadow-xl" />
              <div className="max-w-2xl">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-8">
                    <div className="whitespace-pre-wrap text-slate-700" style={{ 
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: '1.6'
                    }}>
                      <TypingAnimation 
                        text={welcomeText}
                        speed={30}
                        className="leading-relaxed"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-4 ${
              message.role === 'user' ? 'justify-end' : ''
            }`}>
              {message.role === 'assistant' && (
                <AIAvatar size="md" className="shadow-lg" />
              )}
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                <Card className={
                  message.role === 'user' 
                    ? 'bg-primary text-white shadow-lg' 
                    : message.id === 'welcome' 
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg'
                      : 'shadow-md'
                }>
                  <CardContent className="p-6">
                    <div className="whitespace-pre-wrap leading-relaxed" style={{ 
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: '1.6'
                    }}>
                      {message.content}
                    </div>
                    {message.workflowData && (
                      <div className="mt-4 flex space-x-3">
                        <Button
                          size="sm"
                          variant={message.role === 'user' ? 'secondary' : 'default'}
                          className="text-xs font-medium"
                          onClick={() => handleViewWorkflow(message.workflowData)}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          View Workflow
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-medium"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(message.workflowData, null, 2)], { 
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
                          }}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Download JSON
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {/* Loading Message */}
          {isGenerating && (
            <div className="flex items-start space-x-4">
              <AIAvatar size="md" animated className="shadow-lg" />
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <DynamicLoading isLoading={isGenerating} />
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Chat Input with prominent CTA */}
      <div className="border-t border-slate-200 p-8 bg-gradient-to-r from-slate-50 to-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your automation needs in plain English..."
                className="resize-none border-slate-200 focus:border-primary focus:ring-primary shadow-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
                rows={3}
              />
            </div>
            {/* Enhanced Primary CTA Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isGenerating}
              className="self-end bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 h-auto flex items-center space-x-2 font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Generate</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Dynamic loading indicator below text area */}
          {isGenerating && (
            <div className="mt-4">
              <DynamicLoading isLoading={isGenerating} className="justify-center" />
            </div>
          )}
          
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="text-slate-400">Powered by AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}