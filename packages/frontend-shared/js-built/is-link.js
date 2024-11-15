function isLink(el) {
  if (el.tagName === "A") return true;
  if (el.parentElement) {
    return isLink(el.parentElement);
  }
  return false;
}
export {
  isLink
};
//# sourceMappingURL=is-link.js.map
