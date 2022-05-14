// Handles logic for recording browser actions
import { toggleListeners } from './toggleListeners.js';

// options that help us decide which tab to act on, depending on whether we're testing or not
const QUERY_TAB_OPTS = { currentWindow: true, active: true };
const E2E_QUERY_TAB_OPTS = { currentWindow: true, active: false };

// Toggles the text on the Record Button to reflect the given Recording Status rec
const recordButtonUpdate = (rec) => {
  document.querySelector('#btnSnapshot').disabled = !rec;
  document.querySelector('#btnRecordValue').innerText = rec ? 'Stop Recording' : 'Record';
};

// This sets the Record Button to have the correct message on startup
chrome.storage.local.get('recording', ({ recording }) => {
  recordButtonUpdate(recording);
});

// handle clicking the record button
document.querySelector('#btnRecord').addEventListener('click', async () => {
  chrome.tabs.getCurrent((tab) => {
    const isRunningExtensionOnBrowserTab = !!tab;
    const opts = isRunningExtensionOnBrowserTab ? E2E_QUERY_TAB_OPTS : QUERY_TAB_OPTS;
    const tabIndex = isRunningExtensionOnBrowserTab ? 1 : 0;

    chrome.tabs.query(opts, (tabs) => execute(tabs[tabIndex]));
  });
});

async function execute(tab) {
  console.log('execute called');
  // Insert code for functions shared across popup
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['static/common.js'],
  });

  // Get the current recording state
  let { recording } = await chrome.storage.local.get({ recording: false });
  // Toggle recording status (false -> true / true -> false)
  recording = !recording;

  // Update the recording button to match
  recordButtonUpdate(recording);

  // Set the new value in storage
  await chrome.storage.local.set({ recording });
  if (recording) {
    await chrome.runtime.sendMessage({ type: 'log', text: `URL: ${tab.url}` });
    await chrome.runtime.sendMessage({ type: 'recordAction', action: { type: 'start', url: tab.url } });

    // Dismiss the popup
    // window.close();
  } else {
    await chrome.runtime.sendMessage({ type: 'log', text: 'attempt to stop recording from recording.js' });
    const { output } = await chrome.runtime.sendMessage({ type: 'stopRecording' });

    document.querySelector('#codegen').value = output;

    await chrome.storage.local.set({ currentTest: output });
  }

  // Tell Chrome to execute our script, which injects the needed EventListeners into current webpage
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleListeners,
    args: [recording],
  });
}
