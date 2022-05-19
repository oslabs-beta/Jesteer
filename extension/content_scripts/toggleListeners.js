// Enables and Disables the Event Listeners that monitor the webpage
export function toggleListeners(rec) {
  // When an element in the current webpage is clicked, send a message back to the chrome extension
  // From there in can be added to the recorded actions
  const handleClick = (e) => {
    const recordActionMessage = {
      type: 'recordAction',
      action: {
        type: 'click',
        element: getSelectorPath(e.target),
      },
    };

    chrome.runtime.sendMessage(recordActionMessage);
  };

  const handleKeydown = (e) => {
    const { key } = e;
    chrome.runtime.sendMessage({ type: 'keydown', key });
  };

  // start recording
  if (rec) {
    // When we begin recording, inject our event listener(s)
    document.___jesteer = {}; // Container object which holds functionality we injected
    document.___jesteer.handleClick = (e) => handleClick(e);
    document.___jesteer.handleKeydown = (e) => handleKeydown(e);
    document.addEventListener('click', document.___jesteer.handleClick);
    document.addEventListener('keydown', document.___jesteer.handleKeydown);
  }
  // stop recording, remove event listeners
  else if (document.___jesteer) {
    document.removeEventListener('click', document.___jesteer.handleClick);
    document.removeEventListener('keydown', document.___jesteer.handleKeydown);
  }
  // chrome.runtime.sendMessage({ type: 'stopRecording', url: window.location.href });
}
