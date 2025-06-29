import { workflows, conversations, templates, type Workflow, type InsertWorkflow, type Conversation, type InsertConversation, type Template, type InsertTemplate } from "@shared/schema";

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private workflows: Map<number, Workflow>;
  private conversations: Map<number, Conversation>;
  private templates: Map<number, Template>;
  private currentWorkflowId: number;
  private currentConversationId: number;
  private currentTemplateId: number;

  constructor() {
    this.workflows = new Map();
    this.conversations = new Map();
    this.templates = new Map();
    this.currentWorkflowId = 1;
    this.currentConversationId = 1;
    this.currentTemplateId = 1;
    
    // Initialize with sample templates
    this.initializeTemplates();
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
}

export const storage = new MemStorage();
