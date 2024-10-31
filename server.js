const Hapi = require('@hapi/hapi');
const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const Groq = require("groq-sdk");
const marked = require('marked');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Cookie = require('@hapi/cookie');
const Path = require('path');
const uuid = require('uuid');
require('dotenv').config();

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: '0.0.0.0',
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    });

    await server.register([
        Inert,
        Vision,
        Cookie
    ]);

    server.auth.strategy('session', 'cookie', {
        cookie: {
            name: 'session',
            password: process.env.COOKIE_PASSWORD,
            isSecure: process.env.NODE_ENV === 'production',
            path: '/'
        },
        redirectTo: '/'
    });

    server.auth.default('session');

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: 'views'
    });

    // Initialize Anthropic
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Initialize OpenAI
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Groq
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Store conversation histories
    const conversationHistories = new Map();

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: Path.join(__dirname, 'public'),
                redirectToSlash: true,
                index: true,
            }
        },
        options: {
            auth: false
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: {
                mode: 'try'
            }
        },
        handler: (request, h) => {
            let sessionId = request.state.session ? request.state.session.sessionId : null;
            if (!sessionId) {
                sessionId = uuid.v4();
                h.state('session', { sessionId });
                conversationHistories.set(sessionId, []);
            }
            const conversation = conversationHistories.get(sessionId) || [];
            return h.view('index', { conversation, marked });
        }
    });

    server.route({
        method: 'POST',
        path: '/generate',
        options: {
            auth: {
                mode: 'try'
            }
        },
        handler: async (request, h) => {
            try {
                const sessionId = request.state.session ? request.state.session.sessionId : null;
                if (!sessionId) {
                    return h.response({ error: 'No session found' }).code(400);
                }
                const userInput = request.payload.userInput;
                const selectedAPI = request.payload.selectedAPI;
                let conversationHistory = conversationHistories.get(sessionId) || [];
                
                // Add user message to conversation history
                conversationHistory.push({ role: 'user', content: userInput });

                let aiResponse;

                if (selectedAPI === 'anthropic') {
                    const response = await anthropic.messages.create({
                        model: "claude-3-5-sonnet-20241022",
                        max_tokens: 4096,
                        temperature: 0.1,
                        top_p: 0.95,
                        system: "You're a nonchalant like The Dude from The Big Lebowski.",
                        messages: conversationHistory
                    });
                    aiResponse = response.content[0].text;
                } else if (selectedAPI === 'openai') {
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o-mini", // or another appropriate model
                        messages: [
                            { role: "system", content: "You're a nonchalant like The Dude from The Big Lebowski." },
                            ...conversationHistory
                        ],
                        max_tokens: 4096,
                        temperature: 0.1,
                        top_p: 0.95,
                    });
                    aiResponse = response.choices[0].message.content;
                } else if (selectedAPI === 'groq') {
                    const response = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: "You are a seasoned and meticulous IT Engineer." },
                            ...conversationHistory
                        ],
                        model: "llama-3.1-70b-versatile",
                        temperature: 0.3,
                        max_tokens: 8000,
                        top_p: 0.9,
                    });
                    aiResponse = response.choices[0].message.content;
                } else {
                    return h.response({ error: 'Invalid API selected' }).code(400);
                }
                
                // Add AI response to conversation history
                conversationHistory.push({ role: 'assistant', content: aiResponse });

                // Update the conversation history for this session
                conversationHistories.set(sessionId, conversationHistory);

                return h.response({ response: aiResponse }).type('application/json');
            } catch (error) {
                console.error('An error occurred:', error);
                return h.response({ error: 'An error occurred. Please try again.' }).code(500).type('application/json');
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/clear',
        options: {
            auth: {
                mode: 'try'
            }
        },
        handler: function (request, h) {
            const sessionId = request.state.session ? request.state.session.sessionId : null;
            if (sessionId) {
                conversationHistories.set(sessionId, []);
            }
            return h.response().code(200);
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();