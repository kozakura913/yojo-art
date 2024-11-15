import { query } from "./url.js";
class MediaProxy {
  serverMetadata;
  url;
  constructor(serverMetadata, url) {
    this.serverMetadata = serverMetadata;
    this.url = url;
  }
  getProxiedImageUrl(imageUrl, type, mustOrigin = false, noFallback = false) {
    const localProxy = `${this.url}/proxy`;
    let _imageUrl = imageUrl;
    if (imageUrl.startsWith(this.serverMetadata.mediaProxy + "/") || imageUrl.startsWith("/proxy/") || imageUrl.startsWith(localProxy + "/")) {
      _imageUrl = new URL(imageUrl).searchParams.get("url") ?? imageUrl;
    }
    return `${mustOrigin ? localProxy : this.serverMetadata.mediaProxy}/${type === "preview" ? "preview.webp" : "image.webp"}?${query({
      url: _imageUrl,
      ...!noFallback ? { "fallback": "1" } : {},
      ...type ? { [type]: "1" } : {},
      ...mustOrigin ? { origin: "1" } : {}
    })}`;
  }
  getProxiedImageUrlNullable(imageUrl, type) {
    if (imageUrl == null) return null;
    return this.getProxiedImageUrl(imageUrl, type);
  }
  getStaticImageUrl(baseUrl) {
    const u = baseUrl.startsWith("http") ? new URL(baseUrl) : new URL(baseUrl, this.url);
    if (u.href.startsWith(`${this.url}/emoji/`)) {
      u.searchParams.set("static", "1");
      return u.href;
    }
    if (u.href.startsWith(this.serverMetadata.mediaProxy + "/")) {
      u.searchParams.set("static", "1");
      return u.href;
    }
    return `${this.serverMetadata.mediaProxy}/static.webp?${query({
      url: u.href,
      static: "1"
    })}`;
  }
}
export {
  MediaProxy
};
//# sourceMappingURL=media-proxy.js.map
