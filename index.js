const puppeteer = require('puppeteer');

let mainURL = 'https://www.disneyplus.com/login';   //first url to disneyplus

const main = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 926 });
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
  emailInputField.value = "dtest-1984@gmail.com";

  const continueButton = await page.$('button[type="submit"]');
  continueButton.click();

  await page.waitForSelector('#password');

  const passwordInputField = await page.$('#password');
  passwordInputField.value = 'Test!234';

  const loginButton = await page.$('button[type="submit"]');
  loginButton.click();

  await page.waitForSelector('#home-collection');

  let movieSections = await page.$('#home-collection > div');
  console.log(movieSections.length);

  // // get movie details
  // let movieData = await page.evaluate(() => {
  //     let movies = [];
  //     // get the movie elements
  //     let moviesElms = document.querySelectorAll('div.sr_property_block[data-movieid]');
  //     // get the movie data
  //     moviesElms.forEach((sectionElement) => {
  //         let sectionJson = {};
  //         try {
  //             sectionJson.name = sectionElement.querySelector('span.sr-section__name').innerText;
  //             sectionJson.reviews = sectionElement.querySelector('span.review-score-widget__subtext').innerText;
  //             sectionJson.rating = sectionElement.querySelector('span.review-score-badge').innerText;
  //             if(sectionElement.querySelector('strong.price')){
  //                 sectionJson.price = sectionElement.querySelector('strong.price').innerText;
  //             }
  //         }
  //         catch (exception){

  //         }
  //         movies.push(sectionJson);
  //     });
  //     return movies;
  // });

  // fs.writeFile("result.json", JSON.stringify(movieData), function(err) {
  //   if (err) throw err;
  //   console.log("Saved!");
  // });
  // console.dir(hotelData);
};

main();