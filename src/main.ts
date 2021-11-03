import { exec } from "child_process";
import { getIdFromStdout } from "./utils";
import express from "express";
const app = express();

const isYoutubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)(\/.+$)/;

app.get("/", (req, res) => {
  const queryUrl = req.query.url as string;
  if (!queryUrl) {
    res.status(504).send("url is not present!");
    return;
  }

  let match = isYoutubeRegex.exec(queryUrl);
  if (!match || match == null) {
    res.status(400).send("There is a problem with the url or the url is not from youtube!");
    return;
  }

  exec(`yt-dlp ${queryUrl} -P './src/videos' -o '%(id)s.%(ext)s'`, (err, stdout, stderr) => {
    let fileMatch = getIdFromStdout(stdout);
    if (!fileMatch) {
      res.status(500).send("Can't get id from the downloaded local file!");
      return;
    }

    res.send({
      fileUri: fileMatch[1]
    });
  })
})

app.listen(8000, () => console.log("listening on port 8000!"));
