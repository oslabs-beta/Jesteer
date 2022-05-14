// Javascript Components for the popup page when the extension icon is clicked

// Injects the event listeners that select/deselect DOM elements
function prepareSnapshot() {
  // Helper functions for selecting and deselecting elements
  const select = (e) => e.target.setAttribute('___jesteer___highlight', '');
  const deselect = (e) => e.target.removeAttribute('___jesteer___highlight');

  // Generate the snapshot
  const snap = (e) => {
    e.preventDefault();
    deselect(e);

    const selectorPath = getSelectorPath(e.target);

    const action = { type: 'snapshot', element: selectorPath };
    chrome.runtime.sendMessage({ type: 'recordAction', action });

    // Stop the event listeners after the snapshot is generated
    document.removeEventListener('mouseover', select);
    document.removeEventListener('mouseout', deselect);
    document.removeEventListener('click', snap);
  };

  // Add Event Listeners for Highlighting and Logging-on-Click
  document.addEventListener('mouseover', select);
  document.addEventListener('mouseout', deselect);
  document.addEventListener('click', snap);
}

const btnSnapshot = document.querySelector('#btnSnapshot');

btnSnapshot.addEventListener('click', async () => {
  const testing = (navigator.userAgent === 'PuppeteerAgent');

  let tab;
  if (testing) {
    const tabs = (await chrome.tabs.query({ currentWindow: true, active: false }));
    const index = 1; // when testing, popup.html is at tab index 1
    tab = tabs[index];
  }
  else {
    const tabs = (await chrome.tabs.query({ currentWindow: true, active: true }));
    const index = 0; // when not testing, popup.html is at tab index 0
    tab = tabs[index];
  }

  // Execute the 'snapshot' function in the context of the current webpage
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: prepareSnapshot,
  });

  // Add styling to the attribute given to elements we're hovering over
  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    css: '*[___jesteer___highlight] { background-color: yellow !important; }',
  });

  // Dismiss the popup if not testing
  if (navigator.userAgent !== 'PuppeteerAgent') {
    window.close();
  }
});
