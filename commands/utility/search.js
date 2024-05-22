const { SlashCommandBuilder, StringSelectMenuBuilder } = require("discord.js");
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
const stayInChannelSettings = require("./247.js");

const sodium = require("libsodium-wrappers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search YouTube videos by name")
    .addStringOption((options) =>
      options
        .setName("name")
        .setDescription("Name of video you want to find")
        .setRequired(true)
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
      const name = interaction.options.getString("name");
      if (!name)
        return interaction.reply({
          embeds: [noticeEmbed("Please provide a valid name!")],
        });

      // Call YouTube Search API
      const response = await youtubeApi.search(name);

      //   console.log(data);
      if (!response.items || response.items.length === 0) {
        return interaction.reply({
          embeds: [noticeEmbed("No videos found for the given name.")],
        });
      }

      try {
        // Prepare options for select menu
        const videos = response.items.map((item) => ({
          label: item.snippet.title.substring(0, 100),
          value: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("videoSelect")
          .setPlaceholder("Select a video")
          .addOptions(videos);

        // Send interaction reply with select menu
        await interaction.deferReply();
        await interaction.editReply({
          embeds: [noticeEmbed("Please select a video:")],
          content: "",
          components: [{ type: 1, components: [selectMenu] }],
        });
      } catch (error) {
        interaction.reply("Error: " + JSON.stringify(error));
      }

      const filter = (i) =>
        i.customId === "videoSelect" && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 30000,
      });

      collector.on("collect", async (i) => {
        const url = i.values[0];
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
          return interaction.followUp({
            embeds: [noticeEmbed("Invalid video URL!")],
          });
        }

        // Call Youtube Details API
        const videoId = url.split("v=")[1]; // Extract video ID from URL
        const response = await youtubeApi.detail(videoId);
        const videoDetails = response.items[0];

        // Play selected video in voice channel
        const stream = ytdl(url, {
          filter: "audioonly",
          quality: "highestaudio",
          highWaterMark: 1 << 27, // 128MB
          dlChunkSize: 0,
        });
        const resource = createAudioResource(stream, { metadata: { url } });
        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        // Event listeners for player
        player.on("error", (error) => {
          console.error(
            `Error: ${error.message} with resource ${resource.metadata.url}`
          );
        });

        const guildId = connection.joinConfig.guildId;
        const live = stayInChannelSettings[guildId];

        player.on("idle", () => {
          if (!live) {
            setTimeout(() => {
              connection.destroy();
            }, 5000); // Wait for 5 seconds before destroying the connection
          }
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);

        const embed = playingEmbed(
          videoDetails.snippet.title,
          videoDetails.snippet.channelTitle,
          videoDetails.snippet.thumbnails.default.url,
          videoDetails.contentDetails.duration,
          live
        );
        await interaction.editReply({
          embeds: [embed],
          content: "",
          components: [],
        });
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        embeds: [
          noticeEmbed("An error occurred while trying to search for videos."),
        ],
      });
    }
  },
};
