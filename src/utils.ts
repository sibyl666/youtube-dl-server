const alreadyDownloadedRegex = /\\videos\\([^\s]*)/;

export function getIdFromStdout(content: string) {
  return alreadyDownloadedRegex.exec(content);
}
