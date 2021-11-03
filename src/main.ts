import { exec } from "child_process";
import express from "express";
const app = express();

const idRegex = /(?<id>(\?v=(\w*))|(\w*$))/;
const destRegex = /Destination: .\/videos\/(?<dest>.*)/

app.get("/", (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(504).send("url is not present!");
    return;
  }

  var id;
  var match = idRegex.exec(url);
  if ((id = match?.groups?.id) == null) {
    res.status(504).send("problem with the url");
    return
  }
  console.log("id", id);

  exec(`yt-dlp https://www.youtube.com/watch?v=${id} -P ./videos -o '%(id)s.%(ext)s'`,
    (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }

      let match = destRegex.exec(stdout);
      let path = match?.groups?.dest;
      res.send({
        fileUri: path
      })
    }
  )
})

app.listen(8000, () => console.log("listening on port 8000!"));
