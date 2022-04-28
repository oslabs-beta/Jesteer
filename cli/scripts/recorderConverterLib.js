const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const dest = path.resolve(__dirname, '../generated/__tests__/newFile.js');

/**
 * Writes the start of the newly generated test suite to a destination file.
 * 
 * @param {string} dest The absolute path to the file which will contain the test suite.
 * 
 */
function startFile(dest) {
  fs.writeFileSync(dest,
    `/* 
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
  `);
}

/**
 * 
 * Adds to the test suite file a new test, based on a Chrome Recorder-generated Puppeteer script.
 * 
 * @param {string} dest The absolute path to the file which will contain the test suite.
 * @param {string} script The absolute path to the Chrome Recorder-generated Puppeteer script you wish to convert into a test.
 * @param {string} [selectorsFile] The absolute path to a .txt file containing a new-line separated list of css selectors, corresponding to elements we take a snapshot of.
 */
function addTest(dest, script, selectorsFile) {

  // get an array of css selectors from the selectorsTxt.txt file
  // this should eventually be made asynchronous to improve performance
  let selectors;
  if (selectorsFile) {
    selectors = fs.readFileSync(selectorsFile).toString().split('\n');
  }

  // Import the google puppeteer script
  // fs.readFileSync returns a buffer. E.G. <Buffer 33 2e 30 2e 30 ... 6371 more bytes>
  const buffer = fs.readFileSync(script);
  //use the toString() method to convert buffer into string
  const fileContent = buffer.toString();

  // get initial url, to use as temporary test name
  const url = fileContent.match(/await targetPage\.goto\('(.*)'\);/)[1]; //[1] gets the first group of regex

  // get start and end indices of actual puppeteer script
  const firstIndexOfScript = fileContent.search(/}\s*{/g);
  const lastIndexOfScript = fileContent.indexOf(`await browser.close();`);

  // write beginning of it block
  fs.appendFileSync(dest, `
    test('${url}', async () => {`);

  // write puppeteer instructions
  fs.appendFileSync(dest, fileContent.substring(firstIndexOfScript + 1, lastIndexOfScript - 3));

  // write expect statements
  if (selectorsFile) {
    for (const selector of selectors) {
      fs.appendFileSync(dest, `
      await page.waitForSelector('${selector}');
      const snapped = await page.$eval('${selector}', el => el.innerHTML);
      expect(snapped).toMatchSnapshot();
      `);
    }
  }

  // close out it block
  fs.appendFileSync(dest, `});
  `)
}

/**
 * Writes the end of the newly generated test suite to a destination file. Includes helper functions
 * 
 * @param {string} dest The absolute path to the test suite file
 * 
 */
function closeFile(dest) {
  fs.appendFileSync(dest, `
  });

    async function waitForSelectors(selectors, frame, options) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame, options);
        } catch (err) {
          console.error(err);
        }
      }
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }

    async function scrollIntoViewIfNeeded(element, timeout) {
      await waitForConnected(element, timeout);
      const isInViewport = await element.isIntersectingViewport({ threshold: 0 });
      if (isInViewport) {
        return;
      }
      await element.evaluate(element => {
        element.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'auto',
        });
      });
      await waitForInViewport(element, timeout);
    }

    async function waitForConnected(element, timeout) {
      await waitForFunction(async () => {
        return await element.getProperty('isConnected');
      }, timeout);
    }

    async function waitForInViewport(element, timeout) {
      await waitForFunction(async () => {
        return await element.isIntersectingViewport({ threshold: 0 });
      }, timeout);
    }

    async function waitForSelector(selector, frame, options) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to waitForSelector');
      }
      let element = null;
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (element) {
          element = await element.waitForSelector(part, options);
        } else {
          element = await frame.waitForSelector(part, options);
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('>>'));
        }
        if (i < selector.length - 1) {
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('|'));
      }
      return element;
    }

    async function waitForElement(step, frame, timeout) {
      const count = step.count || 1;
      const operator = step.operator || '>=';
      const comp = {
        '==': (a, b) => a === b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
      };
      const compFn = comp[operator];
      await waitForFunction(async () => {
        const elements = await querySelectorsAll(step.selectors, frame);
        return compFn(elements.length, count);
      }, timeout);
    }

    async function querySelectorsAll(selectors, frame) {
      for (const selector of selectors) {
        const result = await querySelectorAll(selector, frame);
        if (result.length) {
          return result;
        }
      }
      return [];
    }

    async function querySelectorAll(selector, frame) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to querySelectorAll');
      }
      let elements = [];
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (i === 0) {
          elements = await frame.$$(part);
        } else {
          const tmpElements = elements;
          elements = [];
          for (const el of tmpElements) {
            elements.push(...(await el.$$(part)));
          }
        }
        if (elements.length === 0) {
          return [];
        }
        if (i < selector.length - 1) {
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
        }
      }
      return elements;
    }

    async function waitForFunction(fn, timeout) {
      let isActive = true;
      setTimeout(() => {
        isActive = false;
      }, timeout);
      while (isActive) {
        const result = await fn();
        if (result) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }
  `)
}

// /**
//  * 
//  * @param {string} dest The absolute path to the file which will contain the test suite.
//  * @param {string[]} scripts An array of absolute filepaths to Chrome Recorder-generated Puppeteer scripts, to be converted into Jest tests.
//  */
// function writeSuite(dest, scripts) {
//   startFile(dest);
//   for (let script of scripts) {
//     addTest(dest, script);
//   }
//   closeFile(dest);
// }

/**
 * 
 * @param {string} dest The absolute path to the file which will contain the test suite.
 * @param {string[]} scripts An array of absolute filepaths to Chrome Recorder-generated Puppeteer scripts, to be converted into Jest tests.
 * @param {string[]} selectors An array of absolute filepaths to .txt files containing css selectors of the elements we want to take a snapshot of.
 */
function writeSuite(dest, scripts, selectors) {
  // start with a clean snapshots folder
  const snapshots = path.resolve(dest, '../__snapshots__');
  // console.log('snapshots:', snapshots);
  if (fs.existsSync(snapshots)) {
    fsp.rm(snapshots, { recursive: true })
      .then(() => console.log('pre-existing snapshots folder removed.'));
  }

  startFile(dest);
  for (let i = 0; i < scripts.length; i++) {
    addTest(dest, scripts[i], selectors[i]);
  }
  closeFile(dest);
}

module.exports = {
  writeSuite
}