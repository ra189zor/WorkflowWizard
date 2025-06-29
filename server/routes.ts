import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { workflowGenerator } from "./services/workflow-generator";
import { generateWorkflowSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate workflow from natural language prompt
  app.post("/api/generate-workflow", async (req, res) => {
    try {
      const { prompt, conversationId } = generateWorkflowSchema.parse(req.body);
      
      const result = await workflowGenerator.generateWorkflow({
        prompt,
        conversationId
      });
      
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
