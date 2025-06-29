import { Bot, Zap } from "lucide-react";

interface AIAvatarProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function AIAvatar({ size = "md", animated = false, className = "" }: AIAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-6 h-6"
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      bg-gradient-to-br from-blue-500 to-purple-600 
      rounded-full 
      flex items-center justify-center 
      shadow-lg
      ${animated ? 'animate-pulse' : ''}
      ${className}
    `}>
      <div className="relative">
        <Bot className={`${iconSizes[size]} text-white`} />
        <Zap className="w-2 h-2 text-yellow-300 absolute -top-0.5 -right-0.5" />
      </div>
    </div>
  );
}