const { SlashCommandBuilder } = require("discord.js");
const noticeEmbed = require("../../components/noticeEmbed.js");

const stayInChannelSettings = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("247")
    .setDescription("Toggles to prevent bot disconnect the voice channel"),
  async execute(interaction) {
    const guildId = interaction.guild.id;

    // If the guild doesn't have a setting yet, default to false
    if (!stayInChannelSettings.hasOwnProperty(guildId)) {
      stayInChannelSettings[guildId] = false;
    }

    // Toggle the setting
    stayInChannelSettings[guildId] = !stayInChannelSettings[guildId];

    // Reply with the new setting
    if (stayInChannelSettings[guildId] == true) {
      await interaction.reply({
        embeds: [noticeEmbed("24/7 is now onlive")],
      });
    } else {
      await interaction.reply({
        embeds: [noticeEmbed("24/7 is now offlive")],
      });
    }
  },
};
