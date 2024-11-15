const address = new URL(document.querySelector('meta[property="instance_url"]')?.content || location.href);
const siteName = document.querySelector('meta[property="og:site_name"]')?.content;
const host = address.host;
const hostname = address.hostname;
const url = address.origin;
const apiUrl = location.origin + "/api";
const wsOrigin = location.origin;
const lang = localStorage.getItem("lang") ?? "en-US";
const langs = _LANGS_;
const preParseLocale = localStorage.getItem("locale");
let locale = preParseLocale ? JSON.parse(preParseLocale) : null;
const version = _VERSION_;
const basedMisskeyVersion = _BASEDMISSKEYVERSION_;
const instanceName = siteName === "CherryPick" || siteName == null ? host : siteName;
const ui = localStorage.getItem("ui");
const debug = localStorage.getItem("debug") === "true";
function updateLocale(newLocale) {
  locale = newLocale;
}
export {
  apiUrl,
  basedMisskeyVersion,
  debug,
  host,
  hostname,
  instanceName,
  lang,
  langs,
  locale,
  ui,
  updateLocale,
  url,
  version,
  wsOrigin
};
//# sourceMappingURL=config.js.map
