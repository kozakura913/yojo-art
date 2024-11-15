const unicodeEmojiCategories = ["face", "people", "animals_and_nature", "food_and_drink", "activity", "travel_and_places", "objects", "symbols", "flags"];
import _emojilist from "./emojilist.json";
const emojilist = _emojilist.map((x) => ({
  name: x[1],
  char: x[0],
  category: unicodeEmojiCategories[x[2]]
}));
const unicodeEmojisMap = new Map(
  emojilist.map((x) => [x.char, x])
);
const _indexByChar = /* @__PURE__ */ new Map();
const _charGroupByCategory = /* @__PURE__ */ new Map();
for (let i = 0; i < emojilist.length; i++) {
  const emo = emojilist[i];
  _indexByChar.set(emo.char, i);
  if (_charGroupByCategory.has(emo.category)) {
    _charGroupByCategory.get(emo.category)?.push(emo.char);
  } else {
    _charGroupByCategory.set(emo.category, [emo.char]);
  }
}
const emojiCharByCategory = _charGroupByCategory;
function getUnicodeEmoji(char) {
  return unicodeEmojisMap.get(colorizeEmoji(char)) ?? unicodeEmojisMap.get(char) ?? char;
}
function getEmojiName(char) {
  const idx = _indexByChar.get(colorizeEmoji(char)) ?? _indexByChar.get(char);
  if (idx === void 0) {
    return char;
  } else {
    return emojilist[idx].name;
  }
}
function colorizeEmoji(char) {
  return char.length === 1 ? `${char}\uFE0F` : char;
}
export {
  colorizeEmoji,
  emojiCharByCategory,
  emojilist,
  getEmojiName,
  getUnicodeEmoji,
  unicodeEmojiCategories
};
//# sourceMappingURL=emojilist.js.map
