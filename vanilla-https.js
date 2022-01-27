import * as querystring from "./querystring-number.js";
const cache = {};

/**
* OPT must be in shape of RequestInit interface 
See https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.requestinit.html
*/
export const baseApi = async (url, obj, opt) => {
  if (typeof window === "undefined") {
    return;
  }
  let body = void 0; // undefined

  if (opt.method === "GET") {
    url += "?" + querystring.stringify(body);
  } else {
    body = obj && JSON.stringify(obj);
  }

  const realUrl = (opt.baseUrl || "") + url;
  const cacheKey = realUrl + body;

  // 若开启缓存，默认在内存中保留3分钟
  if (opt.cacheTime) {
    const old = cache[cacheKey];
    if (old && Date.now() - old.time < opt.cacheTime) {
      return old;
    }
  }

  let isForm = Object.prototype.toString.call(obj) === "[object FormData]";

  if (!(opt).headers) {
    (opt).headers = {};
  }

  if (!(opt).headers["Content-Type"]) {
    if (isForm) {
      (opt).headers["Content-Type"] =
        "application/x-www-form-urlencoded";
    } else {
      (opt).headers["Content-Type"] = "application/json";
    }
  }

  if (opt.method === "GET" && !(opt).headers["Cache-Control"]) {
    (opt).headers["Cache-Control"] = "public, max-age=604800, immutable";
  }

  return fetch(realUrl, {
    body,
    ...opt,
    headers: opt.headers,
  })
    .then(async (res) => {
      const data = await res[opt.format || "json"]();
      return { body: data, status: res.status, headers: res.headers };
    })
    .then(async (res) => {
      if (opt.cacheTime) {
        cache[cacheKey] = {
          data: res,
          time: Date.now(),
        };
      }
      if (opt.reduce) {
        res = await Promise.resolve(opt.reduce(res));
      }
      if (opt.onSuccess) {
        await Promise.resolve(opt.onSuccess(res));
      }
      return res;
    })
    .catch(async (err) => {
      if (opt.onError) {
        await Promise.resolve(opt.onError(err));
      }
    });
};

export const createHttp = (opt) => {
  return {
    get: (url, body, options) => {
      return baseApi(url, body, { ...opt, ...options, method: "GET" });
    },
    post: (url, body, options) => {
      return baseApi(url, body, { ...opt, ...options, method: "POST" });
    },
    put: (url, body, options) => {
      return baseApi(url, body, { ...opt, ...options, method: "PUT" });
    },
    del: (url, body, options) => {
      return baseApi(url, body, { ...opt, ...options, method: "DELETE" });
    },
    options: (url, body, options) => {
      return baseApi(url, body, { ...opt, ...options, method: "OPTIONS" });
    },
  };
};