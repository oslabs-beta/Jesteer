import * as boilerplate from './boilerplate.js';

// Initialize on Start

// current actions acts as a queue containing the actions performed on the page while recording,
// including clicks and snapshots.
let actions = [];
let keysPressed = '';

// initializes chrome storage on setup (?)
// Initialize our state to reflect that we are not yet recording on extension startup
chrome.runtime.onStartup.addListener(() => {
  // Set a value in the extension local storage
  chrome.storage.local.set({ recording: false });
})

// Listen for messages sent from elsewhere across the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

  // handle messages based on their type
  switch (message.type) {

    // handle a keypress (store in keysPressed variable)
    case 'keydown':
      keysPressed += message.key;
      sendResponse({ ok: true });
      break;

    // when the user interacts with the webpage, whatever they interact with is emitted as a 'recordAction' message
    case 'recordAction':

      // check if a message was just typed in
      if (keysPressed) {
        actions.push({ type: 'keyboard', text: keysPressed });
        keysPressed = '';
      }

      // bug-fix: when we take a snapshot, both a 'click' and a 'snapshot' action get registered.
      // We need to make sure only the snapshot action is registered, so we pop off the click.
      if (message.action.type === 'snapshot') actions.pop();

      // Push the action object from the message into the actions array
      actions.push(message.action);
      sendResponse({ ok: true });
      break;

    // user clicks the 'stop recording button'
    case 'stopRecording': { // TODO: Ideally most of this functionality would live inside a function which we would call here
      // Compile the final file for output

      // let str = `import puppeteer from 'puppeteer';\n`;
      let str = boilerplate.testSuiteIntro;
      str += boilerplate.describeStart;
      str += boilerplate.itBlockStart;

      str +=
        `
      const promises = [];
      promises.push(targetPage.waitForNavigation());
      await targetPage.goto('${message.url}');
      await Promise.all(promises);
      `;

      // Action Example: {
      //   type: 'click',
      //   element: 'HTML > BODY:nth-child(2) > DIV:nth-child(1) > DIV:nth-child(1) > H1:nth-child(1)'
      // }
      for (let action of actions) {
        switch (action.type) {
          case 'keyboard':
            str +=
              `
            await page.keyboard.type('${action.text}');
            `;
            break;

          case 'click':
            str +=
              `
              const element = await page.waitForSelector('${action.element}');
              await scrollIntoViewIfNeeded(element, timeout);
              await element.click();
              `;
            break;

          case 'snapshot':
            str +=
              `
              const snapped = await page.$eval('${action.element}', el => el.innerHTML);
              expect(snapped).toMatchSnapshot();
              `
            break;

          default:
            console.log('ERROR: Unknown action', action);
            sendResponse({ ok: false });
            return;
        }
      }

      str += boilerplate.blockEnd;
      str += boilerplate.blockEnd;

      console.log(str);

      actions = [];
      sendResponse({ ok: true });
    } break;

    // Log something to the Service Worker Console
    case 'log':
      console.log(message.message);
      sendResponse({ ok: true });
      break;

    // Download Snapshot
    case 'download':
      chrome.downloads.download({
        url: message.url,
        filename: 'snapshot.js'
      },
        downloadId => {
          chrome.downloads.show(downloadId);
          console.log('ERROR?', chrome.runtime.lastError);
        });

      sendResponse({ ok: true });
      break;

    // Received unknown message
    default:
      console.log('Received Unknown Message')
      sendResponse({ ok: false });
      break;
  }
});

// Abort recording on tab changed
const stopRecording = () => {
  // This logic will eventually need to be more sophisticated
  // TODO: Consider saving the existing recording for picking up where it was left off

  chrome.storage.local.set({ recording: false });
};
chrome.tabs.onUpdated.addListener(stopRecording);
chrome.tabs.onActivated.addListener(stopRecording);