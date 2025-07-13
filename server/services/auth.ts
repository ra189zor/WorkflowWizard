import bcrypt from 'bcrypt';
import { storage } from '../storage';
import type { InsertUser, User, UpdateSubscriptionRequest } from '@shared/schema';

export class AuthService {
  async createUser(userData: { email: string; password: string; name: string }): Promise<User> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await storage.createUser({
      email: userData.email,
      name: userData.name,
      passwordHash: hashedPassword,
      subscriptionStatus: 'free'
    });

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValid) {
      return null;
    }

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return storage.getUser(id);
  }

  async updateUserSubscription(userId: number, subscriptionData: UpdateSubscriptionRequest): Promise<User> {
    const user = await storage.updateUserSubscription(userId, {
      subscriptionId: subscriptionData.subscriptionId,
      customerId: subscriptionData.customerId,
      planId: subscriptionData.planId,
      subscriptionStatus: subscriptionData.status,
      currentPeriodEnd: subscriptionData.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd) : undefined
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async checkUsageLimit(userId: number): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) {
      return false;
    }

    // Free users have a limit of 5 workflows per month
    if (user.subscriptionStatus === 'free') {
      const usage = await storage.getUserUsage(userId);
      return usage.workflowsGenerated < 5;
    }

    // Pro users have a limit of 100 workflows per month
    if (user.subscriptionStatus === 'active' && user.planId === 'pro') {
      const usage = await storage.getUserUsage(userId);
      return usage.workflowsGenerated < 100;
    }

    // Enterprise users have unlimited workflows
    return true;
  }

  async incrementUsage(userId: number): Promise<void> {
    await storage.incrementUserUsage(userId);
  }

  async getUserUsage(userId: number) {
    return storage.getUserUsage(userId);
  }
}

export const authService = new AuthService();