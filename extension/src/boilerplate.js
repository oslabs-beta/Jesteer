export const testSuiteIntro =
    `/* 
  This test suite was created using JESTEER, a project developed by 
  Tim Ruszala, Katie Janzen, Clare Cerullo, and Charissa Ramirez.

  Learn more at https://github.com/oslabs-beta/Jesteer .
*/
const puppeteer = require('puppeteer'); // v13.0.0 or later
`

export const describeStart = 
`
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
  `;

export const itBlockStart = 
`
it('', () => {
`

export const blockEnd =
  `
});
`
