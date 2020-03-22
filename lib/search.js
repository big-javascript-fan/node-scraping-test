var { Key } = require('selenium-webdriver')

async function clear(page, selector) {
  await page.driver.executeScript(
    `document.querySelector("${selector}").value = "";`
  );
}

module.exports = {
  searchByTitle: async(page, title) => {
    console.log('search');
    let searchField = await page.findByClassName('dt-search-box__input');

    await clear(page, '.dt-search-box__input');

    await searchField[0].sendKeys(title, Key.ENTER);
    return page;
  }
}