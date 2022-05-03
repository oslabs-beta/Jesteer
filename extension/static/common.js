// Return a Selector Path to the given element
function getSelectorPath(element) {

  const names = [];
  while (element.parentNode) {
    if (element.id) {
      names.unshift('#' + element.id);
      break;

    } else {

      if (element === element.ownerDocument.documentElement) names.unshift(element.tagName);
      else {
        let e = element;
        let i = 1;

        while (e.previousElementSibling) {
          e = e.previousElementSibling;
          i++;
        }
        names.unshift(`${element.tagName}:nth-child(${i})`);
      }
    }
    element = element.parentNode;
  }
  return names.join(' > ');
}
