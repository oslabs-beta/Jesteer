// file adapted from: https://tweak-extension.com/blog/complete-guide-test-chrome-extension-puppeteer/
const puppeteer = require('puppeteer');

// launches browser to test our chrome extension, and gives us access to variables
// which reference the browser, the app page, the extension page, and the extension url
async function bootstrap(options = {}) {
  const { devtools = false, slowMo = false, appUrl } = options;
  const browser = await puppeteer.launch({
    headless: false,
    devtools,
    args: [
      '--disable-extensions-except=./extension',
      '--load-extension=./extension',
    ],
    ...(slowMo && { slowMo }),
  });

  const appPage = await browser.newPage();
  // const pages = await browser.pages();
  // const appPage = pages[0];
  await appPage.goto(appUrl, { waitUntil: 'networkidle2' });

  const targets = await browser.targets();
  const extensionTarget = targets.find(target => target.type() === 'service_worker');
  const partialExtensionUrl = extensionTarget._targetInfo.url || '';
  const [, , extensionId] = partialExtensionUrl.split('/');

  const extPage = await browser.newPage();
  const extensionUrl = `chrome-extension://${extensionId}/static/popup.html`;
  await extPage.goto(extensionUrl, { waitUntil: 'load' });

  return {
    appPage,
    browser,
    extensionUrl,
    extPage,
  };
}

module.exports = { bootstrap };