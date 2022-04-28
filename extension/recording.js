// Handles logic for recording browser actions

const recordButtonUpdate = (rec) => btnRecord.innerText = rec ? 'Stop Recording' : 'Record';




chrome.storage.local.get('recording', ({recording}) => {
  recordButtonUpdate(recording);
});

btnRecord.addEventListener('click', async () => {
  //Get activeTab
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  let {recording} = await chrome.storage.local.get('recording');
  recording = !recording;

  recordButtonUpdate(recording);
  chrome.storage.local.set({recording});
  
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: listen,
    args: [recording]
  });




  // chrome.storage.local.get('recording', ({recording}) => {
  //   //Toggle Recording state
  //   recording = !recording;
  //   const msg = recording ? 'Stop Recording' : 'Record';
  //   recordButtonUpdate(recording);
  //   chrome.storage.local.set({recording});

  //   chrome.scripting.executeScript({
  //     target: {tabId: tab.id},
  //     function: listen
  //   });
  // });

  window.close();
});


function listen(rec) {
  const handleClick = e => {
    e.preventDefault();
    console.log(e.target);
  }

  if (rec) {
    document.___jesteer = {};
    document.addEventListener('click', document.___jesteer.handleClick = function fn(e) {handleClick(e)});
  } else {
    document.removeEventListener('click', document.___jesteer.handleClick);
  }
}