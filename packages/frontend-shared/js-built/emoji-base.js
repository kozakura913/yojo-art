const twemojiSvgBase = "/twemoji";
const fluentEmojiPngBase = "/fluent-emoji";
function char2twemojiFilePath(char) {
  let codes = Array.from(char, (x) => x.codePointAt(0)?.toString(16));
  if (!codes.includes("200d")) codes = codes.filter((x) => x !== "fe0f");
  codes = codes.filter((x) => x && x.length);
  const fileName = codes.join("-");
  return `${twemojiSvgBase}/${fileName}.svg`;
}
function char2fluentEmojiFilePath(char) {
  let codes = Array.from(char, (x) => x.codePointAt(0)?.toString(16));
  if (codes[0]?.startsWith("1f1")) return char2twemojiFilePath(char);
  if (!codes.includes("200d")) codes = codes.filter((x) => x !== "fe0f");
  codes = codes.filter((x) => x != null && x.length > 0);
  const fileName = codes.map((x) => x.padStart(4, "0")).join("-");
  return `${fluentEmojiPngBase}/${fileName}.png`;
}
export {
  char2fluentEmojiFilePath,
  char2twemojiFilePath
};
//# sourceMappingURL=emoji-base.js.map
