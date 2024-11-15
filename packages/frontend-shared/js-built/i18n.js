class I18n {
  constructor(locale, devMode = false) {
    this.locale = locale;
    this.devMode = devMode;
    this.t = this.t.bind(this);
  }
  tsxCache;
  devMode;
  get ts() {
    if (this.devMode) {
      class Handler {
        get(target, p) {
          const value = target[p];
          if (typeof value === "object") {
            return new Proxy(value, new Handler());
          }
          if (typeof value === "string") {
            const parameters = Array.from(value.matchAll(/\{(\w+)\}/g), ([, parameter]) => parameter);
            if (parameters.length) {
              console.error(`Missing locale parameters: ${parameters.join(", ")} at ${String(p)}`);
            }
            return value;
          }
          console.error(`Unexpected locale key: ${String(p)}`);
          return p;
        }
      }
      return new Proxy(this.locale, new Handler());
    }
    return this.locale;
  }
  get tsx() {
    if (this.devMode) {
      if (this.tsxCache) {
        return this.tsxCache;
      }
      class Handler {
        get(target, p) {
          const value = target[p];
          if (typeof value === "object") {
            return new Proxy(value, new Handler());
          }
          if (typeof value === "string") {
            const quasis = [];
            const expressions = [];
            let cursor = 0;
            while (~cursor) {
              const start = value.indexOf("{", cursor);
              if (!~start) {
                quasis.push(value.slice(cursor));
                break;
              }
              quasis.push(value.slice(cursor, start));
              const end = value.indexOf("}", start);
              expressions.push(value.slice(start + 1, end));
              cursor = end + 1;
            }
            if (!expressions.length) {
              console.error(`Unexpected locale key: ${String(p)}`);
              return () => value;
            }
            return (arg) => {
              let str = quasis[0];
              for (let i = 0; i < expressions.length; i++) {
                if (!Object.hasOwn(arg, expressions[i])) {
                  console.error(`Missing locale parameters: ${expressions[i]} at ${String(p)}`);
                }
                str += arg[expressions[i]] + quasis[i + 1];
              }
              return str;
            };
          }
          console.error(`Unexpected locale key: ${String(p)}`);
          return p;
        }
      }
      return this.tsxCache = new Proxy(this.locale, new Handler());
    }
    if (this.tsxCache) {
      return this.tsxCache;
    }
    function build(target) {
      const result = {};
      for (const k in target) {
        if (!Object.hasOwn(target, k)) {
          continue;
        }
        const value = target[k];
        if (typeof value === "object") {
          result[k] = build(value);
        } else if (typeof value === "string") {
          const quasis = [];
          const expressions = [];
          let cursor = 0;
          while (~cursor) {
            const start = value.indexOf("{", cursor);
            if (!~start) {
              quasis.push(value.slice(cursor));
              break;
            }
            quasis.push(value.slice(cursor, start));
            const end = value.indexOf("}", start);
            expressions.push(value.slice(start + 1, end));
            cursor = end + 1;
          }
          if (!expressions.length) {
            continue;
          }
          result[k] = (arg) => {
            let str = quasis[0];
            for (let i = 0; i < expressions.length; i++) {
              str += arg[expressions[i]] + quasis[i + 1];
            }
            return str;
          };
        }
      }
      return result;
    }
    return this.tsxCache = build(this.locale);
  }
  t(key, args) {
    let str = this.locale;
    for (const k of key.split(".")) {
      str = str[k];
      if (this.devMode) {
        if (typeof str === "undefined") {
          console.error(`Unexpected locale key: ${key}`);
          return key;
        }
      }
    }
    if (args) {
      if (this.devMode) {
        const missing = Array.from(str.matchAll(/\{(\w+)\}/g), ([, parameter]) => parameter).filter((parameter) => !Object.hasOwn(args, parameter));
        if (missing.length) {
          console.error(`Missing locale parameters: ${missing.join(", ")} at ${key}`);
        }
      }
      for (const [k, v] of Object.entries(args)) {
        const search = `{${k}}`;
        if (this.devMode) {
          if (!str.includes(search)) {
            console.error(`Unexpected locale parameter: ${k} at ${key}`);
          }
        }
        str = str.replace(search, v.toString());
      }
    }
    return str;
  }
}
export {
  I18n
};
//# sourceMappingURL=i18n.js.map
