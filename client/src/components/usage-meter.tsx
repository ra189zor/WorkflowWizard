import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Crown, TrendingUp } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useState } from "react";
import { PricingModal } from "./pricing-modal";

interface UsageMeterProps {
  workflowsUsed: number;
  workflowLimit: number;
  className?: string;
}

export function UsageMeter({ workflowsUsed, workflowLimit, className = "" }: UsageMeterProps) {
  const [showPricing, setShowPricing] = useState(false);
  const { user } = useAuth();
  
  const usagePercentage = workflowLimit === -1 ? 0 : (workflowsUsed / workflowLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isOverLimit = usagePercentage >= 100;

  const getProgressColor = () => {
    if (isOverLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusColor = () => {
    if (isOverLimit) return "text-red-600 bg-red-50 border-red-200";
    if (isNearLimit) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">
              Monthly Usage
            </CardTitle>
            {user?.subscriptionStatus === 'free' && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Free Plan
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Workflows Generated</span>
              <span className="font-medium">
                {workflowsUsed} / {workflowLimit === -1 ? '∞' : workflowLimit}
              </span>
            </div>
            {workflowLimit !== -1 && (
              <div className="relative">
                <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Status Message */}
          {workflowLimit !== -1 && (
            <div className={`p-3 rounded-lg border text-sm ${getStatusColor()}`}>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">
                  {isOverLimit 
                    ? "Limit Reached" 
                    : isNearLimit 
                      ? "Approaching Limit" 
                      : "Good Usage"}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-80">
                {isOverLimit 
                  ? "Upgrade to continue creating workflows"
                  : isNearLimit 
                    ? `${workflowLimit - workflowsUsed} workflows remaining this month`
                    : `${workflowLimit - workflowsUsed} workflows remaining this month`}
              </p>
            </div>
          )}

          {/* Upgrade CTA */}
          {user?.subscriptionStatus === 'free' && (isNearLimit || isOverLimit) && (
            <Button
              onClick={() => setShowPricing(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          )}

          {/* Plan Benefits */}
          {user?.subscriptionStatus === 'active' && (
            <div className="text-xs text-slate-500 text-center">
              <Zap className="w-3 h-3 inline mr-1" />
              Pro Plan Active
            </div>
          )}
        </CardContent>
      </Card>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </>
  );
}