const { EmbedBuilder } = require("discord.js");
const convertDuration = require("../functions/convertDuration.js");

function playingEmbed(title, author, thumbnails, duration, isLive) {
  let status;
  if (isLive === true) {
    status = "24/7 is now onlive";
  } else {
    status = "24/7 is now offlive";
  }

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(title)
    .setAuthor({ name: author })
    .setThumbnail(thumbnails)
    .addFields({
      name: "Duration",
      value: convertDuration(duration.toString()),
    })
    .setTimestamp()
    .setFooter({
      text: status,
      iconURL: "https://i.imgur.com/5J134Jk.jpg",
    });
  return embed;
}

module.exports = playingEmbed;
