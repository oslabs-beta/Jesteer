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
      headless: true,
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
      await page.goto('https://stackoverflow.com/questions/1772179/get-character-value-from-keycode-in-javascript-then-trim');
      await Promise.all(promises);
    }

    {
      const element = await page.waitForSelector('#answer-23377822 > DIV:nth-child(1) > DIV:nth-child(2) > DIV:nth-child(1) > PRE:nth-child(5)');
      await element.click();
    }

    {
      const element = await page.waitForSelector('#answer-23377822 > DIV:nth-child(1) > DIV:nth-child(2) > DIV:nth-child(1) > BLOCKQUOTE:nth-child(6) > P:nth-child(1) > EM:nth-child(2)');
      await element.click();
    }

    {
      const element = await page.waitForSelector('#answer-23377822 > DIV:nth-child(1) > DIV:nth-child(2) > DIV:nth-child(1) > H1:nth-child(12)');
      await element.click();
    }

    {
      const element = await page.waitForSelector('#search > DIV:nth-child(1) > INPUT:nth-child(1)');
      await element.click();
    }

    await page.waitForNavigation();

    await page.waitForNavigation();

    await page.waitForNavigation();

    await page.waitForNavigation();

    await page.waitForNavigation();

  });

});
