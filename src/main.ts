import { exec } from "child_process";
import { getIdFromStdout } from "./utils";
import { readFile, createReadStream } from "fs";
import { join } from "path";
import express from "express";
const app = express();

import { spawn } from "child_process";


const videoRegex = /(.*)\.mp4/;

// app.get("/videos/:fileUri", (req, res) => {
//   let fileUri = req.params.fileUri;
  
//   const readableStream = createReadStream(join(__dirname, `/videos/${fileUri}`));
//   readableStream.on("open", () => {
//     readableStream.pipe(res);
//   })
// })


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
  child.stdout.on("data", chunk => {
    let chunkString = chunk.toString() as string;

    const match = videoRegex.exec(chunkString);
    if (!match) return;

    readFile(`${__dirname}/videos/${match[1]}.info.json`, (err, data) => {
      if (err) {
        res.status(500).send("Can't read info json");
        return;
      }

      const content = JSON.parse(data.toString());
      res.send({
        fileUri: match[0],
        thumbnail: content.thumbnails[content.thumbnails.length - 1]
      })
    })
  })
  child.stderr.on("error", err => {
    console.log("eror", err)
  })

  child.on("close", code => console.log("code", code));
})

app.listen(8000, () => console.log("listening on port 8000!"));
