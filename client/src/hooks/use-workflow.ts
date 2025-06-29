import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { N8nWorkflow, WorkflowGenerationResponse, Template } from '@/lib/types';

export function useWorkflowGeneration() {
  const [currentWorkflow, setCurrentWorkflow] = useState<N8nWorkflow | null>(null);

  const generateWorkflow = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/generate-workflow', { prompt });
      return response.json() as Promise<{ success: boolean; data: WorkflowGenerationResponse }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentWorkflow(data.data.workflow);
      }
    }
  });

  const validateWorkflow = useMutation({
    mutationFn: async (workflow: N8nWorkflow) => {
      const response = await apiRequest('POST', '/api/validate-workflow', { workflow });
      return response.json();
    }
  });

  return {
    currentWorkflow,
    setCurrentWorkflow,
    generateWorkflow,
    validateWorkflow,
    isGenerating: generateWorkflow.isPending
  };
}

export function useTemplates() {
  return useQuery<{ success: boolean; data: Template[] }>({
    queryKey: ['/api/templates'],
  });
}

export function useRecentWorkflows(limit = 10) {
  return useQuery({
    queryKey: ['/api/workflows/recent', limit],
  });
}
