// src/handlers/interaction.js

module.exports = async (client, interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(client, interaction);
      return;
    }

    if (interaction.isButton()) {
      const command = client.commands.get("akinator");
      if (command && typeof command.handleButton === "function") {
        await command.handleButton(client, interaction);
      }
      return;
    }
  } catch (error) {
    console.error("Interaction handler error:", error);
    if (interaction.isRepliable()) {
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: "❌ An error occurred.",
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: "❌ An error occurred.",
            ephemeral: true
          });
        }
      } catch {
        // ignore
      }
    }
  }
};
