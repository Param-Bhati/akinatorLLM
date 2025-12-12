const { SlashCommandBuilder } = require("discord.js");
const { contactEmbed } = require("../game/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("contact")
    .setDescription("Contact the developer and support team."),
  async execute(client, interaction) {
    await interaction.reply({ embeds: [contactEmbed()], ephemeral: true });
  }
};
