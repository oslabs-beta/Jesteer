/* 
  This test suite was created using JESTEER, a project developed by 
  Tim Ruszala, Katie Janzen, Clare Cerullo, and Charissa Ramirez.

  Learn more at https://github.com/oslabs-beta/Jesteer .
*/
const puppeteer = require('puppeteer'); // v13.0.0 or later

jest.setTimeout(10000);
describe('', () => {

  let browser, page, timeout;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 60,
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    timeout = 5000;
    page.setDefaultTimeout(timeout);
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('', async () => {

    {
      const promises = [];
      promises.push(page.waitForNavigation());
      await page.goto('http://localhost:3000/');
      await Promise.all(promises);
    }

    {
      const element = await page.waitForSelector('#new-location');
      await element.click();
    }

    await page.keyboard.type('Boise');

    {
      const element = await page.waitForSelector('#add-market');
      await element.click();
    }

    {
      const snapped = await page.$eval('#app > DIV:nth-child(1) > DIV:nth-child(1) > DIV:nth-child(3) > DIV:nth-child(2) > DIV:nth-child(2) > DIV:nth-child(1)', el => el.innerHTML);
      expect(snapped).toMatchSnapshot();
    }

  });

});
