const embeddableEntities = [
  "notes",
  "user-timeline",
  "clips",
  "tags"
];
const embedRouteWithScrollbar = [
  "clips",
  "tags",
  "user-timeline"
];
const defaultEmbedParams = {
  maxHeight: void 0,
  colorMode: void 0,
  rounded: true,
  border: true,
  autoload: false,
  header: true
};
function parseEmbedParams(searchParams) {
  let _searchParams;
  if (typeof searchParams === "string") {
    _searchParams = new URLSearchParams(searchParams);
  } else if (searchParams instanceof URLSearchParams) {
    _searchParams = searchParams;
  } else {
    throw new Error("searchParams must be URLSearchParams or string");
  }
  function convertBoolean(value) {
    if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    }
    return void 0;
  }
  function convertNumber(value) {
    if (value != null && !isNaN(Number(value))) {
      return Number(value);
    }
    return void 0;
  }
  function convertColorMode(value) {
    if (value != null && ["light", "dark"].includes(value)) {
      return value;
    }
    return void 0;
  }
  return {
    maxHeight: convertNumber(_searchParams.get("maxHeight")) ?? defaultEmbedParams.maxHeight,
    colorMode: convertColorMode(_searchParams.get("colorMode")) ?? defaultEmbedParams.colorMode,
    rounded: convertBoolean(_searchParams.get("rounded")) ?? defaultEmbedParams.rounded,
    border: convertBoolean(_searchParams.get("border")) ?? defaultEmbedParams.border,
    autoload: convertBoolean(_searchParams.get("autoload")) ?? defaultEmbedParams.autoload,
    header: convertBoolean(_searchParams.get("header")) ?? defaultEmbedParams.header
  };
}
export {
  defaultEmbedParams,
  embedRouteWithScrollbar,
  parseEmbedParams
};
//# sourceMappingURL=embed-page.js.map
