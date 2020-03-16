const puppeteer = require('puppeteer');

let mainURL = 'https://www.disneyplus.com/login';   //first url to disneyplus

const main = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // await page.setViewport({ width: 1920, height: 926 });
  await page.goto(mainURL);
  await page.waitFor(8000);

  // disable css/font and images for fast rendering
  await page.setRequestInterception(true);

  page.on('request', (req) => {
    if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
        req.abort();
    }
    else {
        req.continue();
    }
  });

  await page.waitForSelector("#email");

  const emailInputField = await page.$('#email');
  emailInputField.click();
  await emailInputField.type("dtest-1984@gmail.com");

  const continueButton = await page.$('button[value="submit"]');
  
  continueButton.click();

  await page.waitFor(3000);
  await page.waitForSelector('#password');

  const passwordInputField = await page.$('#password');
  passwordInputField.click();
  await passwordInputField.type('Test!234');

  const loginButton = await page.$('button[value="submit"]');
  loginButton.click();

  await page.waitFor(4000);
  await page.waitForSelector('#home-collection');

  loginButton.asElement().
  // get movie details
  let movieData = await page.evaluate(() => {
      let movies = [];
      // get the movie elements
      let moviesElms = document.querySelectorAll('#home-collection > div');
      // get the movie data
      moviesElms.forEach((sectionElement) => {
          let sectionJson = {};
          try {
              sectionJson.name = sectionElement.querySelector('h4').innerText;
              sectionJson.items = {};
              let sliders = sectionElement.querySelectorAll('.slick-slide');
              sliders.forEach(slider => {

                console.log(slider);
                let item = {};
                item.name = slider.querySelector('.image-container').getAttribute('alt');
                item.image = slider.querySelector('img').getAttribute('src');
                // window.history.back();
              });
          }
          catch (exception){
            console.log('error happened on dom translation');
          }
          movies.push(sectionJson);
      });
      return movies;
  });

  console.log(movieData);
  // fs.writeFile("result.json", JSON.stringify(movieData), function(err) {
  //   if (err) throw err;
  //   console.log("Saved!");
  // });
  // console.dir(hotelData);
};

main();