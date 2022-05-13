// options that help us decide which tab to act on, depending on whether we're testing or not
const QUERY_TAB_OPTS = { currentWindow: true, active: true };
const E2E_QUERY_TAB_OPTS = { currentWindow: true, active: false };


// set variables which let us know whether
chrome.tabs.getCurrent(async tab => {
  const testing = !!tab;
  await chrome.storage.local.set({ testing });
  // const opts = isRunningExtensionOnBrowserTab ? E2E_QUERY_TAB_OPTS : QUERY_TAB_OPTS;
  const opts = testing ? E2E_QUERY_TAB_OPTS : QUERY_TAB_OPTS;
  await chrome.storage.local.set({ opts });
  const tabIndex = testing ? 1 : 0;
  await chrome.storage.local.set({ tabIndex });
});