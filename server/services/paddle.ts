export class PaddleService {
  async handleWebhook(data: any): Promise<void> {
    try {
      const { alert_name, email, subscription_id, status, plan_id } = data;

      switch (alert_name) {
        case 'subscription_created':
        case 'subscription_updated':
          await this.updateSubscription({
            email,
            subscriptionId: subscription_id,
            status: status === 'active' ? 'active' : 'canceled',
            planId: plan_id
          });
          break;

        case 'subscription_cancelled':
          await this.cancelSubscription(subscription_id);
          break;

        case 'subscription_payment_succeeded':
          await this.handlePaymentSuccess(subscription_id);
          break;

        case 'subscription_payment_failed':
          await this.handlePaymentFailure(subscription_id);
          break;

        default:
          console.log('Unhandled Paddle webhook:', alert_name);
      }
    } catch (error) {
      console.error('Paddle webhook processing error:', error);
      throw error;
    }
  }

  private async updateSubscription(data: {
    email: string;
    subscriptionId: string;
    status: string;
    planId: string;
  }): Promise<void> {
    const { storage } = await import('../storage');
    
    // Find user by email
    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      console.error('User not found for subscription update:', data.email);
      return;
    }

    // Update subscription
    await storage.updateUserSubscription(user.id, {
      subscriptionId: data.subscriptionId,
      subscriptionStatus: data.status,
      planId: data.planId,
      customerId: '', // Paddle doesn't provide customer ID in webhooks
    });
  }

  private async cancelSubscription(subscriptionId: string): Promise<void> {
    const { storage } = await import('../storage');
    
    // Find user by subscription ID and update status
    const user = await storage.getUserBySubscriptionId(subscriptionId);
    if (user) {
      await storage.updateUserSubscription(user.id, {
        subscriptionStatus: 'canceled'
      });
    }
  }

  private async handlePaymentSuccess(subscriptionId: string): Promise<void> {
    const { storage } = await import('../storage');
    
    // Update subscription status to active
    const user = await storage.getUserBySubscriptionId(subscriptionId);
    if (user) {
      await storage.updateUserSubscription(user.id, {
        subscriptionStatus: 'active'
      });
    }
  }

  private async handlePaymentFailure(subscriptionId: string): Promise<void> {
    const { storage } = await import('../storage');
    
    // Update subscription status to past_due
    const user = await storage.getUserBySubscriptionId(subscriptionId);
    if (user) {
      await storage.updateUserSubscription(user.id, {
        subscriptionStatus: 'past_due'
      });
    }
  }
}

export const paddleService = new PaddleService();