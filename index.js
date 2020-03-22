const proxyChain = require('proxy-chain');

const chrome = require('selenium-webdriver/chrome');
require('chromedriver');
const selenium = require('selenium-webdriver');
var Page = require('./lib/basePage');
const { login, loginWithCookie } = require('./lib/login');
const { getPlayList } = require('./lib/playlist');
const { searchByTitle } = require('./lib/search');
const { play } = require('./lib/playController');

(async() => {
    const oldProxyUrl = 'http://lum-customer-hl_637ef71b-zone-static_res:ujf5m5wq32va@zproxy.lum-superproxy.io:22225';
    const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

    console.log(newProxyUrl);
    // Do your magic here...
    let accountInfo = {
      email: "piaoriguo@outlook.com",
      password: "Android1234!"
    }

    let currentPage = await loginWithCookie(accountInfo, newProxyUrl);
    if(currentPage == null) {
      await login(accountInfo, newProxyUrl);
      currentPage = await loginWithCookie(accountInfo, newProxyUrl);
    }
    let playlist = await getPlayList();
    let handles = await (await currentPage.driver).getAllWindowHandles();
    await (await currentPage.driver).switchTo().window(handles[0]);

    for(var i=0; i<playlist.length; i++) {
      currentPage = await searchByTitle(currentPage, playlist[i]);
      currentPage = await play(currentPage);
    }
    await browser.close();
})();