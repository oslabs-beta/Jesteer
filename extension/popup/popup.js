const codegen = document.querySelector('#codegen');

document.addEventListener('DOMContentLoaded', async () => {
  await chrome.storage.local.get('currentTest', ({ currentTest }) => {
    codegen.value = currentTest ?? '';
  });
});

codegen.addEventListener('change', () => {
  chrome.storage.local.set({ currentTest: codegen.value });
});

document.querySelector('#btnCopy').addEventListener('click', async () => {
  const code = codegen.value;
  await navigator.clipboard.writeText(code);
  document.querySelector('#btnCopyValue').innerText = 'Copied!';
});
