console.log('Hello world')

// Helper Function to return a Selector Path to the given element
function getSelectorPath(element) {
  /// trying to modularize out getSelectorPath
  // TODO: This function is copied verbatim in two place.
  // This is not DRY.
  // Maybe a static method on a Class?

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
        names.unshift(`${ element.tagName }:nth-child(${ i })`);
      }
    }
    element = element.parentNode;
  }
  return names.join(' > ');
}