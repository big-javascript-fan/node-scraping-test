const proxyChain = require('proxy-chain');
require('chromedriver');
const { expose } = require('threads/worker')
const { login, loginWithCookie } = require('./lib/login');
const { getPlayList } = require('./lib/playlist');
const { searchByTitle } = require('./lib/search');
const { play } = require('./lib/playController');

expose(async function(accountInfo) {
  const oldProxyUrl = 'http://lum-customer-hl_637ef71b-zone-static_res:ujf5m5wq32va@zproxy.lum-superproxy.io:22225';
  const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
  
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
  
  currentPage.quit();
})