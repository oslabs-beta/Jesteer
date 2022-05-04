/* 
  This test suite was created using JESTEER, a project developed by 
  Tim Ruszala, Katie Janzen, Clare Cerullo, and Charissa Ramirez.

  Learn more at https://github.com/oslabs-beta/Jesteer .
*/
const puppeteer = require('puppeteer'); // v13.0.0 or later

describe('', () => {

  let browser, page, timeout;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
    });
    jest.setTimeout(15000);
  });

  beforeEach(async () => {
    page = await browser.newPage();
    timeout = 5000;
    page.setDefaultTimeout(timeout);
  });

  afterEach(() => {
    page.close();
  });

  afterAll(() => {
    browser.close();
  });
  
it('', async () => {

{
const promises = [];
promises.push(page.waitForNavigation());
await page.goto('https://en.wikipedia.org/wiki/Rip_Van_Winkle');
await Promise.all(promises);
}

{
const element = await page.waitForSelector('#mw-content-text > DIV:nth-child(1) > DIV:nth-child(2) > A:nth-child(1)');
await element.click();
}

await page.waitForNavigation();

});

});