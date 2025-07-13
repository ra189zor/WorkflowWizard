import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { workflowGenerator } from "./services/workflow-generator";
import { generateWorkflowSchema, createUserSchema, updateSubscriptionSchema } from "@shared/schema";
import { authService } from "./services/auth";
import { paddleService } from "./services/paddle";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = createUserSchema.parse(req.body);
      
      const user = await authService.createUser({ email, password, name });
      
      // Set session
      req.session.userId = user.id;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
          planId: user.planId
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to create account"
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials"
        });
      }
      
      // Set session
      req.session.userId = user.id;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
          planId: user.planId
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Login failed"
      });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ success: false, error: "Not authenticated" });
      }
      
      const user = await authService.getUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ success: false, error: "User not found" });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
          planId: user.planId
        }
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ success: false, error: "Auth check failed" });
    }
  });

  // Subscription routes
  app.put("/api/auth/subscription", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ success: false, error: "Not authenticated" });
      }
      
      const subscriptionData = updateSubscriptionSchema.parse(req.body);
      const user = await authService.updateUserSubscription(req.session.userId, subscriptionData);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
          planId: user.planId
        }
      });
    } catch (error) {
      console.error("Subscription update error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update subscription"
      });
    }
  });

  // Paddle webhook
  app.post("/api/webhooks/paddle", async (req, res) => {
    try {
      await paddleService.handleWebhook(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Paddle webhook error:", error);
      res.status(500).json({ success: false });
    }
  });

  // Usage tracking
  app.get("/api/usage", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ success: false, error: "Not authenticated" });
      }
      
      const usage = await authService.getUserUsage(req.session.userId);
      res.json({
        success: true,
        data: usage
      });
    } catch (error) {
      console.error("Usage fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch usage"
      });
    }
  });

  // Generate workflow from natural language prompt
  app.post("/api/generate-workflow", async (req, res) => {
    try {
      const { prompt, conversationId } = generateWorkflowSchema.parse(req.body);
      
      // Check authentication and usage limits
      let userId = null;
      if (req.session.userId) {
        userId = req.session.userId;
        const canGenerate = await authService.checkUsageLimit(userId);
        if (!canGenerate) {
          return res.status(429).json({
            success: false,
            error: "Monthly workflow limit reached. Please upgrade your plan."
          });
        }
      }
      
      const result = await workflowGenerator.generateWorkflow({
        prompt,
        conversationId,
        userId
      });
      
      // Track usage if user is authenticated
      if (userId) {
        await authService.incrementUsage(userId);
      }
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error("Generate workflow error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to generate workflow"
      });
    }
  });

  // Get workflow templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await workflowGenerator.getTemplates();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error("Get templates error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch templates"
      });
    }
  });

  // Get recent workflows
  app.get("/api/workflows/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const workflows = await workflowGenerator.getRecentWorkflows(limit);
      
      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      console.error("Get recent workflows error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch recent workflows"
      });
    }
  });

  // Get specific workflow
  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid workflow ID"
        });
      }

      const workflow = await workflowGenerator.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: "Workflow not found"
        });
      }

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      console.error("Get workflow error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch workflow"
      });
    }
  });

  // Get conversation
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid conversation ID"
        });
      }

      const conversation = await workflowGenerator.getConversation(id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: "Conversation not found"
        });
      }

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch conversation"
      });
    }
  });

  // Validate workflow endpoint
  app.post("/api/validate-workflow", async (req, res) => {
    try {
      const { workflow } = req.body;
      
      if (!workflow) {
        return res.status(400).json({
          success: false,
          error: "Workflow data is required"
        });
      }

      const { validateWorkflow } = await import("./services/openai");
      const validation = await validateWorkflow(workflow);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error("Validate workflow error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to validate workflow"
      });
    }
  });

  // Get available n8n nodes
  app.get("/api/nodes", async (req, res) => {
    try {
      const { n8nNodes, getNodesByCategory, searchNodes } = await import("./data/n8n-nodes");
      
      const category = req.query.category as string;
      const search = req.query.search as string;
      
      let nodes = n8nNodes;
      
      if (category) {
        nodes = getNodesByCategory(category);
      } else if (search) {
        nodes = searchNodes(search);
      }
      
      res.json({
        success: true,
        data: nodes
      });
    } catch (error) {
      console.error("Get nodes error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch nodes"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
