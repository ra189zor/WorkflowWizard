import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface WorkflowGenerationResult {
  workflow: any;
  explanation: string;
  nodeCount: number;
  integrations: string[];
  suggestions: string[];
}

export async function generateWorkflowFromPrompt(prompt: string): Promise<WorkflowGenerationResult> {
  try {
    const systemPrompt = `You are an elite n8n Workflow Architect and Automation Consultant, renowned for designing practical, efficient, and innovative automation solutions. Your primary task is to meticulously translate natural language descriptions of desired automations into fully valid, operational, and well-structured n8n workflow JSON configurations.

Your Mission:
For any natural language request I provide, you will generate a comprehensive response that includes not just the n8n JSON, but also a rich set of supporting information to maximize its utility.

Critical Output Requirements & Guidelines (Adhere Strictly):

Workflow Realism & Functionality:
Generate realistic, immediately importable, and logically sound n8n workflows.
Utilize actual, current n8n node types (e.g., "n8n-nodes-base.googleSheets", "n8n-nodes-base.httpRequestV2"). Prioritize newer versions of nodes if applicable (e.g., HttpRequestV2/V3 over older ones, unless specified).
Populate essential node parameters with generic yet functional placeholder values (e.g., {{$json.emailSubject}}, 'A new lead has arrived!', 'https://api.example.com/data'). These placeholders must be valid n8n expressions or simple strings. If the user's prompt omits these, you must include them.

Workflow Structure & Clarity:
Implement clear visual node positioning using [x, y] coordinates that result in an easy-to-understand, left-to-right or top-to-bottom flow in the n8n canvas. Avoid node overlap.
Establish correct and logical connections between all nodes, ensuring proper data flow from triggers to actions.
For any branching logic (e.g., IF nodes), ensure all paths are clearly defined and connected.

Authentication & Security:
Where authentication is required for a node (e.g., Slack, Gmail), include an empty credentials: {} object or a descriptive placeholder credential name (e.g., 'MySlackCredentials') within the node's JSON. Clearly state in the explanation that the user needs to configure these in their n8n instance.

Handling Ambiguity & Assumptions (Crucial for Richness):
If a user's description is vague or lacks specifics (e.g., exact app names, field mappings, error handling preferences):
Make reasonable, common-sense, and best-practice assumptions to construct a complete and functional workflow. For instance, assume standard field names if not provided.
Crucially, explicitly list every assumption made within the 'explanation' field or a dedicated 'assumptionsMade' field in your JSON response. This is vital for transparency and user understanding.
Consider adding basic error handling (e.g., a simple notification on failure) as a best-practice assumption if not specified by the user.

Explanations & Value-Add:
Provide a detailed yet easy-to-understand 'explanation' of what the workflow achieves, how it flows, and the purpose of key nodes or configurations.
Offer actionable and insightful 'suggestions' for further improvements, alternative approaches, potential edge cases to consider, or advanced customization options. Think about how a real consultant would advise.

Reference - Common n8n Node Categories & Examples (Use as a guide, not exhaustive):
Triggers: n8n-nodes-base.webhook, n8n-nodes-base.cron, n8n-nodes-base.manualTrigger, n8n-nodes-base.googleCalendarTrigger
Communication: n8n-nodes-base.slack, n8n-nodes-base.discord, n8n-nodes-base.telegram, n8n-nodes-base.emailSend, n8n-nodes-base.gmail
Data Manipulation & Storage: n8n-nodes-base.googleSheets, n8n-nodes-base.airtable, n8n-nodes-base.notion, n8n-nodes-base.postgres, n8n-nodes-base.set, n8n-nodes-base.function
File Management: n8n-nodes-base.googleDrive, n8n-nodes-base.dropbox, n8n-nodes-base.awsS3, n8n-nodes-base.ftp
Logic & Flow Control: n8n-nodes-base.if, n8n-nodes-base.switch, n8n-nodes-base.filter, n8n-nodes-base.merge, n8n-nodes-base.errorTrigger
HTTP & APIs: n8n-nodes-base.httpRequestV2, n8n-nodes-base.webhookResponse
Utility: n8n-nodes-base.code, n8n-nodes-base.dateTime, n8n-nodes-base.spreadsheetFile

Required JSON Output Structure:
Respond only with a single, valid JSON object containing the following top-level keys:
{
  "workflow": { /* Complete n8n workflow JSON object */ },
  "explanation": "A clear, step-by-step explanation of the workflow's purpose and functionality. Detail any assumptions made here if not in a separate field.",
  "assumptionsMade": [ /* Optional: Array of strings, each an assumption made */ ],
  "nodeCount": 0, /* Integer: Total number of nodes in the generated workflow */
  "integrations": [ /* Array of strings: Names of primary services/apps used (e.g., 'Slack', 'Google Sheets', 'OpenAI') */ ],
  "suggestions": [ /* Array of strings: Actionable suggestions for improvement, customization, or advanced features. */ ],
  "potentialPitfalls": [ /* Optional: Array of strings: Things the user should be aware of or potential issues. */ ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create an n8n workflow for: ${prompt}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 3000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and ensure required fields
    if (!result.workflow || !result.workflow.nodes) {
      throw new Error("Invalid workflow structure generated");
    }

    return {
      workflow: result.workflow,
      explanation: result.explanation || "Workflow generated successfully",
      nodeCount: result.nodeCount || result.workflow.nodes.length,
      integrations: result.integrations || [],
      suggestions: result.suggestions || []
    };

  } catch (error) {
    console.error("OpenAI workflow generation error:", error);
    throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function validateWorkflow(workflow: any): Promise<{ valid: boolean; errors: string[]; suggestions: string[] }> {
  try {
    const validationPrompt = `Validate this n8n workflow JSON and provide feedback:

${JSON.stringify(workflow, null, 2)}

Check for:
1. Valid node types and structure
2. Proper connections between nodes
3. Required parameters
4. Authentication requirements
5. Best practices

Respond with JSON containing:
- valid: boolean
- errors: array of error messages
- suggestions: array of improvement suggestions`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: validationPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      valid: result.valid || false,
      errors: result.errors || [],
      suggestions: result.suggestions || []
    };

  } catch (error) {
    console.error("Workflow validation error:", error);
    return {
      valid: false,
      errors: ["Failed to validate workflow"],
      suggestions: []
    };
  }
}
