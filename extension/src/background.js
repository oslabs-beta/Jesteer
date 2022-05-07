import * as templates from './templates.js';
import { toggleListeners } from '../static/toggleListeners.js';

// Initialize on Start

// current actions acts as a queue containing the actions performed on the page while recording,
// including clicks and snapshots.
let actions = [];
let keysPressed = '';

function handleRecordAction(action) {
  // check if a message was just typed in
  if (keysPressed) {
    actions.push({ type: 'keyboard', text: keysPressed });
    keysPressed = '';
  }

  // bug-fix: when we take a snapshot, both a 'click' and a 'snapshot' action get registered.
  // We need to make sure only the snapshot action is registered, so we pop off the click.
  if (action.type === 'snapshot') actions.pop();

  // Push the action object from the message into the actions array
  actions.push(action);
}

// initializes chrome storage on setup
// Initialize our state to reflect that we are not yet recording on extension startup
chrome.runtime.onStartup.addListener(() => {
  // Set a value in the extension local storage
  console.log('onStartup event received.');
  chrome.storage.local.set({ recording: false });
});

// Check for page navigation
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // read changeInfo data to see if url changed
  if (changeInfo.url) {
    // do something here
    console.log('Navigated to a new page. tabId:', tabId);
    chrome.storage.local.get('recording', async ({ recording }) => {
      if (recording) {
        const navigationAction = { type: 'navigation' };
        handleRecordAction(navigationAction);

        // below code was copied from recording.js
        // Insert code for functions shared across popup
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['static/common.js']
        });

        // turn off existing event listeners
        chrome.scripting.executeScript({
          target: { tabId },
          function: toggleListeners,
          args: [false]
        });

        // Tell Chrome to execute our script, which injects the needed EventListeners into current webpage
        chrome.scripting.executeScript({
          target: { tabId },
          function: toggleListeners,
          args: [true]
        });
      }
    });
  }
});

// Listen for messages sent from elsewhere across the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

  console.log('actions queue:', actions);
  // handle messages based on their type
  switch (message.type) {

    // BUG: keydown will return the incorrect keycode for lowercase letter
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event
    // handle a keypress (store in keysPressed variable)
    case 'keydown':

      switch (message.key) {
        case ('Enter'):
        case ('Shift'):
        case ('Meta'):
          break;

        default:
          keysPressed += message.key;
          break;
      }
      sendResponse({ ok: true });
      break;

    // when the user interacts with the webpage, whatever they interact with is emitted as a 'recordAction' message
    case 'recordAction':

      handleRecordAction(message.action);
      // // check if a message was just typed in
      // if (keysPressed) {
      //   actions.push({ type: 'keyboard', text: keysPressed });
      //   keysPressed = '';
      // }

      // // bug-fix: when we take a snapshot, both a 'click' and a 'snapshot' action get registered.
      // // We need to make sure only the snapshot action is registered, so we pop off the click.
      // if (message.action.type === 'snapshot') actions.pop();

      // // Push the action object from the message into the actions array
      // actions.push(message.action);
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
            break;

          case 'navigation':
            outputString += templates.waitForNav;
            break;

          case 'snapshot':
            outputString += templates.snapshot(action.element);
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