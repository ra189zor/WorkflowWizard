import type { InsertTemplate } from '@shared/schema';

export const workflowTemplates: InsertTemplate[] = [
  {
    name: "Email to Slack Automation",
    description: "Send Slack notification when receiving important emails",
    category: "Email Automation",
    prompt: "Send me a Slack message when I receive emails from my boss containing 'urgent'",
    n8nJson: {
      nodes: [
        {
          id: "gmail-trigger",
          name: "Gmail Trigger",
          type: "n8n-nodes-base.gmail",
          position: [240, 300],
          parameters: {
            operation: "trigger",
            event: "emailReceived",
            filters: {
              from: "boss@company.com"
            }
          }
        },
        {
          id: "filter-urgent",
          name: "Filter Urgent",
          type: "n8n-nodes-base.filter",
          position: [460, 300],
          parameters: {
            conditions: {
              string: [{
                value1: "={{ $json.subject }}",
                operation: "contains",
                value2: "urgent"
              }]
            }
          }
        },
        {
          id: "slack-notification",
          name: "Slack Notification",
          type: "n8n-nodes-base.slack",
          position: [680, 300],
          parameters: {
            channel: "#alerts",
            text: "🚨 Urgent email from boss: {{ $json.subject }}\n\nFrom: {{ $json.from }}\nPreview: {{ $json.textPlain.substring(0, 200) }}..."
          }
        }
      ],
      connections: {
        "Gmail Trigger": {
          main: [[{ node: "Filter Urgent", type: "main", index: 0 }]]
        },
        "Filter Urgent": {
          main: [[{ node: "Slack Notification", type: "main", index: 0 }]]
        }
      },
      active: true,
      settings: {
        timezone: "America/New_York"
      }
    },
    nodeCount: 3,
    integrations: ["Gmail", "Slack"]
  },
  {
    name: "Data Synchronization",
    description: "Synchronize data between Google Sheets and Airtable",
    category: "Data Management",
    prompt: "Sync new Airtable records to Google Sheets every hour",
    n8nJson: {
      nodes: [
        {
          id: "schedule-trigger",
          name: "Schedule Trigger",
          type: "n8n-nodes-base.cron",
          position: [240, 300],
          parameters: {
            rule: {
              interval: [{ field: "hours", value: 1 }]
            }
          }
        },
        {
          id: "airtable-read",
          name: "Airtable Read",
          type: "n8n-nodes-base.airtable",
          position: [460, 300],
          parameters: {
            operation: "list",
            application: "appXXXXXXXXXXXXXX",
            table: "Main Table",
            filterByFormula: "CREATED_TIME() > DATEADD(NOW(), -1, 'hour')"
          }
        },
        {
          id: "google-sheets-append",
          name: "Google Sheets Append",
          type: "n8n-nodes-base.googleSheets",
          position: [680, 300],
          parameters: {
            operation: "append",
            documentId: "1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            sheetName: "Synced Data",
            valueInputOption: "USER_ENTERED"
          }
        }
      ],
      connections: {
        "Schedule Trigger": {
          main: [[{ node: "Airtable Read", type: "main", index: 0 }]]
        },
        "Airtable Read": {
          main: [[{ node: "Google Sheets Append", type: "main", index: 0 }]]
        }
      },
      active: true,
      settings: {}
    },
    nodeCount: 3,
    integrations: ["Schedule", "Airtable", "Google Sheets"]
  },
  {
    name: "File Processing Pipeline",
    description: "Process CSV files from Dropbox and send summaries",
    category: "File Processing",
    prompt: "When a CSV file is uploaded to Dropbox, process it and email me a summary",
    n8nJson: {
      nodes: [
        {
          id: "dropbox-trigger",
          name: "Dropbox Trigger",
          type: "n8n-nodes-base.dropbox",
          position: [240, 300],
          parameters: {
            operation: "trigger",
            event: "fileAdded",
            path: "/uploads"
          }
        },
        {
          id: "filter-csv",
          name: "Filter CSV Files",
          type: "n8n-nodes-base.filter",
          position: [460, 300],
          parameters: {
            conditions: {
              string: [{
                value1: "={{ $json.name }}",
                operation: "endsWith",
                value2: ".csv"
              }]
            }
          }
        },
        {
          id: "download-file",
          name: "Download File",
          type: "n8n-nodes-base.dropbox",
          position: [680, 250],
          parameters: {
            operation: "download",
            path: "={{ $json.path_lower }}"
          }
        },
        {
          id: "process-csv",
          name: "Process CSV",
          type: "n8n-nodes-base.code",
          position: [900, 250],
          parameters: {
            mode: "runOnceForAllItems",
            jsCode: `
const csvData = items[0].binary.data.data;
const csvText = Buffer.from(csvData, 'base64').toString();
const lines = csvText.split('\\n').filter(line => line.trim());
const headers = lines[0].split(',');
const dataRows = lines.slice(1);

return [{
  json: {
    fileName: items[0].json.name,
    rowCount: dataRows.length,
    columnCount: headers.length,
    headers: headers,
    summary: \`Processed \${dataRows.length} rows with \${headers.length} columns\`
  }
}];`
          }
        },
        {
          id: "send-email",
          name: "Send Summary Email",
          type: "n8n-nodes-base.gmail",
          position: [1120, 250],
          parameters: {
            operation: "send",
            toEmail: "user@company.com",
            subject: "CSV File Processed: {{ $json.fileName }}",
            message: `
File Processing Complete!

File: {{ $json.fileName }}
Rows Processed: {{ $json.rowCount }}
Columns: {{ $json.columnCount }}
Headers: {{ $json.headers.join(', ') }}

Summary: {{ $json.summary }}
            `
          }
        }
      ],
      connections: {
        "Dropbox Trigger": {
          main: [[{ node: "Filter CSV Files", type: "main", index: 0 }]]
        },
        "Filter CSV Files": {
          main: [[{ node: "Download File", type: "main", index: 0 }]]
        },
        "Download File": {
          main: [[{ node: "Process CSV", type: "main", index: 0 }]]
        },
        "Process CSV": {
          main: [[{ node: "Send Summary Email", type: "main", index: 0 }]]
        }
      },
      active: true,
      settings: {}
    },
    nodeCount: 5,
    integrations: ["Dropbox", "Gmail", "File Processing"]
  },
  {
    name: "Lead Management System",
    description: "Add form submissions to CRM and send welcome emails",
    category: "Lead Management",
    prompt: "Add new form submissions to CRM and send welcome email",
    n8nJson: {
      nodes: [
        {
          id: "webhook-trigger",
          name: "Form Webhook",
          type: "n8n-nodes-base.webhook",
          position: [240, 300],
          parameters: {
            httpMethod: "POST",
            path: "form-submission",
            responseMode: "onReceived"
          }
        },
        {
          id: "hubspot-create",
          name: "Create HubSpot Contact",
          type: "n8n-nodes-base.hubspot",
          position: [460, 250],
          parameters: {
            operation: "create",
            resource: "contact",
            email: "={{ $json.email }}",
            firstname: "={{ $json.firstName }}",
            lastname: "={{ $json.lastName }}",
            company: "={{ $json.company }}"
          }
        },
        {
          id: "welcome-email",
          name: "Send Welcome Email",
          type: "n8n-nodes-base.gmail",
          position: [460, 350],
          parameters: {
            operation: "send",
            toEmail: "={{ $json.email }}",
            subject: "Welcome to Our Platform!",
            message: `
Hello {{ $json.firstName }},

Thank you for signing up! We're excited to have you on board.

Best regards,
The Team
            `
          }
        }
      ],
      connections: {
        "Form Webhook": {
          main: [
            [
              { node: "Create HubSpot Contact", type: "main", index: 0 },
              { node: "Send Welcome Email", type: "main", index: 0 }
            ]
          ]
        }
      },
      active: true,
      settings: {}
    },
    nodeCount: 3,
    integrations: ["Webhook", "HubSpot", "Gmail"]
  },
  {
    name: "Social Media Automation",
    description: "Auto-post to Twitter when publishing blog posts",
    category: "Social Media",
    prompt: "Post to Twitter when I publish a new blog post",
    n8nJson: {
      nodes: [
        {
          id: "rss-trigger",
          name: "RSS Feed Monitor",
          type: "n8n-nodes-base.rssFeedTrigger",
          position: [240, 300],
          parameters: {
            feedUrl: "https://yourblog.com/feed.xml"
          }
        },
        {
          id: "format-tweet",
          name: "Format Tweet",
          type: "n8n-nodes-base.set",
          position: [460, 300],
          parameters: {
            values: {
              string: [{
                name: "tweetText",
                value: "📝 New blog post: {{ $json.title }}\n\n{{ $json.link }}\n\n#blog #automation"
              }]
            }
          }
        },
        {
          id: "post-tweet",
          name: "Post to Twitter",
          type: "n8n-nodes-base.twitter",
          position: [680, 300],
          parameters: {
            operation: "tweet",
            text: "={{ $json.tweetText }}"
          }
        }
      ],
      connections: {
        "RSS Feed Monitor": {
          main: [[{ node: "Format Tweet", type: "main", index: 0 }]]
        },
        "Format Tweet": {
          main: [[{ node: "Post to Twitter", type: "main", index: 0 }]]
        }
      },
      active: true,
      settings: {}
    },
    nodeCount: 3,
    integrations: ["RSS", "Twitter"]
  }
];
