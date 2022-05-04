// Enables and Disables the Event Listeners that monitor the webpage
export function toggleListeners(rec) {
  console.log(`toggleListeners.js with value ${rec}`);

  // When an element in the current webpage is clicked, send a message back to the chrome extension
  // From there in can be added to the recorded actions
  const handleClick = e => {
    const recordActionMessage = {
      type: 'recordAction',
      action: {
        type: 'click',
        element: getSelectorPath(e.target)
      }
    };

    // handle links
    // todo: what if the link opens a new tab?
    if (e.target.localName === 'a' && e.target.href && e.target.href !== '#') {
      console.log('hit link');
      recordActionMessage.action.clickedLiveLink = true;
    }
    chrome.runtime.sendMessage(recordActionMessage);
    console.log('click!', recordActionMessage);
  }

  const handleKeydown = e => {
    chrome.runtime.sendMessage({ type: 'keydown', key: e.key });
  }

  // start recording
  if (rec) {
    // When we begin recording, inject our event listener(s)
    document.___jesteer = {}; // Container object which holds functionality we injected
    document.___jesteer.handleClick = function (e) { handleClick(e) };
    document.___jesteer.handleKeydown = function (e) { handleKeydown(e) };
    document.addEventListener('click', document.___jesteer.handleClick);
    document.addEventListener('keydown', document.___jesteer.handleKeydown);
  }
  // stop recording
  else {
    // remove event listeners
    if (document.___jesteer) {
      document.removeEventListener('click', document.___jesteer.handleClick);
      document.removeEventListener('keydown', document.___jesteer.handleKeydown);
    }
    // chrome.runtime.sendMessage({ type: 'stopRecording', url: window.location.href });
  }
}