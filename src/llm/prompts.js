// src/llm/prompts.js

const { supportedModes } = require("../config");

// Build system prompt for question generation
function buildQuestionSystemPrompt() {
  return (
    "You are a guessing game engine for a Discord bot.\n" +
    "The user is thinking of a character, animal, or object.\n" +
    "You ask ONE question at a time to narrow down the possibilities.\n" +
    "Questions must be answerable with: yes, no, i don't know, probably, probably not.\n" +
    "Do not guess yet; only ask the next best discriminative question.\n" +
    "Avoid repeating questions and keep them short, clear, and specific.\n" +
    "Never include explanations or commentary, only the question itself."
  );
}

// User content for next-question request
function buildQuestionUserContent(mode, language, history) {
  const safeMode = supportedModes.includes(mode) ? mode : "character";

  const lines = [];
  lines.push(`Mode: ${safeMode}`);
  lines.push(`Language: ${language || "en"}`);
  lines.push("History of questions and answers:");

  if (!history || history.length === 0) {
    lines.push("(no questions asked yet)");
  } else {
    history.forEach((entry, idx) => {
      lines.push(`${idx + 1}. Q: ${entry.question} A: ${entry.answer}`);
    });
  }

  lines.push("");
  lines.push("Now propose the next BEST question to narrow down the hidden entity.");

  return lines.join("\n");
}

// Build system prompt for guessing
function buildGuessSystemPrompt() {
  return (
    "You are a cautious guessing engine for a Discord bot.\n" +
    "The user is thinking of a single unknown entity.\n" +
    "You have a list of yes/no/maybe questions and the user's answers.\n" +
    "Your task is to decide whether you can reasonably guess now.\n" +
    "- Only set should_guess to true if you are AT LEAST 75% confident overall.\n" +
    "- If you are not confident, set should_guess to false and return an empty guesses array.\n" +
    "- If you guess, output your top 3–5 candidates ordered by confidence, each with:\n" +
    "  name (string), description (string), confidence (number 0–100), image (string or null).\n" +
    "Be conservative: if the traits could match many entities, do NOT guess yet.\n" +
    "Respond STRICTLY as JSON:\n" +
    "{ \"should_guess\": boolean, \"guesses\": [ { \"name\": \"...\", \"description\": \"...\", \"confidence\": 0-100, \"image\": \"url or null\" }, ... ] }"
  );
}

// User content for guessing request
function buildGuessUserContent(mode, language, history) {
  const lines = [];
  lines.push(`Mode: ${mode}`);
  lines.push(`Language: ${language || "en"}`);
  lines.push("History of questions and answers:");

  if (!history || history.length === 0) {
    lines.push("(no questions asked yet)");
  } else {
    history.forEach((entry, idx) => {
      lines.push(`${idx + 1}. Q: ${entry.question} A: ${entry.answer}`);
    });
  }

  lines.push("");
  lines.push(
    "Be conservative: if the traits could match many entities, do NOT guess yet. " +
      "Only set should_guess to true if you are at least 75% confident overall."
  );

  return lines.join("\n");
}

module.exports = {
  buildQuestionSystemPrompt,
  buildQuestionUserContent,
  buildGuessSystemPrompt,
  buildGuessUserContent
};
