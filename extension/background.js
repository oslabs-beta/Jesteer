// Extenstion 'Backend' so to speak


// Initialize on Start
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({recording: false});
})

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  switch (request.type) {
    // Download Snapshot
    case 'download':
      //
      chrome.downloads.download({
        url: request.url,
        filename: 'snapshot.js'
      },
      downloadId => {
        chrome.downloads.show(downloadId);
        console.log('ERROR?', chrome.runtime.lastError);
      });
    
      sendResponse({ok: true});
      break;

    // Received unknown message
    default:
      console.log('Received Unknown Message')
      break;
  }
});

// Abort recording on tab changed
chrome.tabs.onUpdated.addListener(() => {
  // This logic will eventually need to be more sophisticated
  // TODO: Consider saving the existing recording for picking up where it was left off

  chrome.storage.local.set({recording: false});
});