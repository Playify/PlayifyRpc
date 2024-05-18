const c = (n = "http://127.0.0.1:4590", t = process.env.RPC_TOKEN) => ({
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
      r = (i, ...u) => i == "/rpc.js" || p(i, ...u);
    } else
      r != null ? r = [r, "/rpc.js"] : r = ["/rpc.js"];
    l.external = r, l.makeAbsoluteExternalsRelative = !1;
    const a = (e.ssr ??= {}).external ??= [];
    if (a != !0 && a.push("playify-rpc", "/rpc.js"), ((e.optimizeDeps ??= {}).exclude ??= []).push("playify-rpc", "/rpc.js"), ((e.server ??= {}).proxy ??= {})["/rpc"] ??= {
      target: n,
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
});
export {
  c as default
};
//# sourceMappingURL=vite.js.map
