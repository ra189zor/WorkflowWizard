import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Zap, Crown, Rocket, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  workflowLimit: number;
  features: string[];
  paddlePlanId: string;
  isPopular: boolean;
  icon: React.ReactNode;
  color: string;
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: string;
}

export function PricingModal({ isOpen, onClose, selectedPlan }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out WorkflowWizard',
      price: 0,
      interval: 'month',
      workflowLimit: 5,
      features: [
        '5 workflows per month',
        'Basic templates',
        'Community support',
        'Standard AI models'
      ],
      paddlePlanId: '',
      isPopular: false,
      icon: <Zap className="w-6 h-6" />,
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For professionals and growing teams',
      price: billingInterval === 'monthly' ? 29 : 290,
      interval: billingInterval === 'monthly' ? 'month' : 'year',
      workflowLimit: 100,
      features: [
        '100 workflows per month',
        'All premium templates',
        'Priority support',
        'Advanced AI models',
        'Custom integrations',
        'Workflow analytics'
      ],
      paddlePlanId: billingInterval === 'monthly' ? 'pro_monthly' : 'pro_yearly',
      isPopular: true,
      icon: <Crown className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large teams and organizations',
      price: billingInterval === 'monthly' ? 99 : 990,
      interval: billingInterval === 'monthly' ? 'month' : 'year',
      workflowLimit: -1, // unlimited
      features: [
        'Unlimited workflows',
        'Custom templates',
        'Dedicated support',
        'White-label options',
        'API access',
        'Advanced analytics',
        'SSO integration',
        'Custom AI training'
      ],
      paddlePlanId: billingInterval === 'monthly' ? 'enterprise_monthly' : 'enterprise_yearly',
      isPopular: false,
      icon: <Rocket className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      toast({
        title: "Free Plan Selected",
        description: "You're already on the free plan! Start creating workflows now.",
      });
      onClose();
      return;
    }

    setIsLoading(plan.id);

    try {
      // Initialize Paddle checkout
      // @ts-ignore - Paddle will be loaded via script
      if (typeof window.Paddle !== 'undefined') {
        // @ts-ignore
        window.Paddle.Checkout.open({
          product: plan.paddlePlanId,
          email: 'user@example.com', // This should come from auth context
          successCallback: (data: any) => {
            toast({
              title: "Subscription Successful!",
              description: `Welcome to ${plan.name}! Your subscription is now active.`,
            });
            onClose();
            // Redirect to dashboard or refresh user data
            window.location.reload();
          },
          closeCallback: () => {
            setIsLoading(null);
          }
        });
      } else {
        throw new Error('Paddle not loaded');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

  // Load Paddle script
  useEffect(() => {
    if (isOpen && !document.querySelector('script[src*="paddle"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/paddle.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        window.Paddle.Setup({ vendor: 12345 }); // Replace with your Paddle vendor ID
      };
      document.head.appendChild(script);
    }
  }, [isOpen]);

  const formatPrice = (price: number, interval: string) => {
    if (price === 0) return 'Free';
    return `$${price}/${interval}`;
  };

  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 10; // 2 months free
    const savings = (monthlyPrice * 12) - yearlyPrice;
    return Math.round((savings / (monthlyPrice * 12)) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-8">
          <DialogTitle className="text-3xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </DialogTitle>
          <p className="text-lg text-slate-600 mb-6">
            Start free and scale as you grow. All plans include our core features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 bg-slate-100 rounded-xl p-1 w-fit mx-auto">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                billingInterval === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 relative ${
                billingInterval === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                Save 17%
              </Badge>
            </button>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:scale-105 ${
                plan.isPopular
                  ? 'ring-2 ring-blue-500 shadow-xl'
                  : 'hover:shadow-lg'
              } ${selectedPlan === plan.id ? 'ring-2 ring-purple-500' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  {plan.name}
                </CardTitle>
                <p className="text-slate-600 text-sm">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">
                    {formatPrice(plan.price, plan.interval)}
                  </div>
                  {plan.price > 0 && billingInterval === 'yearly' && (
                    <div className="text-sm text-slate-500">
                      ${Math.round(plan.price / 12)}/month billed annually
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                    What's included:
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading === plan.id}
                  className={`w-full h-12 font-semibold transition-all duration-200 ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : plan.id === 'free'
                      ? 'bg-slate-600 hover:bg-slate-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                  }`}
                >
                  {isLoading === plan.id ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : plan.id === 'free' ? (
                    'Get Started Free'
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>

                {plan.id !== 'free' && (
                  <p className="text-xs text-slate-500 text-center">
                    Cancel anytime. No hidden fees.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 text-center mb-6">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Can I change plans later?</h4>
              <p className="text-slate-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">What happens if I exceed my workflow limit?</h4>
              <p className="text-slate-600">You'll be notified when approaching your limit and can upgrade your plan to continue creating workflows.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Is there a free trial?</h4>
              <p className="text-slate-600">Yes! Our free plan lets you create 5 workflows per month with no time limit.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Do you offer refunds?</h4>
              <p className="text-slate-600">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}