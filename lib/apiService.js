const axios = require('axios');
const BASE_URL = 'http://localhost:3000';

async function getAccountList() {
  // var bot_id = process.env.BOT_NO;
  const bot_id = 1;
  const req_url = BASE_URL + `/api/customers?bot_id=${bot_id}`;
  console.log(req_url);
  var response = await axios.get(req_url);
  return response.data;
}

async function getAlbumList() {
  var response = await axios.get(BASE_URL + '/api/album');
  return response.data;
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

module.exports = {
  getAccountList,
  getAlbumList,
  getTrackList,
  getArtistList,
  getSetting
}

