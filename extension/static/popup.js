document.addEventListener('DOMContentLoaded', async () => {
  await chrome.storage.local.get('currentTest', ({ currentTest }) => {
    codegen.value = currentTest ?? '';
  });
});

btnCopy.addEventListener('click', async () => {
  const code = document.querySelector('#codegen').value;
  await navigator.clipboard.writeText(code);
});