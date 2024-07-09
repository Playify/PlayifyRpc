var o = Object.defineProperty;
var a = (i, t) => o(i, "name", { value: t, configurable: !0 });
const f = /* @__PURE__ */ a((i = "http://127.0.0.1:4590", t = process.env.RPC_TOKEN) => ({
  name: "playify-rpc",
  transform(e, s, l) {
    if (!l?.ssr)
      return;
    const r = 'import "/rpc.js"';
    if (e.includes(r))
      return {
        code: e.replaceAll(r, ""),
        map: null
      };
  },
  config(e, s) {
    const l = (e.build ??= {}).rollupOptions ??= {};
    let r = l.external;
    if (Array.isArray(r))
      r.push("/rpc.js");
    else if (typeof r == "function") {
      const p = r;
      r = /* @__PURE__ */ a((u, ...c) => u == "/rpc.js" || p(u, ...c), "external");
    } else
      r != null ? r = [r, "/rpc.js"] : r = ["/rpc.js"];
    l.external = r, l.makeAbsoluteExternalsRelative = !1;
    const n = (e.ssr ??= {}).external ??= [];
    if (n != !0 && n.push("playify-rpc", "/rpc.js"), ((e.optimizeDeps ??= {}).exclude ??= []).push("playify-rpc", "/rpc.js"), ((e.server ??= {}).proxy ??= {})["/rpc"] ??= {
      target: i,
      changeOrigin: !0,
      ws: !0,
      prependPath: !1,
      headers: t == null ? void 0 : {
        Cookie: "RPC_TOKEN=" + t
      }
    }, s.command == "build" && !(s.isSsrBuild || "ssrBuild" in s && s.ssrBuild)) {
      const p = (e.resolve ??= {}).alias ??= {};
      Array.isArray(p) ? p.push({
        find: "playify-rpc",
        replacement: "/rpc.js"
      }) : p["playify-rpc"] = "/rpc.js";
    }
  }
}), "playifyRpcPlugin");
export {
  f as playifyRpcPlugin
};
//# sourceMappingURL=vite.js.map
