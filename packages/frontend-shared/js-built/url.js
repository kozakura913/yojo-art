function query(obj) {
  const params = Object.entries(obj).filter(([, v]) => Array.isArray(v) ? v.length : v !== void 0).reduce((a, [k, v]) => (a[k] = v, a), {});
  return Object.entries(params).map((p) => `${p[0]}=${encodeURIComponent(p[1])}`).join("&");
}
function appendQuery(url, queryString) {
  return `${url}${/\?/.test(url) ? url.endsWith("?") ? "" : "&" : "?"}${queryString}`;
}
function extractDomain(url) {
  const match = url.match(/^(?:https?:)?(?:\/\/)?(?:[^@\n]+@)?([^:\/\n]+)/im);
  return match ? match[1] : null;
}
export {
  appendQuery,
  extractDomain,
  query
};
//# sourceMappingURL=url.js.map
