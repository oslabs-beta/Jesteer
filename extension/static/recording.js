// Handles logic for recording browser actions

// Toggles the text on the Record Button to reflect the given Recording Status rec
const recordButtonUpdate = (rec) => {
  btnSnapshot.disabled = !rec;
  btnRecord.innerText = rec ? 'Stop Recording' : 'Record';
}

// This sets the Record Button to have the correct message on startup
chrome.storage.local.get('recording', ({ recording }) => {
  recordButtonUpdate(recording);
});

// handle clicking the record button
btnRecord.addEventListener('click', async () => {
  //Get activeTab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Insert code for functions shared across popup
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['static/common.js']
  });

  // Get the current recording state
  let { recording } = await chrome.storage.local.get({ recording: false });
  // Toggle recording status (false -> true / true -> false)
  recording = !recording;

  // Update the recording button to match
  recordButtonUpdate(recording);

  // Set the new value in storage
  chrome.storage.local.set({ recording });

  // Tell Chrome to execute our script, which injects the needed EventListeners into current webpage
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleListeners,
    args: [recording]
  });

  // Dismiss the popup
  window.close();
});

// Enables and Disables the Event Listeners that monitor the webpage
function toggleListeners(rec) {


  // When an element in the current webpage is clicked, send a message back to the chrome extension
  // From there in can be added to the recorded actions
  const handleClick = e => {
    // TODO: Remove this line. This prevent for example hyperlinks from redirecting you elsewhere
    // as this may be a desired thing to test for
    e.preventDefault();
    chrome.runtime.sendMessage({ type: 'recordAction', action: { type: 'click', element: getSelectorPath(e.target) } });
  }

  const handleKeydown = e => {
    chrome.runtime.sendMessage({ type: 'keydown', key: e.key });
  }


  if (rec) {
    // When we begin recording, inject our event listener(s)
    document.___jesteer = {}; // Container object which holds functionality we injected
    document.addEventListener('click', document.___jesteer.handleClick = function fn(e) { handleClick(e) });
    document.addEventListener('keydown', document.___jesteer.handleKeydown = function fn(e) { handleKeydown(e) });
  } else {
    // When we stop recording, remove them
    document.removeEventListener('click', document.___jesteer.handleClick);
    chrome.runtime.sendMessage({ type: 'stopRecording', url: window.location.href });
  }
}