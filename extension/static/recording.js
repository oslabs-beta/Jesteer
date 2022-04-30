// Handles logic for recording browser actions

// Toggles the text on the Record Button to reflect the given Recording Status rec
const recordButtonUpdate = (rec) => btnRecord.innerText = rec ? 'Stop Recording' : 'Record';


// This sets the Record Button to have the correct message on startup
chrome.storage.local.get('recording', ({recording}) => {
  recordButtonUpdate(recording);
});

btnRecord.addEventListener('click', async () => {
  //Get activeTab
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  // Get the current recording state
  let {recording} = await chrome.storage.local.get({recording: false});
  // Toggle recording status (false -> true / true -> false)
  recording = !recording;

  // Update the recording button to match
  recordButtonUpdate(recording);

  // Set the new value in storage
  chrome.storage.local.set({recording});
  
  // Tell Chrome to execute our script, which injects the needed EventListeners into current webpage
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: toggleListeners,
    args: [recording]
  });

  // Dismiss the popup
  window.close();
});

// Enables and Disables the Event Listeners that monitor the webpage
function toggleListeners(rec) {

  //Helper Function to return a Selector Path to the given element
  function getSelectorPath(element) {
    // TODO: This function is copied verbatim from elsewhere.
    // This is not DRY.
    // Maybe a static method on a Class?

    const names = [];

    while (element.parentNode) {
      if (element.id) {
        names.unshift('#' + element.id);
        break;
      } 
      else {
        if (element === element.ownerDocument.documentElement) names.unshift(element.tagName);
        else {
          let e = element;
          let i = 1;
          while (e.previousElementSibling) {
            e = e.previousElementSibling;
            i++;
          }
          names.unshift(`${ element.tagName }:nth-child(${ i })`);
        }
      }
      element = element.parentNode;
    }
    return names.join(' > ');
  }

  // When an element in the current webpage is clicked, send a message back to the chrome extension
  // From there in can be added to the recorded actions
  const handleClick = e => {
    // TODO: Remove this line. This prevent for example hyperlinks from redirecting you elsewhere
    // as this may be a desired thing to test for
    e.preventDefault();

    chrome.runtime.sendMessage({type: 'recordAction', object: {type: 'click', element: getSelectorPath(e.target)}});
  }

  
  if (rec) {
    // When we begin recording, inject our event listener(s)
    document.___jesteer = {}; // Container object which holds functionality we injected
    document.addEventListener('click', document.___jesteer.handleClick = function fn(e) {handleClick(e)});
  } else {
    // When we stop recording, remove them
    document.removeEventListener('click', document.___jesteer.handleClick);
    chrome.runtime.sendMessage({type: 'stopRecording', url: window.location.href});
  }
}