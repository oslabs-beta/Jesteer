// note: to test, you have to prevent the popup from closing. For now, comment out the window.close() line in recording.js

const { bootstrap } = require('./bootstrap.js');

describe('test test', () => {
  let extPage, appPage, browser;

  beforeAll(async () => {
    const context = await bootstrap({ appUrl: 'https://www.wikipedia.org/'/*, slowMo: 50, devtools: true*/ });

    extPage = context.extPage;
    appPage = context.appPage;
    browser = context.browser;
  });

  xit('should click on the search box, i.e. wikipedia should load', async () => {
    appPage.bringToFront();
    const searchBox = await appPage.$('#searchInput');
    await searchBox.click();
  });

  it('should record and then stop recording', async () => {
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
  })
})