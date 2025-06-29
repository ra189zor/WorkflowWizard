import { generateWorkflowFromPrompt, validateWorkflow } from './openai';
import { storage } from '../storage';
import type { InsertWorkflow, ChatMessage, N8nWorkflow } from '@shared/schema';

export interface GenerateWorkflowOptions {
  prompt: string;
  conversationId?: string;
}

export interface WorkflowGenerationResponse {
  workflow: N8nWorkflow;
  explanation: string;
  suggestions: string[];
  conversationId: string;
  workflowId: number;
}

export class WorkflowGeneratorService {
  
  async generateWorkflow(options: GenerateWorkflowOptions): Promise<WorkflowGenerationResponse> {
    const { prompt, conversationId } = options;
    
    try {
      // Generate workflow using OpenAI
      const result = await generateWorkflowFromPrompt(prompt);
      
      // Validate the generated workflow
      const validation = await validateWorkflow(result.workflow);
      
      // Create workflow record
      const workflowData: InsertWorkflow = {
        title: this.generateWorkflowTitle(prompt),
        description: result.explanation,
        userPrompt: prompt,
        n8nJson: result.workflow,
        nodeCount: result.nodeCount,
        integrations: result.integrations
      };
      
      const savedWorkflow = await storage.createWorkflow(workflowData);
      
      // Handle conversation
      const newConversationId = await this.handleConversation(
        conversationId,
        prompt,
        result.explanation,
        savedWorkflow.id,
        result.workflow
      );
      
      // Combine validation suggestions with AI suggestions
      const allSuggestions = [
        ...result.suggestions,
        ...validation.suggestions
      ];
      
      return {
        workflow: result.workflow,
        explanation: result.explanation,
        suggestions: allSuggestions,
        conversationId: newConversationId,
        workflowId: savedWorkflow.id
      };
      
    } catch (error) {
      console.error('Workflow generation failed:', error);
      throw new Error(`Failed to generate workflow: ${error.message}`);
    }
  }
  
  private async handleConversation(
    conversationId: string | undefined,
    userPrompt: string,
    aiResponse: string,
    workflowId: number,
    workflowData: any
  ): Promise<string> {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toISOString()
    };
    
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      workflowData
    };
    
    if (conversationId) {
      // Update existing conversation
      const numericId = parseInt(conversationId);
      const conversation = await storage.getConversation(numericId);
      
      if (conversation) {
        const updatedMessages = [
          ...(Array.isArray(conversation.messages) ? conversation.messages : []),
          userMessage,
          assistantMessage
        ];
        
        await storage.updateConversation(numericId, updatedMessages);
        return conversationId;
      }
    }
    
    // Create new conversation
    const newConversation = await storage.createConversation({
      messages: [userMessage, assistantMessage],
      workflowId
    });
    
    return newConversation.id.toString();
  }
  
  private generateWorkflowTitle(prompt: string): string {
    // Extract key terms to create a meaningful title
    const words = prompt.toLowerCase().split(' ');
    const keyWords = words.filter(word => 
      word.length > 3 && 
      !['when', 'with', 'from', 'that', 'this', 'will', 'should', 'would'].includes(word)
    );
    
    const title = keyWords.slice(0, 4).join(' ');
    return title.charAt(0).toUpperCase() + title.slice(1) + ' Automation';
  }
  
  async getRecentWorkflows(limit = 10) {
    return storage.getRecentWorkflows(limit);
  }
  
  async getTemplates() {
    return storage.getTemplates();
  }
  
  async getWorkflow(id: number) {
    return storage.getWorkflow(id);
  }
  
  async getConversation(id: number) {
    return storage.getConversation(id);
  }
}

export const workflowGenerator = new WorkflowGeneratorService();
