const { SlashCommandBuilder } = require("discord.js");
const { helpEmbed } = require("../game/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show information about the bot and its commands."),
  async execute(client, interaction) {
    await interaction.reply({ embeds: [helpEmbed()], ephemeral: true });
  }
};
