export const testSuiteStart =
`/* 
  This test suite was created using JESTEER, a project developed by 
  Tim Ruszala, Katie Janzen, Clare Cerullo, and Charissa Ramirez.

  Learn more at https://github.com/oslabs-beta/Jesteer .
*/
const puppeteer = require('puppeteer'); // v13.0.0 or later
`;

export const describeStart = 
`
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
  `;

export const itBlockStart = 
`
it('', async () => {
`;

export const blockEnd =
  `
});
`;

export const waitForNav =
`
await page.waitForNavigation();
`;

export const pressEnter = 
`
await page.keyboard.press('Enter');
`;

export const blockEndMultiple = count => blockEnd.repeat(count);

export const gotoInitialPage = initialPageURL => (`
{
const promises = [];
promises.push(page.waitForNavigation());
await page.goto('${initialPageURL}');
await Promise.all(promises);
}
`); 

export const keyboard = text => (`
await page.keyboard.type('${text}');
`);

export const click = selector => (`
{
const element = await page.waitForSelector('${selector}');
await element.click();
}
`);

export const snapshot = selector => (`
{
const snapped = await page.$eval('${selector}', el => el.innerHTML);
expect(snapped).toMatchSnapshot();
}
`);