import { OpenRouter } from "@openrouter/sdk";
import dotenv from "dotenv";

// Load env from the root of krishigram_backend
dotenv.config({ path: "./config.env" });

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

/**
 * Standard text completion with reasoning token support
 * @param {Array} messages - Chat messages
 * @param {Object} options - Additional options (model, etc)
 */
export const sendChat = async (messages, options = {}) => {
  try {
    const model = options.model || process.env.OPENROUTER_MODEL || "arcee-ai/trinity-large-preview:free";
    
    // We use send() which return a stream or a full response based on options
    // For simplicity in the first phase, we'll do non-streaming unless requested
    const response = await openrouter.chat.send({
      model: model,
      messages: messages,
      stream: false
    });

    if (response.usage) {
      console.log(`[AI USAGE] Prompt: ${response.usage.prompt_tokens}, Completion: ${response.usage.completion_tokens}, Reasoning: ${response.usage.reasoningTokens || 0}`);
    }

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenRouter SDK Error:", error);
    throw error;
  }
};

export default openrouter;
