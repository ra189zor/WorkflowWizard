import { 
  workflows, 
  conversations, 
  templates, 
  users,
  usage,
  plans,
  type Workflow, 
  type InsertWorkflow, 
  type Conversation, 
  type InsertConversation, 
  type Template, 
  type InsertTemplate,
  type User,
  type InsertUser,
  type Usage,
  type InsertUsage,
  type Plan,
  type InsertPlan
} from "@shared/schema";

export interface IStorage {
  // Users
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySubscriptionId(subscriptionId: string): Promise<User | undefined>;
  updateUserSubscription(userId: number, data: Partial<User>): Promise<User | undefined>;
  
  // Usage tracking
  getUserUsage(userId: number): Promise<Usage>;
  incrementUserUsage(userId: number): Promise<void>;
  
  // Workflows
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getRecentWorkflows(limit?: number): Promise<Workflow[]>;
  
  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  updateConversation(id: number, messages: any[]): Promise<Conversation | undefined>;
  
  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  
  // Plans
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User & { passwordHash: string }>;
  private usage: Map<string, Usage>; // key: userId-month
  private workflows: Map<number, Workflow>;
  private conversations: Map<number, Conversation>;
  private templates: Map<number, Template>;
  private plans: Map<number, Plan>;
  private currentUserId: number;
  private currentWorkflowId: number;
  private currentConversationId: number;
  private currentTemplateId: number;
  private currentPlanId: number;

  constructor() {
    this.users = new Map();
    this.usage = new Map();
    this.workflows = new Map();
    this.conversations = new Map();
    this.templates = new Map();
    this.plans = new Map();
    this.currentUserId = 1;
    this.currentWorkflowId = 1;
    this.currentConversationId = 1;
    this.currentTemplateId = 1;
    this.currentPlanId = 1;
    
    // Initialize with sample templates
    this.initializeTemplates();
    this.initializePlans();
  }

  private initializePlans() {
    const samplePlans: InsertPlan[] = [
      {
        name: "Free",
        description: "Perfect for getting started",
        price: 0,
        interval: "month",
        workflowLimit: 5,
        features: ["5 workflows per month", "Basic templates", "Community support"],
        paddlePlanId: "free",
        isPopular: false
      },
      {
        name: "Pro",
        description: "For professionals and teams",
        price: 2900, // $29.00 in cents
        interval: "month",
        workflowLimit: 100,
        features: ["100 workflows per month", "All premium templates", "Priority support", "Advanced AI models"],
        paddlePlanId: "pro_monthly",
        isPopular: true
      },
      {
        name: "Enterprise",
        description: "For large organizations",
        price: 9900, // $99.00 in cents
        interval: "month",
        workflowLimit: -1, // unlimited
        features: ["Unlimited workflows", "Custom templates", "Dedicated support", "API access"],
        paddlePlanId: "enterprise_monthly",
        isPopular: false
      }
    ];

    samplePlans.forEach(plan => {
      const id = this.currentPlanId++;
      this.plans.set(id, { ...plan, id, createdAt: new Date() });
    });
  }

  private initializeTemplates() {
    const sampleTemplates: InsertTemplate[] = [
      {
        name: "Email to Slack",
        description: "Send Slack notification when receiving important emails",
        category: "Email Automation",
        prompt: "Send me a Slack message when I receive emails from my boss containing 'urgent'",
        n8nJson: {
          nodes: [
            {
              id: "gmail-trigger",
              name: "Gmail Trigger",
              type: "n8n-nodes-base.gmail",
              position: [240, 300],
              parameters: {
                operation: "trigger",
                event: "emailReceived"
              }
            },
            {
              id: "slack-message",
              name: "Slack Message",
              type: "n8n-nodes-base.slack",
              position: [460, 300],
              parameters: {
                channel: "#alerts",
                text: "🚨 Urgent email received: {{ $json.subject }}"
              }
            }
          ],
          connections: {
            "Gmail Trigger": {
              main: [[{ node: "Slack Message", type: "main", index: 0 }]]
            }
          },
          active: true,
          settings: {}
        },
        nodeCount: 2,
        integrations: ["Gmail", "Slack"]
      },
      {
        name: "Data Sync",
        description: "Synchronize data between Google Sheets and Airtable",
        category: "Data Management",
        prompt: "Sync new Airtable records to Google Sheets every hour",
        n8nJson: {
          nodes: [
            {
              id: "schedule-trigger",
              name: "Schedule Trigger",
              type: "n8n-nodes-base.cron",
              position: [240, 300],
              parameters: {
                rule: {
                  interval: [{ field: "hours", value: 1 }]
                }
              }
            },
            {
              id: "airtable",
              name: "Airtable",
              type: "n8n-nodes-base.airtable",
              position: [460, 300],
              parameters: {
                operation: "list",
                application: "appXXXXXXXXXXXXXX",
                table: "Table 1"
              }
            },
            {
              id: "google-sheets",
              name: "Google Sheets",
              type: "n8n-nodes-base.googleSheets",
              position: [680, 300],
              parameters: {
                operation: "append",
                documentId: "1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                sheetName: "Sheet1"
              }
            }
          ],
          connections: {
            "Schedule Trigger": {
              main: [[{ node: "Airtable", type: "main", index: 0 }]]
            },
            "Airtable": {
              main: [[{ node: "Google Sheets", type: "main", index: 0 }]]
            }
          },
          active: true,
          settings: {}
        },
        nodeCount: 3,
        integrations: ["Airtable", "Google Sheets", "Schedule"]
      }
    ];

    sampleTemplates.forEach(template => {
      const id = this.currentTemplateId++;
      this.templates.set(id, { ...template, id });
    });
  }

  async createUser(insertUser: InsertUser & { passwordHash: string }): Promise<User> {
    const id = this.currentUserId++;
    const user: User & { passwordHash: string } = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    
    // Initialize usage for the user
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageKey = `${id}-${currentMonth}`;
    this.usage.set(usageKey, {
      id: this.usage.size + 1,
      userId: id,
      workflowsGenerated: 0,
      month: currentMonth,
      year: new Date().getFullYear(),
      createdAt: new Date()
    });
    
    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByEmail(email: string): Promise<(User & { passwordHash?: string }) | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserBySubscriptionId(subscriptionId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.subscriptionId === subscriptionId) {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    return undefined;
  }

  async updateUserSubscription(userId: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...data, 
      updatedAt: new Date() 
    };
    this.users.set(userId, updatedUser);
    
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async getUserUsage(userId: number): Promise<Usage> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageKey = `${userId}-${currentMonth}`;
    
    let usage = this.usage.get(usageKey);
    if (!usage) {
      // Create usage record for current month
      usage = {
        id: this.usage.size + 1,
        userId,
        workflowsGenerated: 0,
        month: currentMonth,
        year: new Date().getFullYear(),
        createdAt: new Date()
      };
      this.usage.set(usageKey, usage);
    }
    
    return usage;
  }

  async incrementUserUsage(userId: number): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageKey = `${userId}-${currentMonth}`;
    
    let usage = this.usage.get(usageKey);
    if (!usage) {
      usage = {
        id: this.usage.size + 1,
        userId,
        workflowsGenerated: 1,
        month: currentMonth,
        year: new Date().getFullYear(),
        createdAt: new Date()
      };
    } else {
      usage.workflowsGenerated += 1;
    }
    
    this.usage.set(usageKey, usage);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentWorkflowId++;
    const workflow: Workflow = {
      ...insertWorkflow,
      id,
      createdAt: new Date()
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async getRecentWorkflows(limit = 10): Promise<Workflow[]> {
    return Array.from(this.workflows.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async updateConversation(id: number, messages: any[]): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      conversation.messages = messages;
      this.conversations.set(id, conversation);
      return conversation;
    }
    return undefined;
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }
}

export const storage = new MemStorage();
