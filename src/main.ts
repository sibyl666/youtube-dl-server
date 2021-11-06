import { exec } from "child_process";
import { getIdFromStdout } from "./utils";
import { readFile } from "fs";
import express, { query } from "express";
const app = express();

// const isYoutubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)(\/.+$)/;

app.get("/", (req, res) => {
  const queryUrl = req.query.url as string;
  if (!queryUrl) {
    res.status(504).send("url is not present!");
    return;
  }

  console.log(queryUrl);
  exec(`yt-dlp ${queryUrl} -P "${__dirname}/videos" -o "%(id)s.%(ext)s" \
    --write-thumbnail \
    --write-info-json
  `,
  async (err, stdout) => {
    console.log(stdout);

    if (err) {
      res.status(500).send(err);
      return;
    }

    const match  = getIdFromStdout(stdout);
    if (!match) {
      res.status(500).send("Can't get ID from the downloaded local file!");
      return;
    }

    readFile(`${__dirname}/videos/${match[1]}.info.json`, (err, data) => {
      if (err) {
        res.status(500).send("Can't read local json file!");
        return;
      }

      const content = JSON.parse(data.toString());
      res.send({
        fileUri: match[0],
        thumbnail: content.thumbnails[content.thumbnails.length - 1]
      })
    })
  })
})

app.listen(8000, () => console.log("listening on port 8000!"));
