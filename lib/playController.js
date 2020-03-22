const { logging } = require('selenium-webdriver');

async function play(page) {
  let playButton = await page.findByClassName('play-button');
  await playButton[0].click();

  await page.driver.sleep(10000);

  while (true)
  {
    let playControl = await page.findByClassName("web-chrome-playback-lcd__scrub");
    let currentStep = await playControl[0].getAttribute("aria-valuenow");
    let maxStep = await playControl[0].getAttribute("aria-valuemax");
    if (1 * currentStep == 1 * maxStep - 1)
    {
      break;
    }
    else
    {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);   //wait 1s for playing
    }
  }

  return page;
}

module.exports = {
  play
}