import * as templates from './templates.js';
import { toggleListeners } from '../static/toggleListeners.js';

// Initialize on Start

// current actions acts as a queue containing the actions performed on the page while recording,
// including clicks and snapshots.
let actions = [];
let keysPressed = '';

// initializes chrome storage on setup (?)
// Initialize our state to reflect that we are not yet recording on extension startup
chrome.runtime.onStartup.addListener(() => {
  // Set a value in the extension local storage
  console.log('onStartup event received.');
  chrome.storage.local.set({ recording: false });
});

// testing
chrome.webNavigation.onDOMContentLoaded.addListener(async (data) => {
  console.log('onDOMContentLoaded event received in background.js');
  console.log(data);
  // bug: if you type something in, press enter to navigate, and then end test, the text won't be picked up.
  chrome.storage.local.get('recording', async ({ recording }) => {
    if (recording) {

      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // below code was copied from recording.js
      // Insert code for functions shared across popup
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['static/common.js']
      });

      // turn off existing event listeners
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: toggleListeners,
        args: [false]
      });

      // Tell Chrome to execute our script, which injects the needed EventListeners into current webpage
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: toggleListeners,
        args: [true]
      });
    }
  })
})

// Listen for messages sent from elsewhere across the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

  console.log('actions queue:', actions);
  // handle messages based on their type
  switch (message.type) {

    // BUG: keydown will return the incorrect keycode for lowercase letter
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event
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
    case 'stopRecording': {
      // Compile the final file for output
      console.log('stopping recording...');

      // Action Example: {
      //   type: 'click',
      //   element: 'HTML > BODY:nth-child(2) > DIV:nth-child(1) > DIV:nth-child(1) > H1:nth-child(1)'
      // }

      let outputString = '';

      for (let action of actions) {
        switch (action.type) {
          case 'start':
            outputString += (
              templates.testSuiteStart
              + templates.describeStart
              + templates.itBlockStart
              + templates.gotoInitialPage(action.url)
            );
            break;

          case 'keyboard':
            outputString += templates.keyboard(action.text);
            break;

          case 'click':
            outputString += templates.click(action.element);

            // handle <a> tags and navigation
            // if (action.clickedLiveLink) outputString += templates.waitForNav;
            break;

          case 'navigation':
            outputString += templates.waitForNav;
            break;

          case 'snapshot':
            outputString += templates.snapshot();
            break;

          default:
            console.log('ERROR: Unknown action', action);
            sendResponse({ ok: false });
            return;
        }
      }

      outputString += templates.blockEndMultiple(2);

      console.log(outputString);

      actions = [];
      sendResponse({ ok: true, output: outputString });
    } break;

    // Log something to the Service Worker Console
    case 'log':
      console.log(message.text);
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
          if (chrome.runtime.lastError) console.log('ERROR', chrome.runtime.lastError);
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
// const stopRecording = async () => {
  // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // chrome.tabs.sendMessage(tab.id, { type: 'navigation' });

  // This logic will eventually need to be more sophisticated
  // TODO: Consider saving the existing recording for picking up where it was left off

//   chrome.storage.local.set({ recording: false });
//   // chrome.runtime.sendMessage({ type: 'navigation' });
// };
// chrome.tabs.onUpdated.addListener(stopRecording);
// chrome.tabs.onActivated.addListener(stopRecording);