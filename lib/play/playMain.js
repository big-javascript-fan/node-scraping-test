const { workerData, parentPort, Worker } = require('worker_threads');
const { Key } = require('selenium-webdriver');
const { getTrackList, getAlbumList, getArtistList, sendLogs } = require('../apiService');
const proxyChain = require('proxy-chain');
require('chromedriver');
const { login, loginWithCookie } = require('../login');
const { generateRandomInt, generateRandomSeqArray, convertStringToTime } = require('../playController');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

let accountInfo = workerData.accountInfo;
let setting = workerData.setting[0];
let id = workerData.accountInfo.id;
let currentPage = null;
let stopScript = 0;         //if this is 4, then stop function on playing album
let newProxyUrl = '';
async function run() {
  
  let proxyString = accountInfo.proxy;
  let proxyCredential = proxyString.split(':');
  const oldProxyUrl = `http://${proxyCredential[2]}:${proxyCredential[3]}@${proxyCredential[0]}:${proxyCredential[1]}`;
  try {
    newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
  } catch(error) {
    newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
  }

  currentPage = await loginWithCookie(accountInfo, newProxyUrl);
  if(currentPage == null) {
    currentPage = await login(accountInfo, newProxyUrl);
  }

  sendLogs(id, "Account is logged in!", 0);
  let handles = await (await currentPage.driver).getAllWindowHandles();
  await (await currentPage.driver).switchTo().window(handles[0]);

  const albumList = await getAlbumList();
  const artistList = await getArtistList();
  const trackList = await getTrackList();

  let randomDuration = 0;
  while(true) {

    await sleep(2000);
    randomDuration = generateRandomInt(setting.min_rotation, setting.max_rotation);
    sendLogs(id, `Playing artist list is started for ${randomDuration} mins`, 0);
    setTimeout(() => {
      stopScript = 4;
    }, randomDuration * 60000);
    await Promise.race([playArtist(artistList, setting), sleep(randomDuration * 60000)]);
    
    await sleep(2000);
    randomDuration = generateRandomInt(setting.min_rotation, setting.max_rotation);
    sendLogs(id, `Playing album list is started for ${randomDuration} mins`, 0);
    setTimeout(() => {
      stopScript = 4;
    }, randomDuration * 60000);
    await Promise.race([playAlbum(albumList, setting), sleep(randomDuration * 60000)]);

    await sleep(2000);
    randomDuration = generateRandomInt(setting.min_rotation, setting.max_rotation);
    sendLogs(id, `Playing track list is started for ${randomDuration} mins`, 0);
    setTimeout(() => {
      stopScript = 4;
    }, randomDuration * 60000);
    await Promise.race([playTrack(trackList, setting), sleep(randomDuration * 60000)]);
    
  }
}

async function playAlbum(list, setting) {
  var index = 0;
  var randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
  var randomPause = generateRandomInt(setting.min_pause, setting.max_pause) * 1000;
  var chance = generateRandomSeqArray(list.length);
  var percentForSkip = Math.floor((100 - setting.percent_play) * list.length);
  for(var i=0; i<list.length; i++) {
    if(index == randomMusic) {
      index = 0;
      randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
      randomPause = generateRandomInt(setting.min_pause, setting.max_pause) * 1000;
      sendLogs(id, `Paused for ${randomPause/1000} seconds after ${randomMusic} songs`, 0);
      await sleep(randomPause);
    }

    try {
      // open music URL and click play button
      await currentPage.visit(list[i].link);
      try {
        await currentPage.driver.switchTo().alert().accept();
      } catch(error) {
      }
      await sleep(15000);
      await currentPage.findByClassName('web-navigation__auth-button--sign-out');
    } catch(error) {
      currentPage = await login(workerData.accountInfo, newProxyUrl, currentPage);
      // open music URL and click play button
      await currentPage.visit(list[i].link);
      await sleep(15000);
    }

    try {
      await reloginByIFrame();  
    } catch(e) {
    }

    var playTime = 0;

    try {
      let currentTimers = await currentPage.findByClassName('time-data');
      for(var j=0; j<currentTimers.length; j++) {
        playTime += convertStringToTime(await currentTimers[j].getText());
      }
      let playButton = await currentPage.findByClassName('play-button');
      await playButton[0].click();
    } catch(error) {
      console.log(error);
      sendLogs(id, `Error happened on playing ${list[i].link}`, 1);
      continue;
    }
    playTime *= 1000;

    sendLogs(id, `Started playing album on ${list[i].link} full time ${playTime/1000} seconds`, 0);

    var begin = new Date();
    var now = new Date();
    var diff = now - begin;
    while(diff < playTime) {
      now = new Date();
      diff = now - begin;
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

async function reloginByIFrame() {
    let iframe = await currentPage.findByTagName('iframe');
    await (await currentPage.driver).switchTo().frame(iframe[0]);
    let continueButton = await currentPage.findByClassName('form-button');
    await continueButton[0].click();

    await sleep(10000);

    let iframes = await currentPage.findByTagName('iframe');
    await (await currentPage.driver).switchTo().frame(iframes[0]);

    let name = await currentPage.findById('account_name_text_field');
    await name.sendKeys(accountInfo.email, Key.ENTER);
  
    await sleep(5000);
  
    let passwordField = await currentPage.findById('password_text_field');
    await passwordField.sendKeys(accountInfo.pwd, Key.ENTER);
  
    await sleep(10000);
  
    let continueBtn = await page.findByTagName('button');
    await continueBtn[0].click();

    await sleep(10000);
}

async function playArtist(list, setting) {
  var index = 0;
  var randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
  var randomPause = generateRandomInt(setting.min_pause, setting.max_pause) * 1000;
  for(var i=0; i<list.length; i++) {
    if(index == randomMusic) {
      index = 0;
      randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
      randomPause = generateRandomInt(setting.min_pause, setting.max_pause) * 1000;
      sendLogs(id, `Paused for ${randomPause / 1000} seconds after ${randomMusic} songs`, 0);
      await sleep(randomPause);
    }

    try {
      // open music URL and click play button
      await currentPage.visit(list[i].link);
      try {
        await currentPage.driver.switchTo().alert().accept();
      } catch(error) {
      }
      await sleep(15000);
      await currentPage.findByClassName('web-navigation__auth-button--sign-out');
    } catch(error) {
      currentPage = await login(workerData.accountInfo, newProxyUrl, currentPage);
      // open music URL and click play button
      await currentPage.visit(list[i].link);
      await sleep(15000);
    }
    
    try {
      await reloginByIFrame();  
    } catch(e) {
    }

    let playButton = [];
    let topSongs = [];
    try {
      topSongs = await currentPage.findByCSSSelector('.top-songs-list-swoosh .shelf-grid__list-item');
      playButton = await currentPage.findByCSSSelector('.play-button.is-list-item');
      await playButton[0].click();
      await sleep(3000);
    } catch(error) {
      sendLogs(id, `Error happened on playing ${list[i].link}`, 1);
      continue;
    }

    var playTime = topSongs.length * generateRandomInt(180, 300) * 1000;
    sendLogs(id, `Started playing artist on ${list[i].link} full time`, 0);

    var begin = new Date();
    var now = new Date();
    var diff = now - begin;
    while(diff < playTime) {
      now = new Date();
      diff = now - begin;
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
    if(index == randomMusic) {
      index = 0;
      randomMusic = generateRandomInt(setting.min_pause_frequency, setting.max_pause_frequency);
      randomPause = generateRandomInt(setting.min_pause, setting.max_pause);
      sendLogs(id, `Paused for ${randomPause} seconds after ${randomMusic} songs`, 0);
      await sleep(randomPause * 1000);
    }

    try {
      // open music URL and click play button
      await currentPage.visit(trackList[i].link);
      try {
        await currentPage.driver.switchTo().alert().accept();
      } catch(error) {
      }
      await sleep(15000);
      await currentPage.findByClassName('web-navigation__auth-button--sign-out');
    } catch(error) {
      currentPage = await login(workerData.accountInfo, newProxyUrl, currentPage);
      // open music URL and click play button
      await currentPage.visit(list[i].link);
      await sleep(5000);
    }
    
    try {
      await reloginByIFrame();  
    } catch(e) {
    }

    var playTime = 0;

    try {
      let currentTimers = await currentPage.findByClassName('time-data');

      if(chance[i] < percentForSkip) {
        playTime = generateRandomInt(setting.min_play, setting.max_play);
        sendLogs(id, `Started playing track on ${trackList[i].link} for ${playTime} seconds`, 0);
      } else {
        sendLogs(id, `Started playing track on ${trackList[i].link} full time`, 0);
        playTime = convertStringToTime(await currentTimers[0].getText());
      }

      let playButton = await currentPage.findByClassName('play-button');
      await playButton[0].click();
    } catch(error) {
      sendLogs(id, `Error happened on playing ${trackList[i].link}`, 1);
      continue;
    }
    playTime *= 1000;

    await sleep(3000);

    var begin = new Date();
    var now = new Date();
    var diff = now - begin;
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
  if(message == 'stop') {
    parentPort.postMessage('finish current playing');
    sendLogs(id, 'Account is logged out!', 0);
    await currentPage.quit();
  } else if(message == 'start') {
    run();
  }
});