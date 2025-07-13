import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and subscription management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  subscriptionStatus: text("subscription_status").notNull().default("free"), // free, active, canceled, past_due
  subscriptionId: text("subscription_id"),
  customerId: text("customer_id"),
  planId: text("plan_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Usage tracking for billing
export const usage = pgTable("usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workflowsGenerated: integer("workflows_generated").notNull().default(0),
  month: text("month").notNull(), // YYYY-MM format
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
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
  userId: integer("user_id").references(() => users.id),
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

// Subscription plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  interval: text("interval").notNull(), // month, year
  workflowLimit: integer("workflow_limit").notNull(),
  features: text("features").array().notNull().default([]),
  paddlePlanId: text("paddle_plan_id").notNull(),
  isPopular: boolean("is_popular").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for API validation
export const generateWorkflowSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  conversationId: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  customerId: z.string(),
  planId: z.string(),
  status: z.string(),
  currentPeriodEnd: z.string().optional(),
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUsageSchema = createInsertSchema(usage).omit({
  id: true,
  createdAt: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Usage = typeof usage.$inferSelect;
export type InsertUsage = z.infer<typeof insertUsageSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type GenerateWorkflowRequest = z.infer<typeof generateWorkflowSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateSubscriptionRequest = z.infer<typeof updateSubscriptionSchema>;

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
