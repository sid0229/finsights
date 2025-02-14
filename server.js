const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// API Configuration
const apiKey = 'up_84U1Zvj5yps8f6qBEwF23O1HzViHr';
const baseUrl = 'https://api.upstage.ai/v1/solar';
const model = 'solar-1-mini-chat';

// Chat history management
let chatHistory = [];
const historySize = 10;

app.post('/chat', async (req, res) => {
    const userPrompt = req.body.prompt;

    // Add user input to the chat history
    chatHistory.push({
        role: 'user',
        content: userPrompt
    });

    // Prepare messages including system prompt and chat history
    const systemPrompt = {
        role: 'system',
        content: 'You are a helpful assistant.'
    };
    const messages = [systemPrompt, ...chatHistory];

    try {
        // Send request to Upstage AI
        const response = await fetch(`${baseUrl}/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        const assistantResponse = data.choices[0].message.content;

        // Add assistant response to the chat history
        chatHistory.push({
            role: 'assistant',
            content: assistantResponse
        });

        // Keep chat history within size limit
        chatHistory = chatHistory.slice(-historySize);

        res.json({ response: assistantResponse });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch response from API.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
