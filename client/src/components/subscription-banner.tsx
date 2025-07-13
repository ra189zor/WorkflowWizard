import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, X } from "lucide-react";
import { PricingModal } from "./pricing-modal";
import { useAuth } from "./auth-provider";

export function SubscriptionBanner() {
  const [showPricing, setShowPricing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { user } = useAuth();

  // Don't show banner if user is on paid plan or banner is dismissed
  if (!user || user.subscriptionStatus === 'active' || isDismissed) {
    return null;
  }

  return (
    <>
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-slate-900">Upgrade to Pro</h3>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    Limited Time
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Get unlimited workflows, premium templates, and priority support
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowPricing(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                View Plans
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </>
  );
}