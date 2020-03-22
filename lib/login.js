const { By, Key } = require('selenium-webdriver');
const readline = require('readline');
var fs = require('fs');
var Page = require('./basePage');
const chrome = require('selenium-webdriver/chrome');
async function login(accountInfo, proxy) {
  let options = new chrome.Options();
  options.addArguments(`--proxy-server=${proxy}`);
  var page = new Page();
  page.create(options, proxy);

  page.visit('https://beta.music.apple.com');

  await (await page.driver).sleep(8000);

  console.log('login');


  let loginBtn = await page.findByClassName('web-navigation__auth-button--sign-in');
  await loginBtn[2].click();

  await page.driver.sleep(3000);
  let handles = await (await page.driver).getAllWindowHandles();
  let newHandle = handles[(await handles).length - 1];
  await page.driver.switchTo().window(newHandle);

  console.log('switch to handle');
  await page.driver.sleep(10000);

  let iframe = await page.findByTagName('iframe');
  await (await page.driver).switchTo().frame(iframe[0]);

  console.log('attached to iframe');

  let emailField = await page.findByClassName('form-textbox-text');
  emailField[0].sendKeys(accountInfo.email, Key.ENTER);

  console.log('enter email');
  await (await page.driver).sleep(2000);

  let passwordField = await page.findById('password_text_field');
  passwordField.sendKeys(accountInfo.password, Key.ENTER);

  console.log('enter password');
  await (await page.driver).sleep(5000);

  let continueBtn = await page.findByTagName('button');
  continueBtn[0].click();

  console.log('click continue');
  let cookies = await (await page.driver).manage().getCookies();
  
  var file = fs.createWriteStream(`./cookies/${accountInfo.email}`);
  file.on('error', function(error) { console.log(error)});
  cookies.forEach(function(v) { file.write(JSON.stringify(v) + '\n'); });
  file.end();

  await page.quit();
  return page;
}

async function loginWithCookie(accountInfo, proxy) {
  const path = `./cookies/${accountInfo.email}`;
  try {
    if(fs.existsSync(path)) {
      const fileStream = fs.createReadStream(path);

      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.
    
      let cookies = [];
      for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        cookies.push(line);
      }
      let options = new chrome.Options();
      // options.addArguments('headless');
      options.addArguments(`--proxy-server=${proxy}`);
      var page = new Page();
      page.create(options, proxy);

      page.visit('https://beta.music.apple.com');

      await (await page.driver).sleep(10000);
      cookies.forEach(async element => {
        await (await page.driver).manage().addCookie(JSON.parse(element));
      });

      await (await page.driver).sleep(10000);

      page.visit('https://beta.music.apple.com');

      await (await page.driver).sleep(10000);

      await page.findByClassName('web-navigation__auth-button--sign-out');
      return page;
    }
  } catch(error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  login,
  loginWithCookie
};