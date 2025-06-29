// Re-export types from shared schema for frontend use
export type {
  Workflow,
  Template,
  ChatMessage,
  N8nNode,
  N8nWorkflow,
  GenerateWorkflowRequest
} from '@shared/schema';

// Frontend-specific types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WorkflowGenerationResponse {
  workflow: N8nWorkflow;
  explanation: string;
  suggestions: string[];
  conversationId: string;
  workflowId: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  suggestions: string[];
}
