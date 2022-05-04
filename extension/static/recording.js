// Handles logic for recording browser actions
import { toggleListeners } from './toggleListeners.js';

// Toggles the text on the Record Button to reflect the given Recording Status rec
const recordButtonUpdate = (rec) => {
  btnSnapshot.disabled = !rec;
  btnRecordValue.innerText = rec ? 'Stop Recording' : 'Record';
}

// This sets the Record Button to have the correct message on startup
chrome.storage.local.get('recording', ({ recording }) => {
  recordButtonUpdate(recording);
});

// handle clicking the record button
btnRecord.addEventListener('click', async () => {
  console.log('can you read this? (recording.js)');
  //Get activeTab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Insert code for functions shared across popup
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['static/common.js']
  });

  // Get the current recording state
  let { recording } = await chrome.storage.local.get({ recording: false });
  // Toggle recording status (false -> true / true -> false)
  recording = !recording;

  // Update the recording button to match
  recordButtonUpdate(recording);

  // Set the new value in storage
  await chrome.storage.local.set({ recording });

  console.log('value of recording', recording);
  if (!recording) {
    await chrome.runtime.sendMessage({ type: 'log', text: 'attempt to stop recording from recording.js' });
    await chrome.runtime.sendMessage({ type: 'stopRecording', url: tab.url });
  }

  // Tell Chrome to execute our script, which injects the needed EventListeners into current webpage
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleListeners,
    args: [recording]
  });

  // Dismiss the popup
  window.close();
});