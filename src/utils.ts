const alreadyDownloadedRegex = /(\w*)\.mp4/;

export function getIdFromStdout(content: string) {
  return alreadyDownloadedRegex.exec(content);
}

export function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  })
}
