// src/llm/client.js
require("dotenv").config();
const Groq = require("groq-sdk");

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.warn("[LLM] Missing GROQ_API_KEY in .env – LLM features will not work.");
}

const groq = new Groq({ apiKey });

/**
 * Call LLaMA-3.1 8B on Groq with a messages array.
 * @param {Array<{role: "system"|"user"|"assistant", content: string}>} messages
 * @param {object} options
 * @returns {Promise<string>}
 */
async function callLlm(messages, options = {}) {
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not set");
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 512
  });

  const content = response.choices?.[0]?.message?.content || "";
  return content.trim();
}

module.exports = {
  callLlm
};
