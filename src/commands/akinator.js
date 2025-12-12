const { SlashCommandBuilder } = require("discord.js");
const {
  defaultMode,
  defaultLanguage,
  defaultChildMode,
  supportedModes,
  supportedLanguages
} = require("../config");
const {
  startSession,
  getNextQuestion,
  getGuesses,
  recordAnswer,
  endSession
} = require("../game/engine");
const {
  buildAnswerRow,
  buildControlRow,
  buildGuessRow,
  buildPlayAgainRow,
  mapButtonToAnswer
} = require("../game/buttons");
const {
  questionEmbed,
  guessEmbed,
  stoppedEmbed,
  winEmbed,
  loseEmbed
} = require("../game/embeds");
const { getSession } = require("../game/sessions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("akinator")
    .setDescription("Play an LLM-powered Akinator-style guessing game.")
    .addStringOption(option =>
      option
        .setName("mode")
        .setDescription("What should I guess?")
        .setRequired(false)
        .addChoices(
          { name: "Character (default)", value: "character" },
          { name: "Animal", value: "animal" },
          { name: "Object", value: "object" }
        )
    )
    .addStringOption(option =>
      option
        .setName("language")
        .setDescription("Language for the game (default: en)")
        .setRequired(false)
        .addChoices(
          { name: "English", value: "en" },
          { name: "French", value: "fr" },
          { name: "Spanish", value: "es" },
          { name: "German", value: "de" },
          { name: "Italian", value: "it" },
          { name: "Portuguese", value: "pt" },
          { name: "Russian", value: "ru" }
        )
    )
    .addBooleanOption(option =>
      option
        .setName("child_mode")
        .setDescription("Filter NSFW/mature content (default: off)")
        .setRequired(false)
    ),

  async execute(client, interaction) {
    const mode = interaction.options.getString("mode") || defaultMode;
    const language = interaction.options.getString("language") || defaultLanguage;
    const childMode =
      interaction.options.getBoolean("child_mode") === null
        ? defaultChildMode
        : interaction.options.getBoolean("child_mode");

    if (!supportedModes.includes(mode) || !supportedLanguages.includes(language)) {
      return interaction.reply({
        content: "Invalid options.",
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();

      startSession(interaction.user.id, { mode, language, childMode });
      const question = await getNextQuestion(interaction.user.id);

      const embed = questionEmbed(interaction.user, question, 1);
      const answerRow = buildAnswerRow();
      const controlRow = buildControlRow();

      await interaction.editReply({
        embeds: [embed],
        components: [answerRow, controlRow]
      });
    } catch (err) {
      console.error("Akinator start error:", err);
      await interaction.editReply({ content: "❌ Failed to start game." });
    }
  },

  async handleButton(client, interaction) {
    const userId = interaction.user.id;
    const session = getSession(userId);

    if (!session) {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({
          content: "You don't have an active game. Use `/akinator` to start one.",
          ephemeral: true
        });
      }
      return;
    }

    const customId = interaction.customId;

    // Stop
    if (customId === "aki_stop") {
      await interaction.deferUpdate();
      endSession(userId);
      const embed = stoppedEmbed(interaction.user);
      await interaction.message.edit({ embeds: [embed], components: [] });
      return;
    }

    // Play again
    if (customId === "aki_play_again") {
      await interaction.deferUpdate();
      endSession(userId);
      await interaction.followUp({
        content: "Use `/akinator` again to start a new game.",
        ephemeral: true
      });
      return;
    }

    // Guess confirmation: correct
    if (customId === "aki_correct") {
      await interaction.deferUpdate();
      client.stats.gamesPlayed += 1;
      client.stats.gamesWon += 1;
      const lastGuess = session.lastGuessName || "your character";
      const embed = winEmbed(interaction.user, lastGuess);
      const row = buildPlayAgainRow();
      endSession(userId);
      await interaction.message.edit({ embeds: [embed], components: [row] });
      return;
    }

    // Guess confirmation: wrong → keep playing, don’t end game
    if (customId === "aki_wrong") {
      await interaction.deferUpdate();

      session.lastGuessName = null;

      try {
        const question = await getNextQuestion(userId);
        const steps = session.history.length + 1;
        const embed = questionEmbed(interaction.user, question, steps);
        const answerRow = buildAnswerRow();
        const controlRow = buildControlRow();

        await interaction.message.edit({
          embeds: [embed],
          components: [answerRow, controlRow]
        });
      } catch (err) {
        console.error("Error after wrong guess:", err);
        client.stats.gamesPlayed += 1;
        const embed = loseEmbed(interaction.user);
        const row = buildPlayAgainRow();
        endSession(userId);
        await interaction.message.edit({ embeds: [embed], components: [row] });
      }

      return;
    }

    // Back button – still a no-op for now
    if (customId === "aki_back") {
      await interaction.deferUpdate();
      await interaction.followUp({
        content: "Back is not supported yet in this version.",
        ephemeral: true
      });
      return;
    }

    // Normal answer
    const answerString = mapButtonToAnswer(customId);
    if (!answerString) return;

    try {
      await interaction.deferUpdate();

      // Record answer to last question
      recordAnswer(userId, answerString);

      const steps = session.history.length;

      // Try guessing less frequently and only after enough info
      if (steps >= 8 && steps % 4 === 0) {
        const { shouldGuess, guesses } = await getGuesses(userId);
        if (shouldGuess && guesses.length > 0) {
          const best = guesses[0];
          session.lastGuessName = best.name;
          const embed = guessEmbed(interaction.user, best);
          const row = buildGuessRow();
          await interaction.message.edit({ embeds: [embed], components: [row] });
          return;
        }
      }

      // Ask next question
      const question = await getNextQuestion(userId);
      const embed = questionEmbed(interaction.user, question, steps + 1);
      const answerRow = buildAnswerRow();
      const controlRow = buildControlRow();

      await interaction.message.edit({
        embeds: [embed],
        components: [answerRow, controlRow]
      });
    } catch (err) {
      console.error("Akinator button error:", err);
      client.stats.gamesPlayed += 1;
      const embed = loseEmbed(interaction.user);
      const row = buildPlayAgainRow();
      endSession(userId);
      await interaction.message.edit({ embeds: [embed], components: [row] });
    }
  }
};
