export interface N8nNodeDefinition {
  type: string;
  name: string;
  category: string;
  description: string;
  parameters: Record<string, any>;
  credentials?: string[];
  commonUse: string[];
}

export const n8nNodes: N8nNodeDefinition[] = [
  // Triggers
  {
    type: "n8n-nodes-base.webhook",
    name: "Webhook",
    category: "Trigger",
    description: "Receives data when an HTTP request is made to the webhook URL",
    parameters: {
      httpMethod: "GET",
      path: "",
      responseMode: "onReceived"
    },
    commonUse: ["API integrations", "Form submissions", "External system notifications"]
  },
  {
    type: "n8n-nodes-base.cron",
    name: "Schedule Trigger",
    category: "Trigger",
    description: "Triggers the workflow on a schedule",
    parameters: {
      rule: {
        interval: [{ field: "hours", value: 1 }]
      }
    },
    commonUse: ["Regular data sync", "Periodic reports", "Automated maintenance"]
  },
  {
    type: "n8n-nodes-base.manualTrigger",
    name: "Manual Trigger",
    category: "Trigger",
    description: "Manually triggers the workflow",
    parameters: {},
    commonUse: ["Testing workflows", "On-demand execution", "Manual processes"]
  },

  // Email
  {
    type: "n8n-nodes-base.gmail",
    name: "Gmail",
    category: "Communication",
    description: "Send and receive emails via Gmail",
    parameters: {
      operation: "send",
      subject: "",
      message: "",
      toEmail: ""
    },
    credentials: ["googleOAuth2Api"],
    commonUse: ["Email notifications", "Email monitoring", "Automated responses"]
  },
  {
    type: "n8n-nodes-base.emailReadImap",
    name: "Email Read (IMAP)",
    category: "Communication",
    description: "Read emails from IMAP server",
    parameters: {
      format: "simple",
      markSeen: true
    },
    credentials: ["imap"],
    commonUse: ["Email monitoring", "Processing attachments", "Email-based triggers"]
  },

  // Communication
  {
    type: "n8n-nodes-base.slack",
    name: "Slack",
    category: "Communication",
    description: "Send messages and interact with Slack",
    parameters: {
      operation: "postMessage",
      channel: "",
      text: ""
    },
    credentials: ["slackApi"],
    commonUse: ["Team notifications", "Alert systems", "Status updates"]
  },
  {
    type: "n8n-nodes-base.discord",
    name: "Discord",
    category: "Communication",
    description: "Send messages to Discord channels",
    parameters: {
      operation: "sendMessage",
      channelId: "",
      content: ""
    },
    credentials: ["discordApi"],
    commonUse: ["Community notifications", "Bot interactions", "Gaming alerts"]
  },

  // Data Storage
  {
    type: "n8n-nodes-base.googleSheets",
    name: "Google Sheets",
    category: "Data",
    description: "Read, write and manipulate Google Sheets",
    parameters: {
      operation: "append",
      documentId: "",
      sheetName: "Sheet1"
    },
    credentials: ["googleSheetsOAuth2Api"],
    commonUse: ["Data logging", "Report generation", "Database operations"]
  },
  {
    type: "n8n-nodes-base.airtable",
    name: "Airtable",
    category: "Data",
    description: "Work with Airtable databases",
    parameters: {
      operation: "list",
      application: "",
      table: ""
    },
    credentials: ["airtableApi"],
    commonUse: ["CRM management", "Project tracking", "Content management"]
  },
  {
    type: "n8n-nodes-base.notion",
    name: "Notion",
    category: "Data",
    description: "Create and manage Notion pages and databases",
    parameters: {
      operation: "create",
      resource: "page"
    },
    credentials: ["notionApi"],
    commonUse: ["Documentation", "Knowledge base", "Project management"]
  },

  // File Storage
  {
    type: "n8n-nodes-base.googleDrive",
    name: "Google Drive",
    category: "File",
    description: "Access and manage Google Drive files",
    parameters: {
      operation: "upload",
      folderId: ""
    },
    credentials: ["googleDriveOAuth2Api"],
    commonUse: ["File backup", "Document sharing", "File processing"]
  },
  {
    type: "n8n-nodes-base.dropbox",
    name: "Dropbox",
    category: "File",
    description: "Upload, download and manage Dropbox files",
    parameters: {
      operation: "upload",
      remotePath: ""
    },
    credentials: ["dropboxApi"],
    commonUse: ["File synchronization", "Backup solutions", "File sharing"]
  },

  // Logic and Flow Control
  {
    type: "n8n-nodes-base.if",
    name: "IF",
    category: "Logic",
    description: "Route data based on conditions",
    parameters: {
      conditions: {
        string: [{
          value1: "",
          operation: "equal",
          value2: ""
        }]
      }
    },
    commonUse: ["Conditional logic", "Data filtering", "Decision trees"]
  },
  {
    type: "n8n-nodes-base.filter",
    name: "Filter",
    category: "Logic",
    description: "Filter data based on conditions",
    parameters: {
      conditions: {
        string: [{
          value1: "",
          operation: "equal",
          value2: ""
        }]
      }
    },
    commonUse: ["Data filtering", "Quality control", "Conditional processing"]
  },
  {
    type: "n8n-nodes-base.set",
    name: "Set",
    category: "Logic",
    description: "Set values for data transformation",
    parameters: {
      values: {
        string: [{
          name: "",
          value: ""
        }]
      }
    },
    commonUse: ["Data transformation", "Variable setting", "Data formatting"]
  },
  {
    type: "n8n-nodes-base.code",
    name: "Code",
    category: "Logic",
    description: "Execute custom JavaScript code",
    parameters: {
      mode: "runOnceForAllItems",
      jsCode: "// Your JavaScript code here\nreturn items;"
    },
    commonUse: ["Custom logic", "Data processing", "Complex transformations"]
  },

  // HTTP and APIs
  {
    type: "n8n-nodes-base.httpRequest",
    name: "HTTP Request",
    category: "Network",
    description: "Make HTTP requests to any URL",
    parameters: {
      method: "GET",
      url: "",
      responseFormat: "autodetect"
    },
    commonUse: ["API calls", "Web scraping", "External integrations"]
  },

  // CRM and Sales
  {
    type: "n8n-nodes-base.hubspot",
    name: "HubSpot",
    category: "Sales",
    description: "Manage HubSpot CRM data",
    parameters: {
      operation: "create",
      resource: "contact"
    },
    credentials: ["hubspotApi"],
    commonUse: ["Lead management", "Sales automation", "Customer tracking"]
  },

  // Social Media
  {
    type: "n8n-nodes-base.twitter",
    name: "Twitter",
    category: "Social",
    description: "Post tweets and interact with Twitter",
    parameters: {
      operation: "tweet",
      text: ""
    },
    credentials: ["twitterOAuth1Api"],
    commonUse: ["Social media automation", "Content sharing", "Engagement tracking"]
  }
];

export function getNodeByType(type: string): N8nNodeDefinition | undefined {
  return n8nNodes.find(node => node.type === type);
}

export function getNodesByCategory(category: string): N8nNodeDefinition[] {
  return n8nNodes.filter(node => node.category === category);
}

export function searchNodes(query: string): N8nNodeDefinition[] {
  const lowerQuery = query.toLowerCase();
  return n8nNodes.filter(node => 
    node.name.toLowerCase().includes(lowerQuery) ||
    node.description.toLowerCase().includes(lowerQuery) ||
    node.commonUse.some(use => use.toLowerCase().includes(lowerQuery))
  );
}
