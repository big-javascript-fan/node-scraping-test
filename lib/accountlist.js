const fs = require('fs');
const readline = require('readline');

async function getAccountList() {
  const fileStream = fs.createReadStream('./data/accountlist.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let accountlist = [];
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    let infos = line.split(',');
    accountlist.push({ email: infos[0], password: infos[1] });
  }

  console.log(accountlist);

  return accountlist;
}

module.exports = {
  getAccountList
}

