btnCopy.addEventListener('click', async () => {
  const code = document.querySelector('#codegen').value;
  await navigator.clipboard.writeText(code);
});