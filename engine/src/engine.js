// engine/src/engine.js
// Core guessing engine: loads characters & questions, tracks probabilities,
// picks next question, and updates beliefs based on answers.

const fs = require("node:fs");
const path = require("node:path");

// ---------- Load data ----------

const CHARACTERS_PATH = path.join(__dirname, "..", "data", "characters.json");
const QUESTIONS_PATH = path.join(__dirname, "..", "data", "questions.json");

/**
 * Load characters and questions from JSON files.
 */
function loadData() {
  const characters = JSON.parse(fs.readFileSync(CHARACTERS_PATH, "utf8"));
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  return { characters, questions };
}

// ---------- Engine class ----------

class GameEngine {
  constructor() {
    const { characters, questions } = loadData();
    this.characters = characters;
    this.questions = questions;

    // Equal prior probability over all characters
    const n = characters.length;
    this.probabilities = characters.map(() => 1 / n);

    // Keep track of asked questions to avoid repeats
    this.askedQuestionIds = new Set();
  }

  /**
   * Return a snapshot of current ranked candidates.
   */
  getRankedCandidates() {
    return this.characters
      .map((c, idx) => ({
        character: c,
        p: this.probabilities[idx],
      }))
      .sort((a, b) => b.p - a.p);
  }

  /**
   * Get the best current guess (top candidate).
   */
  getBestGuess() {
    const ranked = this.getRankedCandidates();
    return ranked[0];
  }

  /**
   * Select the next question to ask.
   * For now: simple heuristic — pick first unused question.
   * Later: replace with information-gain based selection.
   */
  getNextQuestion() {
    for (const q of this.questions) {
      if (!this.askedQuestionIds.has(q.id)) {
        this.askedQuestionIds.add(q.id);
        return q;
      }
    }
    return null; // no questions left
  }

  /**
   * Update probabilities given a question and an answer string.
   * answerStr: "yes" | "no" | "idk" | "probably" | "probably_not"
   */
  applyAnswer(question, answerStr) {
    const answerKey = answerStr.toLowerCase();
    if (!question.answers.includes(answerKey)) {
      // invalid / unexpected answer; no update
      return;
    }

    const effect = question.effect[answerKey];
    if (!effect) return;

    // For each character, compute a likelihood multiplier based on the question type.
    const newProbs = [];
    for (let i = 0; i < this.characters.length; i++) {
      const c = this.characters[i];
      const prior = this.probabilities[i];

      let likelihood = 1.0;

      if (question.type === "boolean") {
        const value = getNestedBooleanAttribute(c, question.attribute);
        const key = value ? "true" : "false";
        likelihood = effect[key] ?? 1.0;
      } else if (question.type === "tag") {
        const hasTag = characterHasTag(c, question.attribute);
        const key = hasTag ? "has" : "not_has";
        likelihood = effect[key] ?? 1.0;
      } else if (question.type === "categorical") {
        const val = getNestedAttribute(c, question.attribute);
        // Only weights defined keys; others default to 1
        likelihood = effect[val] ?? 1.0;
      }

      newProbs.push(prior * likelihood);
    }

    // Normalize
    normalizeInPlace(newProbs);
    this.probabilities = newProbs;
  }
}

// ---------- Helper functions ----------

/**
 * Get nested attribute like "meta.gender" from an object.
 */
function getNestedAttribute(obj, pathStr) {
  const parts = pathStr.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/**
 * Get nested boolean attribute, defaulting to false if missing.
 */
function getNestedBooleanAttribute(obj, pathStr) {
  const v = getNestedAttribute(obj, pathStr);
  return Boolean(v);
}

/**
 * Check if character has the tag referenced by a "tag:xxx" attribute.
 * Example attribute: "tag:from_anime" → tagName = "from_anime"
 */
function characterHasTag(character, attributeStr) {
  const [, tagName] = attributeStr.split(":");
  if (!tagName) return false;
  return Array.isArray(character.tags) && character.tags.includes(tagName);
}

/**
 * Normalize a probability array in-place.
 */
function normalizeInPlace(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    const n = arr.length;
    const v = 1 / n;
    for (let i = 0; i < n; i++) arr[i] = v;
    return;
  }
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i] / sum;
  }
}

// ---------- Simple test harness (optional) ----------

if (require.main === module) {
  // Quick CLI test: node engine/src/engine.js
  const engine = new GameEngine();
  console.log("Loaded characters:", engine.characters.length);
  console.log("Top guess at start:", engine.getBestGuess().character.name);

  let q = engine.getNextQuestion();
  console.log("Q1:", q.text);

  // Simulate user answering "yes" to first question
  engine.applyAnswer(q, "yes");
  console.log("After answer 'yes', top guess:", engine.getBestGuess().character.name);

  q = engine.getNextQuestion();
  console.log("Q2:", q ? q.text : "No more questions");
}

// ---------- Exports ----------

module.exports = {
  GameEngine,
};
