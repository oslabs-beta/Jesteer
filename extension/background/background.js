/* eslint no-console: off */

import * as templates from './templates.js';
import { toggleListeners } from '../content_scripts/toggleListeners.js';

// current actions acts as a queue containing the actions performed on the page while recording,
// including clicks and snapshots.
let actions = [];
let keysPressed = '';

function flushKeyBuffer() {
  if (keysPressed) {
    actions.push({ type: 'keyboard', text: keysPressed });
    keysPressed = '';
  }
}

function handleRecordAction(action) {
  // adds a type action to the actions queue, with whatever had last been typed
  flushKeyBuffer();

  // bug-fix: when we take a snapshot, both a 'click' and a 'snapshot' action get registered.
  // We need to make sure only the snapshot action is registered, so we pop off the click.
  if (action.type === 'snapshot') actions.pop();

  // Push the action object from the message into the actions array
  actions.push(action);
}

// When we stop recording, we go through all actions in the actions queue and use them to
// build out the test suite.
function processActionsQueue() {
  let outputString = templates.testSuiteStart
    + templates.describeStart
    + templates.itBlockStart;

  if (actions[0].type !== 'initialURL') {
    // Handle the occasional edge case where a recording fails to start correctly
    // Construct an initialURL action object and put it at the front of the actions queue
    // This will write a comment asking the tester to replace it with the Initial Page URL
    // This is a better way to fail than not generating a test at all
    actions.unshift({
      type: 'initialURL',
      url: '/* This URL failed to generate as a part of the recording process. Please replace this comment with the Initial Page URL. */',
    });
  }

  for (const action of actions) {
    switch (action.type) {
      case 'initialURL':
        outputString += templates.gotoInitialPage(action.url);
        break;

      case 'keyboard':
        outputString += templates.keyboard(action.text);
        break;

      case 'keyboardPress':
        outputString += templates.keyboardPress(action.key);
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
        break;
    }
  }

  outputString += templates.blockEndMultiple(2);

  actions = [];

  return outputString;
}

// initializes chrome storage on setup
// Initialize our state to reflect that we are not yet recording on extension startup
chrome.runtime.onStartup.addListener(() => {
  // Set a value in the extension local storage
  chrome.storage.local.set({ recording: false, currentTest: '' });
});

// Check for page navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo /* , tab */) => {
  // read changeInfo data to see if url changed
  if (changeInfo.url) {
    chrome.storage.local.get('recording', async ({ recording }) => {
      if (recording) {
        const navigationAction = { type: 'navigation' };
        handleRecordAction(navigationAction);

        // Insert code for functions shared across popup
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['content_scripts/common.js'],
        });

        // turn off existing event listeners
        chrome.scripting.executeScript({
          target: { tabId },
          function: toggleListeners,
          args: [false],
        });

        // turn event listeners back on (fresh start)
        chrome.scripting.executeScript({
          target: { tabId },
          function: toggleListeners,
          args: [true],
        });
      }
    });
  }
});

// Listen for messages sent from elsewhere across the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // handle messages based on their type
  switch (message.type) {
    // handle a keypress
    case 'keydown':
      if (message.key.length > 1) {
        handleRecordAction({ type: 'keyboardPress', key: message.key });
      }
      else if (message.key === '\\') {
        keysPressed += '\\\\';
      }
      else {
        keysPressed += message.key;
      }
      sendResponse({ ok: true });
      break;

    // when the user interacts with the webpage, whatever they interact with
    // is emitted as a 'recordAction' message
    case 'recordAction':
      handleRecordAction(message.action);
      sendResponse({ ok: true });
      break;

    // user clicks the 'stop recording button'
    case 'stopRecording':
      {
        // Compile the final file for output
        flushKeyBuffer();
        const outputString = processActionsQueue();
        sendResponse({ ok: true, output: outputString });
      }
      break;

    // Log something to the Service Worker Console
    case 'log':
      console.log(message.text);
      sendResponse({ ok: true });
      break;

    // Received unknown message
    default:
      console.log('Received Unknown Message');
      sendResponse({ ok: false });
      break;
  }
});
