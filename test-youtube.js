const { getVideoMetadata } = require("./src/lib/youtube.js");

const testUrl = "https://youtu.be/-6Gz3OsrEcU?si=HcLXzuZCtjhokkOQ";

console.log("Testing YouTube URL:", testUrl);
console.log(
  "YOUTUBE_API_KEY:",
  process.env.YOUTUBE_API_KEY ? "Set" : "Not set"
);

getVideoMetadata(testUrl)
  .then((metadata) => {
    console.log("Success!");
    console.log("Video metadata:", metadata);
  })
  .catch((error) => {
    console.error("Error:", error.message);
    console.error("Full error:", error);
  });
