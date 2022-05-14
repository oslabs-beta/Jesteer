import * as templates from './templates.js';
import { toggleListeners } from '../static/toggleListeners.js';

// options that help us decide which tab to act on, depending on whether we're testing or not
const QUERY_TAB_OPTS = { currentWindow: true, active: true };
const E2E_QUERY_TAB_OPTS = { currentWindow: true, active: false };

const testingStatus = (navigator.userAgent === 'PuppeteerAgent');
console.log('TESTING:', testingStatus);

// console.log("navigator.userAgent", navigator.userAgent);

// current actions acts as a queue containing the actions performed on the page while recording,
// including clicks and snapshots.
let actions = [];
let keysPressed = '';

function flushKeyBuffer() {
  console.log('flushKeyBuffer called, buffer was:', keysPressed);
  if (keysPressed) {
    actions.push({ type: 'keyboard', text: keysPressed });
    keysPressed = '';
  }
}

function handleRecordAction(action) {
  console.log(
    'handleRecordAction called, action was:',
    JSON.stringify(action),
  );
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
  console.log(
    'processActionsQueue called, actions queue was:',
    JSON.stringify(actions),
  );
  let outputString = '';

  for (const action of actions) {
    switch (action.type) {
      case 'start':
        outputString +=
          templates.testSuiteStart +
          templates.describeStart +
          templates.itBlockStart +
          templates.gotoInitialPage(action.url);
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
        console.log('ERROR: Unknown action', action);
        sendResponse({ ok: false });
        return;
    }
  }

  outputString += templates.blockEndMultiple(2);

  console.log('outputString:', outputString);

  actions = [];

  return outputString;
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
          files: ['static/common.js'],
        });

        // turn off existing event listeners
        chrome.scripting.executeScript({
          target: { tabId },
          function: toggleListeners,
          args: [false],
        });

        // Tell Chrome to execute our script, which injects the needed EventListeners into current webpage
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
chrome.runtime.onMessage.addListener(function (
  message,
  sender,
  sendResponse
) {
  // handle messages based on their type
  switch (message.type) {
    // handle a keypress
    case 'keydown':
      console.log('Keydown event: ' + message.key);

      if (message.key.length > 1) {
        handleRecordAction({ type: 'keyboardPress', key: message.key });
      } else {
        if (message.key === '\\') keysPressed += '\\\\';
        else keysPressed += message.key;
      }
      sendResponse({ ok: true });
      break;

    // when the user interacts with the webpage, whatever they interact with is emitted as a 'recordAction' message
    case 'recordAction':
      handleRecordAction(message.action);
      sendResponse({ ok: true });
      break;

    // user clicks the 'stop recording button'
    case 'stopRecording':
      {
        // Compile the final file for output
        console.log('stopping recording...');
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
