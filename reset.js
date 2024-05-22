const { Client, GatewayIntentBits } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log("Bot is ready");

  try {
    console.log("Started removing all slash commands.");

    const guild = await client.guilds.fetch(guildId);
    if (!guild) {
      console.error("Guild not found.");
      return;
    }

    const commands = await guild.commands.fetch();
    if (!commands.size) {
      console.log("No commands to remove.");
      return;
    }

    await guild.commands.set([]);

    console.log("Successfully removed all slash commands.");
  } catch (error) {
    console.error("Error removing slash commands:", error);
  } finally {
    client.destroy();
  }
});

client.login(token);
