# AIssistant

AIssistant is a versatile AI-powered chat application that provides intelligent responses based on customizable system prompts. Built with Hapi.js and integrated with the Anthropic, OpenAi and Groq APIs, AIssistant offers a flexible platform for engaging with AI in various contexts.
This application was built for personal home usage only as there is no user account creation and login functionality implemented. 

## Features

- **Customizable AI Persona**: Set your own system prompt to tailor the AI's behavior and knowledge base.
- **Session-Based Conversations**: Each user gets a unique session, ensuring private and persistent conversations.
- **Markdown Support**: AI responses are rendered in Markdown for rich text formatting.
- **Exportable Conversations**: Users can export their entire conversation history as a Markdown file.
- **Themeable Interface**: Comes with multiple built-in themes, including the default "Monokai Pro" theme.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Prerequisites

- Node.js (v14 or later recommended)
- npm (v6 or later)
- An Anthropic, OpenAi and/or Groq API key

## Installation

1. Clone the repository:

```
git clone https://github.com/harpo/aissistant.git
cd aissistant
```



2. Install dependencies:
`npm install`


3. Create a `.env` file in the root directory and add your API keys and a secure cookie password:
```
ANTHROPIC_API_KEY=your_api_key_here
GROQ_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here
COOKIE_PASSWORD=your_secure_cookie_password_here
PORT=3000
```

## Usage

1. Start the server:
`npm start`


2. Open a web browser and navigate to `http://localhost:3000`.

3. Begin chatting with the AI. You can customize the system prompt (AI persona) in the server.js file.

## Customization

- **Themes**: Add or modify themes in the `public/css` directory.
- **AI API Parameters**: Edit the API parameters like, model, system, temperature in the three API calls within `server.js`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Hapi.js](https://hapi.dev/)
- AI powered by [Anthropic](https://www.anthropic.com/), [Groq](https://groq.com/), ['OpenAI'](https://openai.com/)
- Markdown rendering by [Marked](https://marked.js.org/)

## Disclaimer

This application is for demonstration purposes.