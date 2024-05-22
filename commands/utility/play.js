const { SlashCommandBuilder, CommandInteraction } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const playingEmbed = require("../../components/playingEmbed.js");
const noticeEmbed = require("../../components/noticeEmbed.js");
const youtubeApi = require("../../apis/youtubeApi.js");

const sodium = require("libsodium-wrappers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from YouTube.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The URL of the YouTube video")
        .setRequired(false)
    ),
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    await sodium.ready;

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply({
        embeds: [
          noticeEmbed("You need to be in a voice channel to play music!"),
        ],
      });
      return;
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const url = interaction.options.getString("url");
      if (!url || !ytdl.validateURL(url)) {
        await interaction.reply({
          embeds: [noticeEmbed("Please provide a valid YouTube URL!")],
        });
        return;
      }

      const videoId = url.split("v=")[1]; // Extract video ID from URL
      const response = await youtubeApi.detail(videoId);
      const videoDetails = response.items[0];

      const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25, // 32MB
        dlChunkSize: 0,
      });
      const resource = createAudioResource(stream, { metadata: { url } });
      const player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);

      player.on("error", (error) => {
        console.error(
          `Error: ${error.message} with resource ${resource.metadata.url}`
        );
      });

      player.on("idle", () => {
        setTimeout(() => {
          connection.destroy();
        }, 5000); // Wait for 5 seconds before destroying the connection
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 30e3);

      const embed = playingEmbed(
        videoDetails.snippet.title,
        videoDetails.snippet.channelTitle,
        videoDetails.snippet.thumbnails.default.url,
        videoDetails.contentDetails.duration
      );
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply("An error occurred while trying to play the song.");
    }
  },
};
