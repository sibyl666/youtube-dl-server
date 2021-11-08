import { spawn } from "child_process";
import { sleep } from "./utils";
import { readFile } from "fs";
import express from "express";
const app = express();


const videoRegex = /(.*)\.mp4/;
app.get("/", (req, res) => {
  const queryUrl = req.query.url as string;
  if (!queryUrl) {
    res.status(504).send("url is not present!");
    return;
  }

  const child = spawn(`yt-dlp`, [
    `${queryUrl}`,
    "--no-simulate",
    "--no-part",
    "--write-thumbnail",
    "--write-info-json",
    `-P ${__dirname}/videos`,
    "--output=%(id)s.%(ext)s",
    "--print=%(id)s.%(ext)s"
  ]);
  child.stdout.on("data", async (chunk) => {
    let chunkString = chunk.toString() as string;

    const match = videoRegex.exec(chunkString);
    if (!match) return;

    await sleep(500);
    readFile(`${__dirname}/videos/${match[1]}.info.json`, (err, data) => {
      if (err) {
        res.status(500).send("Can't read info json");
        console.log(err);
        return;
      }

      const content = JSON.parse(data.toString());
      res.send({
        fileUri: match[0],
        thumbnail: content.thumbnails[content.thumbnails.length - 1]
      });
    })
  })
  child.stderr.on("error", err => {
    console.log("eror", err)
  })

  child.on("close", code => console.log("code", code));
})


app.listen(8000, () => console.log("listening on port 8000!"));
