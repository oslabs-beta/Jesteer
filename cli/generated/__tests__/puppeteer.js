/* 
  This test suite was created using JESTEER, a project developed by 
  Tim Ruszala, Katie Janzen, Clare Cerullo, and Charissa Ramirez.

  Learn more at https://github.com/oslabs-beta/Jesteer .
*/
const puppeteer = require('puppeteer'); // v13.0.0 or later

describe('', () => {

  let browser, page, timeout;

  beforeAll(async () => {
    jest.setTimeout(15000);
    browser = await puppeteer.launch({
      headless: true,
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    timeout = 10000;
    page.setDefaultTimeout(timeout);
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('https://nodejs.dev/learn/working-with-folders-in-nodejs', async () => {
    {
      const targetPage = page;
      await targetPage.setViewport({ "width": 737, "height": 789 })
    }
    {
      const targetPage = page;
      const promises = [];
      promises.push(targetPage.waitForNavigation());
      await targetPage.goto('https://nodejs.dev/learn/working-with-folders-in-nodejs');
      await Promise.all(promises);
    }
    {
      const targetPage = page;
      const element = await waitForSelectors([["aria/Menu"], ["#gatsby-focus-wrapper > div > main > nav > button"]], targetPage, { timeout, visible: true });
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 32.1953125, y: 7.8046875 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors([["aria/Build an HTTP Server"], ["#link-build-an-http-server"]], targetPage, { timeout, visible: true });
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 64.40625, y: 13.5859375 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors([["aria/NEXT   →"], ["#gatsby-focus-wrapper > div > main > article > ul.pagination > li:nth-child(2) > a"]], targetPage, { timeout, visible: true });
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 22.1328125, y: 6.5546875 } });
    }

    await page.waitForSelector('h1.article-reader__headline');
    const snapped = await page.$eval('h1.article-reader__headline', el => el.innerHTML);
    expect(snapped).toMatchSnapshot();
  });

  test('https://www.wikipedia.org/', async () => {
    {
      const targetPage = page;
      await targetPage.setViewport({ "width": 737, "height": 789 })
    }
    {
      const targetPage = page;
      const promises = [];
      promises.push(targetPage.waitForNavigation());
      await targetPage.goto('https://www.wikipedia.org/');
      await Promise.all(promises);
    }
    {
      const targetPage = page;
      const element = await waitForSelectors([["aria/[role=\"group\"]", "aria/[role=\"searchbox\"]"], ["#searchInput"]], targetPage, { timeout, visible: true });
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 219.6015625, y: 13.40625 } });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors([["aria/[role=\"group\"]", "aria/[role=\"searchbox\"]"], ["#searchInput"]], targetPage, { timeout, visible: true });
      await scrollIntoViewIfNeeded(element, timeout);
      const type = await element.evaluate(el => el.type);
      if (["textarea", "select-one", "text", "url", "tel", "search", "password", "number", "email"].includes(type)) {
        await element.type('tim');
      } else {
        await element.focus();
        await element.evaluate((el, value) => {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, "dog");
      }
    }
    page.keyboard.press('Enter');
    // {
    //   const targetPage = page;
    //   const element = await waitForSelectors([["#www-wikipedia-org"]], targetPage, { timeout, visible: true });
    //   await scrollIntoViewIfNeeded(element, timeout);
    //   await element.click({ offset: { x: 652, y: 415 } });
    // }
    {
      const targetPage = page;
      const promises = [];
      promises.push(targetPage.waitForNavigation());
      const element = await waitForSelectors([["aria/Search", "aria/[role=\"generic\"]"], ["#search-form > fieldset > button > i"]], targetPage, { timeout, visible: true });
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 18.40625, y: 5.3046875 } });
      await Promise.all(promises);
    }
    await page.waitForSelector('#firstHeading');
    const snapped = await page.$eval('#firstHeading', el => el.innerHTML);
    expect(snapped).toMatchSnapshot();
  });

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
