document.addEventListener('DOMContentLoaded', async () => {
  await chrome.storage.local.get('currentTest', ({ currentTest }) => {
    codegen.value = currentTest ?? '';
  });
});

codegen.addEventListener('change', () => {
  chrome.storage.local.set({ currentTest: codegen.value });
});

btnCopy.addEventListener('click', async () => {
  const code = document.querySelector('#codegen').value;
  await navigator.clipboard.writeText(code);
  btnCopyValue.innerText = 'Copied!';
});