// src/game/sessions.js

const sessions = new Map(); // userId -> session

function createSession(userId, data) {
  sessions.set(userId, {
    userId,
    mode: data.mode,
    language: data.language,
    childMode: data.childMode,
    history: [], // { question, answer }
    status: "asking", // "asking" | "guessing" | "finished"
    lastQuestion: null,
    createdAt: Date.now(),
    lastActivity: Date.now()
  });
}

function getSession(userId) {
  return sessions.get(userId) || null;
}

function updateSession(userId, partial) {
  const session = sessions.get(userId);
  if (!session) return;
  sessions.set(userId, {
    ...session,
    ...partial,
    lastActivity: Date.now()
  });
}

function addAnswer(userId, question, answer) {
  const session = sessions.get(userId);
  if (!session) return;
  session.history.push({ question, answer });
  session.lastQuestion = null;
  session.lastActivity = Date.now();
}

function deleteSession(userId) {
  sessions.delete(userId);
}

function cleanupInactive(maxAgeMs = 10 * 60 * 1000) {
  const now = Date.now();
  for (const [userId, session] of sessions.entries()) {
    if (now - session.lastActivity > maxAgeMs) {
      sessions.delete(userId);
    }
  }
}

module.exports = {
  createSession,
  getSession,
  updateSession,
  addAnswer,
  deleteSession,
  cleanupInactive
};
