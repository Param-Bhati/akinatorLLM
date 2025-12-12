const { SlashCommandBuilder } = require("discord.js");
const { statsEmbed } = require("../game/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show bot statistics."),
  async execute(client, interaction) {
    const embed = statsEmbed(client, client.stats);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
