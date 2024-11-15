import { lang } from "@@/js/config.js";
const versatileLang = (lang ?? "ja-JP").replace("ja-KS", "ja-JP");
let _dateTimeFormat;
try {
  _dateTimeFormat = new Intl.DateTimeFormat(versatileLang, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  });
} catch (err) {
  console.warn(err);
  if (_DEV_) console.log("[Intl] Fallback to en-US");
  _dateTimeFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  });
}
const dateTimeFormat = _dateTimeFormat;
const timeZone = dateTimeFormat.resolvedOptions().timeZone;
const hemisphere = /^(australia|pacific|antarctica|indian)\//i.test(timeZone) ? "S" : "N";
let _numberFormat;
try {
  _numberFormat = new Intl.NumberFormat(versatileLang);
} catch (err) {
  console.warn(err);
  if (_DEV_) console.log("[Intl] Fallback to en-US");
  _numberFormat = new Intl.NumberFormat("en-US");
}
const numberFormat = _numberFormat;
export {
  dateTimeFormat,
  hemisphere,
  numberFormat,
  timeZone,
  versatileLang
};
//# sourceMappingURL=intl-const.js.map
