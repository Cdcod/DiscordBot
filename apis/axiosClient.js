const { youtubeBaseUrl } = require("../config.json");
const axios = require("axios");
let queryString;

(async function () {
  queryString = (await import("query-string")).default;
})();

const axiosClient = axios.create({
  baseURL: youtubeBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => queryString.stringify(params),
});

axiosClient.interceptors.request.use(async (config) => {
  return config;
});

axiosClient.interceptors.response.use((response) => {
  try {
    if (response && response.data) {
      return response.data;
    }
    return response;
  } catch (error) {
    console.error(error);
  }
});

module.exports = axiosClient;
