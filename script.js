const chatbox = document.getElementById('chatbox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    appendMessage('user-message', message);
    messageInput.value = '';

    try {
        const botMessage = await getBotResponse(message);
        appendMessage('bot-message', botMessage);
    } catch (error) {
        appendMessage('bot-message', 'Something went wrong. Please try again.');
    }

    chatbox.scrollTop = chatbox.scrollHeight;
}

function appendMessage(type, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', type);
    messageElement.textContent = message;
    chatbox.appendChild(messageElement);
}

async function getBotResponse(userMessage) {
    try {
        const response = await fetch('http://localhost:5000/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: userMessage })
        });

        const data = await response.json();

        if (data.reply) {
            return data.reply;
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Failed to get response. Please try again later.';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        // Display user message
        chatBox.innerHTML += `<div class="user-message">${userMessage}</div>`;
        userInput.value = '';

        try {
            const response = await fetch('http://localhost:5000/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userMessage }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();

            // Display bot response
            chatBox.innerHTML += `<div class="bot-message">${data.reply || 'No response from server.'}</div>`;
        } catch (error) {
            console.error('Error:', error);
            chatBox.innerHTML += `<div class="bot-message">Failed to get response. Please try again later.</div>`;
        }
    });
});
