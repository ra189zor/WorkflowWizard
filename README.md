# WorkflowWizard

A powerful AI-driven tool that converts natural language descriptions into fully functional n8n workflow configurations. Built with Node.js, Express, React, and OpenAI's GPT-4, this application helps users create complex automation workflows without needing deep technical knowledge of n8n.

## Description

The N8n Automation Generator is designed to bridge the gap between natural language automation ideas and their technical implementation. Users can describe their desired automation in plain English, and the system generates complete, importable n8n workflow JSON configurations with detailed explanations and suggestions.

### Key Features
- **Natural Language Processing**: Convert plain English descriptions into n8n workflows
- **AI-Powered Generation**: Uses OpenAI's GPT-4 for intelligent workflow creation
- **Real-time Validation**: Built-in workflow validation and error checking
- **Template Library**: Pre-built workflow templates for common use cases
- **Interactive UI**: Modern React interface with real-time feedback
- **Workflow Management**: Save, organize, and manage generated workflows
- **Conversation History**: Track and continue automation discussions

### Background
n8n is a powerful workflow automation tool, but creating complex workflows requires technical expertise. This generator democratizes automation by allowing anyone to describe their needs in natural language and receive production-ready workflow configurations.

## Badges

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)
![License](https://img.shields.io/badge/License-MIT-green)


## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- OpenAI API key
- PostgreSQL database (optional, for workflow storage)

### Requirements
- Windows 10/11, macOS, or Linux
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for OpenAI API access

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd N8nAutomationGenerator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=your_database_connection_string_here
   ```

4. **Database Setup** (Optional)
   ```bash
   npm run db:push
   ```

## Usage

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5000`

### Production Mode
```bash
npm run build
npm start
```

### Basic Example
1. Open the application in your browser
2. Enter a natural language description like: "When I receive an email from a new customer, save their information to Google Sheets and send them a welcome message on Slack"
3. Click "Generate Workflow"
4. Review the generated n8n workflow with explanations and suggestions
5. Export the JSON configuration and import it into your n8n instance

### Advanced Usage
- Use the template library to start with common automation patterns
- Leverage the conversation feature to iterate on workflow improvements
- Validate workflows before importing to ensure compatibility
- Save and organize workflows for future reference


## Roadmap

### Version 1.1
- [ ] Enhanced workflow validation
- [ ] More n8n node types support
- [ ] Workflow optimization suggestions
- [ ] Export to different formats


## Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Make your changes
5. Run tests: `npm run check`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run type checking
npm run check

# Build for production
npm run build
```

### Code Quality
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## Authors and Acknowledgment

**Author**: Muhammad Abdullah

### Acknowledgments
- OpenAI for providing the GPT-4 API
- The n8n team for their excellent workflow automation platform
- The React and Node.js communities for their amazing tools and libraries
- Contributors and beta testers who provided valuable feedback

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Muhammad Abdullah** 