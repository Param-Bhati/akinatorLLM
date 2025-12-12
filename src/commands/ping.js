const { SlashCommandBuilder } = require("discord.js");
const { pingEmbed } = require("../game/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency."),
  async execute(client, interaction) {
    const sent = Date.now();
    await interaction.reply({ content: "Pinging...", ephemeral: true });
    const diff = Date.now() - sent;
    const wsPing = Math.round(client.ws.ping);

    const embed = pingEmbed(diff, wsPing);
    await interaction.editReply({ content: "", embeds: [embed] });
  }
};
