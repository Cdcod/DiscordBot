const axiosClient = require("../apis/axiosClient");
const { youtubeApiKey } = require("../config.json");

const youtubeApi = {
  search(name) {
    const url = `/search?part=snippet&q=${encodeURIComponent(
      name
    )}&type=video&videoCategoryId=10&key=${youtubeApiKey}`;
    return axiosClient.get(url);
  },

  detail(videoId) {
    const url = `/videos?id=${videoId}&part=snippet,contentDetails&key=${youtubeApiKey}`;
    return axiosClient.get(url);
  },
};

module.exports = youtubeApi;
