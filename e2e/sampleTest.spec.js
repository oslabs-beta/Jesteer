// note: to test, you have to prevent the popup from closing. For now, comment out the window.close() line in recording.js
const { bootstrap } = require('./bootstrap.js');
const pti = require('puppeteer-to-istanbul');


describe('test test', () => {
  let extPage, appPage, browser;

  beforeAll(async () => {
    const context = await bootstrap({ appUrl: 'https://www.wikipedia.org/'/*, slowMo: 50, devtools: true*/ });

    extPage = context.extPage;
    appPage = context.appPage;
    browser = context.browser;

    await Promise.all([
      extPage.coverage.startJSCoverage(),
      extPage.coverage.startCSSCoverage(),
    ]);
  });

  afterAll(async () => {
    // measure code coverage with istanbul
    const [jsCoverage, cssCoverage] = await Promise.all([
      extPage.coverage.stopJSCoverage(),
      extPage.coverage.stopCSSCoverage(),
    ]);
    let totalBytes = 0;
    let usedBytes = 0;
    const coverage = [...jsCoverage, ...cssCoverage];
    for (const entry of coverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) usedBytes += range.end - range.start - 1;
    }
    console.log(`Bytes used: ${(usedBytes / totalBytes) * 100}%`);
    pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true, storagePath: './.nyc_output' });
  })

  xit('should click on the search box, i.e. wikipedia should load', async () => {
    appPage.bringToFront();
    const searchBox = await appPage.$('#searchInput');
    await searchBox.click();
  });

  xit('should record and then stop recording', async () => {
    extPage.bringToFront();
    const btnRecord = await extPage.$('#btnRecord');
    await extPage.waitForFunction(`document.querySelector('#btnRecord').innerText === 'Record'`);
    let btnRecordText = await btnRecord.evaluate(e => e.innerText);
    expect(btnRecordText).toBe('Record');

    await btnRecord.click();
    expect(await extPage.waitForFunction(`document.querySelector('#btnRecord').innerText === 'Stop Recording'`)).toBeTruthy();

    // why isn't this working!
    // await btnRecord.click();
    // expect(await extPage.waitForFunction(`document.querySelector('#btnRecord').innerText === 'Recording'`)).toBeTruthy();
  });

  it('should record a very simple browser interaction', async () => {
    await extPage.bringToFront();
    await extPage.waitForSelector('#btnRecord');
    let btnRecord = await extPage.$('#btnRecord');
    await btnRecord.click();

    await appPage.bringToFront();
    await appPage.waitForSelector('#searchInput');
    const searchBox = await appPage.$('#searchInput');
    await searchBox.click();

    await extPage.bringToFront();
    await extPage.waitForSelector('#btnRecord');
    btnRecord = await extPage.$('#btnRecord');
    await btnRecord.click();
    await extPage.waitForSelector('#codegen');
    const output = await extPage.$eval('#codegen', e => e.value);
    const expectedOutput =
      `/* 
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
      await page.goto('https://www.wikipedia.org/');
      await Promise.all(promises);
    }

    {
      const element = await page.waitForSelector('#searchInput');
      await element.click();
    }

  });

});`;
    expect(output).toBe(expectedOutput);
  })
})

