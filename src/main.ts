import { exec } from "child_process";
import { getIdFromStdout } from "./utils";
import { readFile, createReadStream } from "fs";
import { join } from "path";
import express from "express";
const app = express();

import { spawn } from "child_process";


const videoRegex = /(\w*)\.mp4/;

app.get("/videos/:fileUri", (req, res) => {
  let fileUri = req.params.fileUri;
  
  const readableStream = createReadStream(join(__dirname, `/videos/${fileUri}`));
  readableStream.on("open", () => {
    readableStream.pipe(res);
  })
})


app.get("/", (req, res) => {
  const queryUrl = req.query.url as string;
  if (!queryUrl) {
    res.status(504).send("url is not present!");
    return;
  }

  const child = spawn(`yt-dlp`, [
    `${queryUrl}`,
    "--no-simulate",
    "--write-thumbnail",
    "--no-part",
    `-P ${__dirname}/videos`,
    "--output=%(id)s.%(ext)s",
    "--print=%(id)s.%(ext)s"
  ]);
  child.stdout.on("data", chunk => {
    let chunkString = chunk.toString() as string;
    console.log(chunkString)
    let match = videoRegex.exec(chunkString);
    if (!match) return;

    res.send({
      fileUri: match[0]
    })
  })
  child.stderr.on("error", err => {
    console.log("eror", err)
  })

  child.on("close", code => console.log("code", code))
  
  // exec(`yt-dlp "${queryUrl}" -P "${__dirname}/videos" -o "%(id)s.%(ext)s" -r 10K --write-thumbnail --write-info-json --xattr-set-filesize`,
  // async (err, stdout) => {
  //   console.log(stdout);
  // });

  // exec(`yt-dlp "${queryUrl}" -P "${__dirname}/videos" -o "%(id)s.%(ext)s" \
  //   --write-thumbnail \
  //   --write-info-json
  // `,
  // async (err, stdout) => {
  //   if (err) {
  //     res.status(500).send(err);
  //     return;
  //   }

  //   const match  = getIdFromStdout(stdout);
  //   if (!match) {
  //     res.status(500).send("Can't get ID from the downloaded local file!");
  //     return;
  //   }

  //   // match[0] FILE FULL NAME WITH EXTENSION
    

  //   readFile(`${__dirname}/videos/${match[1]}.info.json`, (err, data) => {
  //     if (err) {
  //       res.status(500).send("Can't read local json file!");
  //       return;
  //     }

  //     const content = JSON.parse(data.toString());
  //     res.send({
  //       fileUri: match[0],
  //       thumbnail: content.thumbnails[content.thumbnails.length - 1]
  //     })
  //   })
  // })
})

app.listen(8000, () => console.log("listening on port 8000!"));
