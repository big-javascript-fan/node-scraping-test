const puppeteer = require('puppeteer');
(async () => {
  const browserOpts = {
      headless: true,
      args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3803.0 Safari/537.36',
          // THIS IS THE KEY BIT!
          '--lang=en-US,en;q=0.9',
      ],
  };

  const browser = await puppeteer.launch(browserOpts);
  const page = await browser.newPage();
  await page.goto('https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html');
  await page.screenshot({path: 'headless-test-result.png'});

})();