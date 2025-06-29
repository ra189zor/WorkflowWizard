export interface AIErrorAnalysis {
  isAILimitation: boolean;
  isParsingError: boolean;
  userFriendlyMessage: string;
  technicalError?: string;
}

export function analyzeAIError(error: any, aiResponse?: string): AIErrorAnalysis {
  const errorMessage = error?.message || error?.toString() || '';
  const responseText = aiResponse || '';
  
  // Check for AI limitation phrases in the response
  const aiLimitationPatterns = [
    /I cannot fully generate/i,
    /My current capabilities do not allow/i,
    /I'm unable to create/i,
    /This request is too complex/i,
    /I cannot provide/i,
    /I'm not able to generate/i,
    /This exceeds my capabilities/i,
    /I cannot complete this request/i,
    /I'm unable to process/i,
    /This is beyond my current abilities/i
  ];

  const isAILimitation = aiLimitationPatterns.some(pattern => 
    pattern.test(responseText) || pattern.test(errorMessage)
  );

  // Check for JSON parsing errors
  const isParsingError = errorMessage.includes('JSON') || 
                        errorMessage.includes('parse') ||
                        errorMessage.includes('Invalid workflow structure') ||
                        errorMessage.includes('SyntaxError');

  // Check for network/API errors
  const isNetworkError = errorMessage.includes('fetch') ||
                        errorMessage.includes('network') ||
                        errorMessage.includes('timeout') ||
                        errorMessage.includes('Failed to generate workflow');

  let userFriendlyMessage: string;

  if (isAILimitation) {
    userFriendlyMessage = "The AI encountered a complex request and couldn't generate a valid workflow. Please try simplifying your description or breaking it down into smaller steps. For example, focus on one specific automation at a time.";
  } else if (isParsingError) {
    userFriendlyMessage = "The AI generated an invalid workflow format. Please try rephrasing your request with more specific details about the services and actions you want to automate.";
  } else if (isNetworkError) {
    userFriendlyMessage = "There was a connection issue while generating your workflow. Please check your internet connection and try again.";
  } else {
    userFriendlyMessage = "We encountered an issue generating your workflow. Please try rephrasing your request or provide more specific details about your automation needs.";
  }

  return {
    isAILimitation,
    isParsingError,
    userFriendlyMessage,
    technicalError: errorMessage
  };
}

export function getHelpfulSuggestions(errorAnalysis: AIErrorAnalysis): string[] {
  const suggestions: string[] = [];

  if (errorAnalysis.isAILimitation) {
    suggestions.push(
      "Break down complex automations into smaller, individual workflows",
      "Be more specific about the services you want to connect (e.g., Gmail, Slack, Google Sheets)",
      "Describe the exact trigger and action you want (e.g., 'when I receive an email' → 'send a Slack message')",
      "Try using one of the example prompts from the sidebar"
    );
  } else if (errorAnalysis.isParsingError) {
    suggestions.push(
      "Use simpler language to describe your automation",
      "Mention specific service names (Gmail, Slack, Airtable, etc.)",
      "Describe a single workflow instead of multiple automations",
      "Check out the templates for inspiration"
    );
  } else {
    suggestions.push(
      "Try rephrasing your request with different words",
      "Be more specific about what triggers the automation",
      "Mention the exact services you want to connect",
      "Start with a simpler automation and build up complexity"
    );
  }

  return suggestions;
}