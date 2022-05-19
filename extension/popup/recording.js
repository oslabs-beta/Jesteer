// Handles logic for recording browser actions
import { toggleListeners } from '../content_scripts/toggleListeners.js';

// Toggles the text on the Record Button to reflect the given Recording Status rec
const recordButtonUpdate = (rec) => {
  document.querySelector('#btnSnapshot').disabled = !rec;
  document.querySelector('#btnRecordValue').innerText = rec ? 'Stop Recording' : 'Record';
};

// main function to be executed when record button is pressed
async function execute(tab) {
  // Toggle recording status and save in local storage
  let { recording } = await chrome.storage.local.get({ recording: false });
  recording = !recording;
  await chrome.storage.local.set({ recording });
  // Update the recording button
  recordButtonUpdate(recording);

  // click 'Record'
  if (recording) {
    // send 'initialURL' action to background.js, telling Jesteer to insert
    // a page.goto(${ initialURL }) command
    await chrome.runtime.sendMessage({ type: 'log', text: `initialURL: ${tab.url}` });
    await chrome.runtime.sendMessage({ type: 'recordAction', action: { type: 'initialURL', url: tab.url } });

    // if not testing, dismiss the popup
    if (navigator.userAgent !== 'PuppeteerAgent') {
      window.close();
    }
  }

  // click 'Stop recording'
  else {
    // send stopRecording message to background.js
    await chrome.runtime.sendMessage({ type: 'log', text: 'attempt to stop recording from recording.js' });

    // sending the stopRecording message will trigger a generated test suite as a response
    const { output } = await chrome.runtime.sendMessage({ type: 'stopRecording' });

    // populate codegen box with the generated test suite
    document.querySelector('#codegen').value = output;

    // save the generated test suite in Chrome's local memory
    await chrome.storage.local.set({ currentTest: output });
  }

  // Insert code for functions shared across popup
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content_scripts/common.js'],
  });

  // Tell Chrome to inject event listeners into current page, which will record browser interactions
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleListeners,
    args: [recording],
  });
}

// Populate record button with correct message, depending on recording status
chrome.storage.local.get('recording', ({ recording }) => {
  recordButtonUpdate(recording);
});

// add event listener for clicking record Button
// acts slightly differently depending on whether or not we are testing
document.querySelector('#btnRecord').addEventListener('click', async () => {
  // options that help us decide which tab to act on, depending on whether we're testing or not
  const QUERY_TAB_OPTS = { currentWindow: true, active: true };
  const E2E_QUERY_TAB_OPTS = { currentWindow: true, active: false };

  chrome.tabs.getCurrent(async (tab) => {
    const isRunningExtensionOnBrowserTab = !!tab;
    // when testing, the extension popup runs in a separate browser tab
    const opts = isRunningExtensionOnBrowserTab ? E2E_QUERY_TAB_OPTS : QUERY_TAB_OPTS;
    const tabIndex = isRunningExtensionOnBrowserTab ? 1 : 0;

    chrome.tabs.query(opts, (tabs) => execute(tabs[tabIndex]));
  });
});
