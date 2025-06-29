import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lightbulb, RefreshCw } from "lucide-react";
import { analyzeAIError, getHelpfulSuggestions } from "@/utils/error-handling";

interface EnhancedErrorMessageProps {
  error: any;
  aiResponse?: string;
  onRetry?: () => void;
  className?: string;
}

export function EnhancedErrorMessage({ 
  error, 
  aiResponse, 
  onRetry, 
  className = "" 
}: EnhancedErrorMessageProps) {
  const errorAnalysis = analyzeAIError(error, aiResponse);
  const suggestions = getHelpfulSuggestions(errorAnalysis);

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-red-800 mb-3">
              {errorAnalysis.userFriendlyMessage}
            </div>
            
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Helpful suggestions:</span>
                </div>
                <ul className="text-sm text-amber-800 space-y-1 ml-6">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="list-disc">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {onRetry && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}