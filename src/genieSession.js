// src/genieSession.js
const { GameEngine } = require("../engine/src/engine");

// Simple in-memory session map: userId -> session
const sessions = new Map();

function startSession(userId) {
  const engine = new GameEngine();
  const session = {
    engine,
    createdAt: Date.now(),
  };
  sessions.set(userId, session);
  return session;
}

function getSession(userId) {
  return sessions.get(userId) || null;
}

function endSession(userId) {
  sessions.delete(userId);
}

module.exports = {
  startSession,
  getSession,
  endSession,
};
