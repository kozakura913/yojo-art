const FILE_TYPE_BROWSERSAFE = [
  // Images
  "image/png",
  "image/gif",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/apng",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  // OggS
  "audio/opus",
  "video/ogg",
  "audio/ogg",
  "application/ogg",
  // ISO/IEC base media file format
  "video/quicktime",
  "video/mp4",
  "audio/mp4",
  "video/x-m4v",
  "audio/x-m4a",
  "video/3gpp",
  "video/3gpp2",
  "video/mpeg",
  "audio/mpeg",
  "video/webm",
  "audio/webm",
  "audio/aac",
  // see https://github.com/misskey-dev/misskey/pull/10686
  "audio/flac",
  "audio/wav",
  // backward compatibility
  "audio/x-flac",
  "audio/vnd.wave"
];
const notificationTypes = [
  "note",
  "follow",
  "mention",
  "reply",
  "renote",
  "quote",
  "reaction",
  "pollEnded",
  "receiveFollowRequest",
  "followRequestAccepted",
  "groupInvited",
  "roleAssigned",
  "achievementEarned",
  "exportCompleted",
  "test",
  "app"
];
const obsoleteNotificationTypes = [
  "pollVote"
  /*, 'groupInvited'*/
];
const ROLE_POLICIES = [
  "gtlAvailable",
  "ltlAvailable",
  "canPublicNote",
  "canEditNote",
  "scheduleNoteMax",
  "mentionLimit",
  "canInvite",
  "inviteLimit",
  "inviteLimitCycle",
  "inviteExpirationTime",
  "canManageCustomEmojis",
  "canManageAvatarDecorations",
  "canSearchNotes",
  "canUseTranslator",
  "canUseAutoTranslate",
  "canHideAds",
  "driveCapacityMb",
  "alwaysMarkNsfw",
  "canUpdateBioMedia",
  "pinLimit",
  "antennaLimit",
  "wordMuteLimit",
  "webhookLimit",
  "clipLimit",
  "noteEachClipsLimit",
  "userListLimit",
  "userEachUserListsLimit",
  "rateLimitFactor",
  "avatarDecorationLimit",
  "canImportAntennas",
  "canImportBlocking",
  "canImportFollowing",
  "canImportMuting",
  "canImportUserLists",
  "fileSizeLimit"
];
const CURRENT_STICKY_TOP = "CURRENT_STICKY_TOP";
const CURRENT_STICKY_BOTTOM = "CURRENT_STICKY_BOTTOM";
const DEFAULT_SERVER_ERROR_IMAGE_URL = "https://xn--931a.moe/assets/error.jpg";
const DEFAULT_NOT_FOUND_IMAGE_URL = "https://xn--931a.moe/assets/not-found.jpg";
const DEFAULT_INFO_IMAGE_URL = "https://xn--931a.moe/assets/info.jpg";
const DEFAULT_YOU_BLOCKED_IMAGE_URL = "https://xn--931a.moe/assets/error.jpg";
const MFM_TAGS = ["tada", "jelly", "twitch", "shake", "spin", "jump", "bounce", "flip", "x2", "x3", "x4", "scale", "position", "fg", "bg", "border", "font", "blur", "rainbow", "sparkle", "fade", "rotate", "ruby", "unixtime"];
const MFM_PARAMS = {
  tada: ["speed=", "delay="],
  jelly: ["speed=", "delay="],
  twitch: ["speed=", "delay="],
  shake: ["speed=", "delay="],
  spin: ["speed=", "delay=", "left", "alternate", "x", "y"],
  jump: ["speed=", "delay="],
  bounce: ["speed=", "delay="],
  flip: ["h", "v"],
  x2: [],
  x3: [],
  x4: [],
  scale: ["x=", "y="],
  position: ["x=", "y="],
  fg: ["color="],
  bg: ["color="],
  border: ["width=", "style=", "color=", "radius=", "noclip"],
  font: ["serif", "monospace", "cursive", "fantasy", "emoji", "math"],
  blur: [],
  rainbow: ["speed=", "delay="],
  fade: ["speed=", "delay="],
  rotate: ["deg="],
  ruby: [],
  unixtime: []
};
const HTML_TAGS = ["bold", "strike", "italic", "small", "center", "plain", "inlinecode", "blockcode", "mathinline", "mathblock"];
export {
  CURRENT_STICKY_BOTTOM,
  CURRENT_STICKY_TOP,
  DEFAULT_INFO_IMAGE_URL,
  DEFAULT_NOT_FOUND_IMAGE_URL,
  DEFAULT_SERVER_ERROR_IMAGE_URL,
  DEFAULT_YOU_BLOCKED_IMAGE_URL,
  FILE_TYPE_BROWSERSAFE,
  HTML_TAGS,
  MFM_PARAMS,
  MFM_TAGS,
  ROLE_POLICIES,
  notificationTypes,
  obsoleteNotificationTypes
};
//# sourceMappingURL=const.js.map
