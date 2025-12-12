const { EmbedBuilder } = require("discord.js");
const { embedColor, footerText } = require("../config");

function baseEmbed(user) {
  const embed = new EmbedBuilder().setColor(embedColor);
  if (user) {
    embed.setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL({ dynamic: true })
    });
  }
  return embed.setFooter({ text: footerText });
}

function helpEmbed() { /* unchanged */ }
function pingEmbed(latency, wsPing) { /* unchanged */ }
function statsEmbed(client, stats) { /* unchanged */ }
function contactEmbed() { /* unchanged */ }

// New:

function questionEmbed(user, question, step) {
  return baseEmbed(user)
    .setTitle(`❓ Question ${step}`)
    .setDescription(`**${question}**`);
}

function guessEmbed(user, guess) {
  const embed = baseEmbed(user)
    .setTitle("🤔 My best guess")
    .setDescription(
      `**Name:** ${guess.name}\n` +
        (guess.description ? `**Description:** ${guess.description}\n` : "") +
        (guess.confidence != null
          ? `**Confidence:** ${guess.confidence.toFixed?.(1) ?? guess.confidence}%`
          : "")
    );

  if (guess.image) {
    embed.setThumbnail(guess.image);
  }

  return embed;
}

function stoppedEmbed(user) {
  return baseEmbed(user)
    .setTitle("🛑 Game stopped")
    .setDescription(`${user.username}, you ended the game.`);
}

function timeoutEmbed(user) {
  return baseEmbed(user)
    .setTitle("⌛ Game timed out")
    .setDescription(`${user.username}, no activity for a while, so the game ended.`);
}

function winEmbed(user, name) {
  return baseEmbed(user)
    .setTitle("🎉 I guessed it!")
    .setDescription(`You were thinking of **${name}**!`);
}

function loseEmbed(user) {
  return baseEmbed(user)
    .setTitle("😔 I couldn't guess")
    .setDescription("I ran out of guesses this time.");
}

module.exports = {
  baseEmbed,
  helpEmbed,
  pingEmbed,
  statsEmbed,
  contactEmbed,
  questionEmbed,
  guessEmbed,
  stoppedEmbed,
  timeoutEmbed,
  winEmbed,
  loseEmbed
};
