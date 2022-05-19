// common.js stores functions that are used by other injected content scripts.

// Return a Selector Path to the given element.
// eslint-disable-next-line no-unused-vars
function getSelectorPath(element) {
  const names = [];
  let current = element;
  while (current.parentNode) {
    if (current.id) {
      names.unshift(`#${current.id}`);
      break;
    }
    else if (current === current.ownerDocument.documentElement) {
      names.unshift(current.tagName);
    }
    else {
      let e = current;
      let i = 1;

      while (e.previousElementSibling) {
        e = e.previousElementSibling;
        i++;
      }
      names.unshift(`${current.tagName}:nth-child(${i})`);
    }
    current = current.parentNode;
  }
  return names.join(' > ');
}
