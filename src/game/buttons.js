// src/game/buttons.js

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

// Answer buttons: Yes / No / IDK / Probably / Probably Not
function buildAnswerRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("aki_yes")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("aki_no")
      .setEmoji("❌")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("aki_idk")
      .setEmoji("❓")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("aki_prob")
      .setEmoji("👍")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("aki_probno")
      .setEmoji("👎")
      .setStyle(ButtonStyle.Primary)
  );
}

// Control buttons: Back / Stop
function buildControlRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("aki_back")
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("aki_stop")
      .setEmoji("🛑")
      .setStyle(ButtonStyle.Danger)
  );
}

// Guess confirmation buttons: Correct / Wrong / Play again
function buildGuessRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("aki_correct")
      .setLabel("Correct")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("aki_wrong")
      .setLabel("Wrong")
      .setStyle(ButtonStyle.Danger)
  );
}

function buildPlayAgainRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("aki_play_again")
      .setLabel("Play again")
      .setStyle(ButtonStyle.Success)
  );
}

// Map button → answer string used in LLM history
function mapButtonToAnswer(customId) {
  switch (customId) {
    case "aki_yes":
      return "yes";
    case "aki_no":
      return "no";
    case "aki_idk":
      return "i don't know";
    case "aki_prob":
      return "probably";
    case "aki_probno":
      return "probably not";
    default:
      return null;
  }
}

module.exports = {
  buildAnswerRow,
  buildControlRow,
  buildGuessRow,
  buildPlayAgainRow,
  mapButtonToAnswer
};
