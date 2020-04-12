const { workerData, parentPort, Worker } = require('worker_threads');
const { getTrackList, getAlbumList, getArtistList } = require('../apiService');
const proxyChain = require('proxy-chain');
require('chromedriver');
const { login, loginWithCookie } = require('../login');
const { generateRandomInt, generateRandomSeqArray, convertStringToTime } = require('../playController');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

let currentPage = null;
let stopScript = 0;         //if this is 4, then stop function on playing album
async function run() {
  let accountInfo = workerData.accountInfo;
  let setting = workerData.setting[0];
  
  let proxyString = accountInfo.proxy;
  let proxyCredential = proxyString.split(':');
  const oldProxyUrl = `http://${proxyCredential[2]}:${proxyCredential[3]}@${proxyCredential[0]}:${proxyCredential[1]}`;
  const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

  currentPage = await loginWithCookie(accountInfo, newProxyUrl);
  if(currentPage == null) {
    currentPage = await login(accountInfo, newProxyUrl);
    await loginWithCookie(accountInfo, newProxyUrl);
  }

  let handles = await (await currentPage.driver).getAllWindowHandles();
  await (await currentPage.driver).switchTo().window(handles[0]);

  const albumList = await getAlbumList();
  const artistList = await getArtistList();
  const trackList = await getTrackList();

  let randomDuration = 0;
  while(true) {

    await sleep(2000);
    randomDuration = generateRandomInt(setting.min_rotation, setting.max_rotation);
    setTimeout(() => {
      stopScript = 4;
    }, randomDuration * 60000);
    await Promise.race([playAlbum(albumList, setting), sleep(randomDuration * 60000)]);

    await sleep(2000);
    randomDuration = generateRandomInt(setting.min_rotation, setting.max_rotation);
    setTimeout(() => {
      stopScript = 4;
    }, randomDuration * 60000);
    await Promise.race([playAlbum(artistList, setting), sleep(randomDuration * 60000)]);
    
    await sleep(2000);
    randomDuration = generateRandomInt(setting.min_rotation, setting.max_rotation);
    setTimeout(() => {
      stopScript = 4;
    }, randomDuration * 60000);
    await Promise.race([playTrack(trackList, setting), sleep(randomDuration * 60000)]);
    
  }
}

async function playAlbum(list, setting) {
  var index = 0;
  var randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
  var randomPause = generateRandomInt(setting.min_pause, setting.max_pause);
  var chance = generateRandomSeqArray(list.length);
  var percentForSkip = Math.floor((100 - setting.percent_play) * list.length);
  for(var i=0; i<list.length; i++) {
    var begin = new Date();
    if(index == randomMusic) {
      index = 0;
      randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
      randomPause = generateRandomInt(setting.min_pause, setting.max_pause) * 1000;
      await sleep(randomPause * 1000);
    }
    // open music URL and click play button
    await currentPage.visit(list[i].link);
    let currentTimers = await currentPage.findByClassName('table__row__duration-counter');
    
    var playTime = 0;
    for(var j=0; j<currentTimers.length; j++) {
      playTime += convertStringToTime(await currentTimers[j].getText());
    }
    playTime *= 1000;

    let playButton = await currentPage.findByClassName('we-media-preview');
    await playButton[0].click();

    var now = new Date();
    var diff = now - begin;
    if(chance[i] < percentForSkip) {
      playTime = generateRandomInt(setting.min_play, setting.max_play) * 1000;
    }
    while(diff < playTime) {
      now = new Date();
      diff = now - begin;
      console.log(diff);
      if(stopScript == 4) {
        stopScript = 1;
        return;
      } else {
        await sleep(1000);
      }
    }
    index ++;
  }
}

async function playTrack(trackList, setting) {
  var index = 0;
  var randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
  var randomPause = generateRandomInt(setting.min_pause, setting.max_pause);
  var chance = generateRandomSeqArray(trackList.length);
  var percentForSkip = Math.floor(setting.percent_play / 100 * trackList.length);
  for(var i=0; i<trackList.length; i++) {
    var begin = new Date();
    if(index == randomMusic) {
      index = 0;
      randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
      randomPause = generateRandomInt(setting.min_pause, setting.max_pause) * 1000;
      await sleep(randomPause * 1000);
    }
    // open music URL and click play button
    await currentPage.visit(trackList[i].link);
    
    let playButton = await currentPage.findByClassName('we-media-preview');
    await playButton[0].click();

    var now = new Date();
    var diff = now - begin;
    var playTime = 500000000;
    if(chance[i] < percentForSkip) {
      playTime = generateRandomInt(setting.min_play, setting.max_play) * 1000;
    } else {
      playTime = 0;
      let currentTimers = await currentPage.findByClassName('table__row__duration-counter');
      playTime = convertStringToTime(await currentTimers[0] * 1000);
    }

    while(diff < playTime) {
      now = new Date();
      diff = now - begin;
      if(stopScript == 4) {
        stopScript = 1;
        return;
      } else{
        await sleep(1000);
      }
    }
    index ++;
  }
}

parentPort.on("message", async message => {
  console.log('message from parent process-', message);
  if(message == 'stop') {
    parentPort.postMessage('finish current playing');
    await currentPage.quit();
  } else if(message == 'start') {
    run();
  }
});