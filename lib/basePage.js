const {Builder, By, until, logging} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
// o.addArguments('start-fullscreen');
// o.addArguments('disable-infobars');
// o.addArguments('headless'); // running test on visual chrome browser
// o.addArguments("--disable-popup-blocking");

var Page = function() {
    this.driver = null;
    this.create = function(option) {
        var prefs = new logging.Preferences();
        prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
        option.setLoggingPrefs(prefs);
        var temp = new chrome.Options();
        var profile = {'default_content_setting_values': {
                            'images': 2, 
                            'geolocation': 2, 
                            'notifications': 2, 'auto_select_certificate': 2, 'fullscreen': 2, 
                            'mouselock': 2, 'mixed_script': 2}}
        option.setUserPreferences({ credential_enable_service: false, profile });
        option.addArguments('--disable-gpu');
        option.addArguments('--disable-web-security');
        option.addArguments('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3803.0 Safari/537.36');
        // THIS IS THE KEY BIT!
        option.addArguments('--lang=en-US,en;q=0.9');
        this.driver = new Builder()
            .setChromeOptions(option)
            .forBrowser("chrome")
            .build();
    }

    // visit a webpage
    this.visit = async function(theUrl) {
        return await this.driver.get(theUrl);
    };

    // quit current session
    this.quit = async function() {
        return await this.driver.quit();
    };

    // wait and find a specific element with it's id
    this.findById = async function(id) {
        await this.driver.wait(until.elementLocated(By.id(id)), 15000, 'Looking for element');
        return await this.driver.findElement(By.id(id));
    };

    // wait and find a specific element with its' classname
    this.findByClassName = async function(className) {
      await this.driver.wait(until.elementLocated(By.className(className)), 15000, 'Looking for element');
      return await this.driver.findElements(By.className(className));
    }

    this.findByCSSSelector = async function(selector) {
        await  this.driver.wait(until.elementLocated(By.css(selector)), 15000, 'looking for element');
        return await this.driver.findElement(By.css(selector));
    }

    // wait and find a specific element with it's name
    this.findByName = async function(name) {
        await this.driver.wait(until.elementLocated(By.name(name)), 15000, 'Looking for element');
        return await this.driver.findElement(By.name(name));
    };

    // wait and find a specific element with it's name
    this.findByTagName = async function(tagName) {
        await this.driver.wait(until.elementLocated(By.tagName(tagName)), 15000, "Looking for element");
        return await this.driver.findElements(By.tagName(tagName));
    }

    // fill input web elements
    this.write = async function (el, txt) {
        return await el.sendKeys(txt);
    };
};

module.exports = Page;