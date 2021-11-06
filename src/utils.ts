const alreadyDownloadedRegex = /(\w*)\.mp4/;

export function getIdFromStdout(content: string) {
  return alreadyDownloadedRegex.exec(content);
}
