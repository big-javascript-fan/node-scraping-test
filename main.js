const { expose } = require('threads');
const { Worker } = require('worker_threads');
const { getSetting } = require('./lib/apiService');

expose(async (accountInfo) => {
  const setting = await getSetting();
  let playHours = Math.round(Math.random() * (setting[0].max_stream - setting[0].min_stream) + setting[0].min_stream);
  let sleepHours = 24 - playHours;

  const playWorker = new Worker('./lib/play/playMain.js', { workerData: { setting, accountInfo } });
  startPlaying(playWorker, playHours * 3600000, sleepHours * 3600000);
});

function startPlaying(worker, playHours, sleepHours) {
  worker.postMessage('start');
  var begin = new Date();
  let timing = setInterval(() => {
    let now = new Date();
    let playTime = now - begin;
    if(playTime > playHours) {
      clearInterval(timing);
      stopPlaying(worker, playHours, sleepHours);
    }
  }, 1000);
}

function stopPlaying(worker, playHours, sleepHours) {
  worker.postMessage('stop');
  var begin = new Date();
  let timing = setInterval(() => {
    let now = new Date();
    let sleepTime = now - begin;
    if(sleepTime > sleepHours) {
      clearInterval(timing);
      startPlaying(worker, playHours, sleepHours);
    }
  }, 1000);
}