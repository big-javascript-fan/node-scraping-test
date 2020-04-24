const axios = require('axios');
const BASE_URL = 'http://localhost:3000';

async function getAccountList() {
  // var bot_id = process.env.BOT_NO;
  const bot_id = 1;
  const req_url = BASE_URL + `/api/customers?bot_id=${bot_id}`;
  var response = await axios.get(req_url);
  return response.data;
}

async function getAlbumList() {
  
  // let playlist = [
  //   `https://music.apple.com/us/album/the-saga-of-wiz-khalifa/1508399988`,
  //   `https://music.apple.com/us/album/a-muse-in-her-feelings/1503186015`,
  //   `https://music.apple.com/us/album/sxtp4/1507640966`
  // ]
  var response = await axios.get(BASE_URL + '/api/album');
  return response.data;
  // return playlist;
}

async function getTrackList() {
  var response = await axios.get(BASE_URL + '/api/track');
  return response.data;
}

async function getArtistList() {
  var response = await axios.get(BASE_URL + '/api/artist');
  return response.data;
}

async function getSetting() {
  var response = await axios.get(BASE_URL + '/api/setting');
  return response.data;
}

async function sendLogs(id, logs, type) {
  await axios.post(BASE_URL + '/api/logs', {
    id,
    logs,
    type
  });
  return true;
}

module.exports = {
  getAccountList,
  getAlbumList,
  getTrackList,
  getArtistList,
  getSetting,
  sendLogs
}

