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
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    timeout = 5000;
    page.setDefaultTimeout(timeout);
  });

  // afterEach(async () => {
  //   await page.close();
  // });

  // afterAll(async () => {
  //   await browser.close();
  // });

  it('', async () => {

    {
      const promises = [];
      promises.push(page.waitForNavigation());
      await page.goto('https://www.google.com/?gws_rd=ssl');
      await Promise.all(promises);
    }

    {
      const element = await page.waitForSelector('HTML > BODY:nth-child(2) > DIV:nth-child(2) > DIV:nth-child(3) > FORM:nth-child(3) > DIV:nth-child(1) > DIV:nth-child(1) > DIV:nth-child(3) > DIV:nth-child(1) > DIV:nth-child(2) > INPUT:nth-child(3)');
      await element.click();
    }

    await page.keyboard.type('\\t\\r\\n\\s\\\\\\b\\\\\\\\sdfsdf\\');

    {
      const element = await page.waitForSelector('HTML > BODY:nth-child(2) > DIV:nth-child(2) > DIV:nth-child(2)');
      await element.click();
    }

  });

});
