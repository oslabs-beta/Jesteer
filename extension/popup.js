//Javascript Components for the popup page when the extension icon is clicked

btnSnapshot.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: snapshot,
  });

  // Add styling to elements with our custom attribute
  chrome.scripting.insertCSS({
    target: {tabId: tab.id},
    css: '*[___jesteer___highlight] { background-color: yellow !important; }'
  });

  window.close();
});

// btnDownload.addEventListener('click', () => {
  
//   const blob = new Blob(['Hello World', 'Goodbye'], {type: 'text/plain'});
//   const url = URL.createObjectURL(blob);
//   chrome.runtime.sendMessage({type: 'download', url});
// });

function snapshot() {
  //Helper Function to return a Selector Path to the given element
  function getSelectorPath(element) {
    const names = [];

    while (element.parentNode) {
      if (element.id) {
        names.unshift('#' + element.id);
        break;

      } else {
        // console.log('Comparing "element" and "element.ownerDocument.documentElement')
        // console.log(element);
        // console.log(element.ownerDocument.documentElement);
        // console.log('Loose Equality: ', element == element.ownerDocument.documentElement);
        // console.log('Stricy Equality: ', element === element.ownerDocument.documentElement);

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

  //Helper functions for selecting and deselecting elements
  const select = e => e.target.setAttribute('___jesteer___highlight', '');
  const deselect = e => e.target.removeAttribute('___jesteer___highlight');

  //Generate the snapshot
  const snap = e => {
    e.preventDefault();
    deselect(e);

    console.log('Element:');
    console.log(e.target);
    console.log('Selector Path:');
    const sp = getSelectorPath(e.target);
    console.log(sp);

    const blob = new Blob([sp], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    chrome.runtime.sendMessage({type: 'download', url});

    // Stop the event listeners after the snapshot is generated
    document.removeEventListener('mouseover', select);
    document.removeEventListener('mouseout', deselect);
    document.removeEventListener('click', snap);
  };



  
  //Add Event Listeners for Highlighting and Logging-on-Click
  document.addEventListener('mouseover', select);
  document.addEventListener('mouseout', deselect);
  document.addEventListener('click', snap);
}

//TODO: Some ordering is still somewhat unclear