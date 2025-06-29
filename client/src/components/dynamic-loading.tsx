import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface DynamicLoadingProps {
  isLoading: boolean;
  className?: string;
}

export function DynamicLoading({ isLoading, className = "" }: DynamicLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Analyzing your request...",
    "Understanding automation requirements...",
    "Selecting optimal n8n nodes...",
    "Generating workflow structure...",
    "Configuring node parameters...",
    "Creating connections between nodes...",
    "Validating n8n JSON format...",
    "Optimizing workflow performance...",
    "Finalizing automation logic..."
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % loadingMessages.length
      );
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [isLoading, loadingMessages.length]);

  if (!isLoading) return null;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin text-primary" />
      <span className="text-sm text-slate-600 animate-pulse">
        {loadingMessages[currentMessageIndex]}
      </span>
    </div>
  );
}