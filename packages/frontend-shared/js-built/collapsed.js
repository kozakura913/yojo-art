function shouldCollapsed(note, urls) {
  return note.cw == null && (note.text != null && (note.text.split("\n").length > 9 || note.text.length > 500 || urls.length >= 4) || note.files != null && note.files.length >= 5);
}
function shouldMfmCollapsed(note) {
  return note.cw == null && note.text != null && (note.text.includes("$[x2") || note.text.includes("$[x3") || note.text.includes("$[x4") || note.text.includes("$[scale"));
}
function shouldAnimatedMfm(note) {
  return note.cw == null && note.text != null && (note.text.includes("$[tada") || note.text.includes("$[jelly") || note.text.includes("$[twitch") || note.text.includes("$[shake") || note.text.includes("$[spin") || note.text.includes("$[jump") || note.text.includes("$[bounce") || note.text.includes("$[rainbow") || note.text.includes("$[sparkle") || note.text.includes("$[fade"));
}
export {
  shouldAnimatedMfm,
  shouldCollapsed,
  shouldMfmCollapsed
};
//# sourceMappingURL=collapsed.js.map
