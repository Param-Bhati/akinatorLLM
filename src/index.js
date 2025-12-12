// src/index.js

require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType, Collection } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const handleInteraction = require("./handlers/interaction");

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Missing DISCORD_TOKEN in .env");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();
client.stats = {
  gamesPlayed: 0,
  gamesWon: 0
};

// load command files
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

const statuses = ["Playing /akinator", "Guessing your thoughts", "BotWorks.Inc"];

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  let i = 0;
  const setStatus = () => {
    const name = statuses[i % statuses.length];
    try {
      client.user.setActivity({ name, type: ActivityType.Playing });
    } catch {
      // ignore
    }
    i++;
  };

  setStatus();
  setInterval(setStatus, 30000);
});

client.on("interactionCreate", interaction => handleInteraction(client, interaction));

client.login(token);
