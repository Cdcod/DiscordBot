function convertDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (match == null) return "Video is live";

  match.shift(); // removes the first element from the match array

  const hours = parseInt(match[0]) || 0;
  const minutes = parseInt(match[1]) || 0;
  const seconds = parseInt(match[2]) || 0;

  return `${hours ? hours + " h " : ""}${minutes ? minutes + " m " : ""}${
    seconds ? seconds + " s" : ""
  }`;
}

module.exports = convertDuration;
