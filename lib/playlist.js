const fs = require('fs');
const readline = require('readline');

async function getPlayList() {
  const fileStream = fs.createReadStream('E://Work/node-scraping-test/data/playlist.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let playlist = [];
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    playlist.push(line);
  }

  return playlist;
}

module.exports = {
  getPlayList
}

