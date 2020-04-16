const { sleep } = require('../lib/playController');

class PlayController {
  constructor() {
    this.currentPage = null;
    this.setting = null;
    this.trackList = null;
    this.albumList = null;
    this.artistList = null;
  }

  setPage(page) {
    this.currentPage = page;
  }

  setSetting(setting) {
    this.setting = setting;
  }

  setPlayList(trackList, albumList, artistList) {
    this.trackList = trackList;
    this.albumList = albumList;
    this.artistList = artistList;
  }

  async gotoPlay() {
    console.log('currently play in PlayController');
    await sleep(10000);
    return;
  }

  async gotoSleep() {
    console.log('currently stopped playing in Playcontroller');
    await sleep(4000);
    return;
  }
}

module.exports = {
  PlayController
}