const { EmbedBuilder } = require("discord.js");

function noticeEmbed(params) {
  const embed = new EmbedBuilder().setColor(0x0099ff).setDescription(params);
  return embed;
}

module.exports = noticeEmbed;
