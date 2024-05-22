const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const noticeEmbed = require("../../components/noticeEmbed.js");

module.exports = {
   data: new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Stop the bot from playing music and leave the channel"),
   async execute(interaction) {
      // Get the voice connection for the guild
      const connection = getVoiceConnection(interaction.guild.id);

      // Check if the bot is in a voice channel
      if (!connection) {
         return interaction.reply({
            embeds: [noticeEmbed("The bot is not in a voice channel.")],
         });
      }

      // Stop any audio that is currently playing
      if (
         connection.state.status !== "destroyed" &&
         connection.state.subscription
      ) {
         connection.state.subscription.player.stop();
      }

      // Disconnect from the voice channel
      connection.destroy();

      // Send a reply
      await interaction.reply({
         embeds: [noticeEmbed("Stopped playing music and left the channel.")],
      });
   },
};
