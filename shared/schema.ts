import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  userPrompt: text("user_prompt").notNull(),
  n8nJson: jsonb("n8n_json").notNull(),
  nodeCount: integer("node_count").notNull().default(0),
  integrations: text("integrations").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  messages: jsonb("messages").notNull().default([]),
  workflowId: integer("workflow_id").references(() => workflows.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  prompt: text("prompt").notNull(),
  n8nJson: jsonb("n8n_json").notNull(),
  nodeCount: integer("node_count").notNull().default(0),
  integrations: text("integrations").array().notNull().default([]),
});

// Schemas for API validation
export const generateWorkflowSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  conversationId: z.string().optional(),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

// Types
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type GenerateWorkflowRequest = z.infer<typeof generateWorkflowSchema>;

// Message types for conversations
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  workflowData?: any;
};

// n8n specific types
export type N8nNode = {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  position: [number, number];
  credentials?: Record<string, string>;
};

export type N8nConnection = {
  node: string;
  type: string;
  index: number;
};

export type N8nWorkflow = {
  nodes: N8nNode[];
  connections: Record<string, { main: N8nConnection[][] }>;
  active: boolean;
  settings: Record<string, any>;
  name?: string;
  id?: string;
};
