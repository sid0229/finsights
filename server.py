from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# OpenAI API Client
client = OpenAI(
    api_key="up_84U1Zvj5yps8f6qBEwF23O1HzViHr",  # Replace with your actual API key
    base_url="https://api.upstage.ai/v1/solar"
)

# Global system prompt for the chatbotpyth
system_prompt = {
    "role": "system",
    "content": "You are a helpful assistant."
}

# Chat history management
chat_history = []
history_size = 10  # Limit chat history to the latest 10 messages

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')

    # Add user message to chat history
    chat_history.append({
        "role": "user",
        "content": user_message
    })

    # Prepare message history for OpenAI completion
    messages = [system_prompt] + chat_history
    
    try:
        # Call the OpenAI API
        stream = client.chat.completions.create(
            model="solar-1-mini-chat",
            messages=messages,
            stream=True
        )

        # Collect the response chunks
        solar_response = ""
        for chunk in stream:
            response_content = chunk.choices[0].delta.content
            if response_content:
                solar_response += response_content
        
        # Append the bot response to chat history
        chat_history.append({
            "role": "assistant",
            "content": solar_response
        })

        # Ensure the chat history doesn't exceed the size limit
        chat_history[:] = chat_history[-history_size:]

        return jsonify({"response": solar_response})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to fetch response from OpenAI."}), 500

if __name__ == '__main__':
    app.run(debug=True)
