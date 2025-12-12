// src/game/engine.js

const { callLlm } = require("../llm/client");
const {
  buildQuestionSystemPrompt,
  buildQuestionUserContent,
  buildGuessSystemPrompt,
  buildGuessUserContent
} = require("../llm/prompts");
const {
  createSession,
  getSession,
  updateSession,
  addAnswer,
  deleteSession,
  cleanupInactive
} = require("./sessions");

// Ask LLM for next question
async function getNextQuestion(userId) {
  const session = getSession(userId);
  if (!session) throw new Error("No session");

  const messages = [
    { role: "system", content: buildQuestionSystemPrompt() },
    {
      role: "user",
      content: buildQuestionUserContent(
        session.mode,
        session.language,
        session.history
      )
    }
  ];

  const text = await callLlm(messages, { maxTokens: 128 });

  // Assume LLM returns plain question text
  const question = text.replace(/^["']|["']$/g, "").trim();
  updateSession(userId, { lastQuestion: question, status: "asking" });
  return question;
}

// Ask LLM for guesses
async function getGuesses(userId) {
  const session = getSession(userId);
  if (!session) throw new Error("No session");

  const messages = [
    { role: "system", content: buildGuessSystemPrompt() },
    {
      role: "user",
      content: buildGuessUserContent(
        session.mode,
        session.language,
        session.history
      )
    }
  ];

  const raw = await callLlm(messages, { maxTokens: 512 });
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // try to extract JSON substring
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("LLM guess response is not valid JSON");
    }
  }

  const shouldGuess = !!parsed.should_guess;
  const guesses = Array.isArray(parsed.guesses) ? parsed.guesses : [];

  return { shouldGuess, guesses };
}

// Public API

function startSession(userId, { mode, language, childMode }) {
  cleanupInactive();
  const existing = getSession(userId);
  if (existing) throw new Error("Session already exists");
  createSession(userId, { mode, language, childMode });
}

function recordAnswer(userId, answerString) {
  const session = getSession(userId);
  if (!session || !session.lastQuestion) return;
  addAnswer(userId, session.lastQuestion, answerString);
}

function endSession(userId) {
  deleteSession(userId);
}

module.exports = {
  startSession,
  getNextQuestion,
  getGuesses,
  recordAnswer,
  endSession
};
