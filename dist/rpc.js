var ze = Object.defineProperty;
var a = (t, e) => ze(t, "name", { value: e, configurable: !0 });
const ce = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
function W(t) {
  return function(e) {
    const [n, r] = ce;
    n.set(t, e), r.set(e, t);
  };
}
a(W, "RpcCustomError");
var Ne = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ve(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
a(Ve, "getDefaultExportFromCjs");
var Oe = { exports: {} }, oe = { exports: {} }, Ce;
function He() {
  return Ce || (Ce = 1, function(t, e) {
    (function(n, r) {
      t.exports = r();
    })(Ne, function() {
      function n(f) {
        return !isNaN(parseFloat(f)) && isFinite(f);
      }
      a(n, "_isNumber");
      function r(f) {
        return f.charAt(0).toUpperCase() + f.substring(1);
      }
      a(r, "_capitalize");
      function i(f) {
        return function() {
          return this[f];
        };
      }
      a(i, "_getter");
      var s = ["isConstructor", "isEval", "isNative", "isToplevel"], o = ["columnNumber", "lineNumber"], l = ["fileName", "functionName", "source"], c = ["args"], y = ["evalOrigin"], u = s.concat(o, l, c, y);
      function h(f) {
        if (f)
          for (var d = 0; d < u.length; d++)
            f[u[d]] !== void 0 && this["set" + r(u[d])](f[u[d]]);
      }
      a(h, "StackFrame"), h.prototype = {
        getArgs: function() {
          return this.args;
        },
        setArgs: function(f) {
          if (Object.prototype.toString.call(f) !== "[object Array]")
            throw new TypeError("Args must be an Array");
          this.args = f;
        },
        getEvalOrigin: function() {
          return this.evalOrigin;
        },
        setEvalOrigin: function(f) {
          if (f instanceof h)
            this.evalOrigin = f;
          else if (f instanceof Object)
            this.evalOrigin = new h(f);
          else
            throw new TypeError("Eval Origin must be an Object or StackFrame");
        },
        toString: function() {
          var f = this.getFileName() || "", d = this.getLineNumber() || "", R = this.getColumnNumber() || "", q = this.getFunctionName() || "";
          return this.getIsEval() ? f ? "[eval] (" + f + ":" + d + ":" + R + ")" : "[eval]:" + d + ":" + R : q ? q + " (" + f + ":" + d + ":" + R + ")" : f + ":" + d + ":" + R;
        }
      }, h.fromString = /* @__PURE__ */ a(function(d) {
        var R = d.indexOf("("), q = d.lastIndexOf(")"), Ue = d.substring(0, R), Ke = d.substring(R + 1, q).split(","), _e = d.substring(q + 1);
        if (_e.indexOf("@") === 0)
          var ae = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(_e, ""), We = ae[1], qe = ae[2], Ge = ae[3];
        return new h({
          functionName: Ue,
          args: Ke || void 0,
          fileName: We,
          lineNumber: qe || void 0,
          columnNumber: Ge || void 0
        });
      }, "StackFrame$$fromString");
      for (var g = 0; g < s.length; g++)
        h.prototype["get" + r(s[g])] = i(s[g]), h.prototype["set" + r(s[g])] = /* @__PURE__ */ function(f) {
          return function(d) {
            this[f] = !!d;
          };
        }(s[g]);
      for (var w = 0; w < o.length; w++)
        h.prototype["get" + r(o[w])] = i(o[w]), h.prototype["set" + r(o[w])] = /* @__PURE__ */ function(f) {
          return function(d) {
            if (!n(d))
              throw new TypeError(f + " must be a Number");
            this[f] = Number(d);
          };
        }(o[w]);
      for (var p = 0; p < l.length; p++)
        h.prototype["get" + r(l[p])] = i(l[p]), h.prototype["set" + r(l[p])] = /* @__PURE__ */ function(f) {
          return function(d) {
            this[f] = String(d);
          };
        }(l[p]);
      return h;
    });
  }(oe)), oe.exports;
}
a(He, "requireStackframe");
(function(t, e) {
  (function(n, r) {
    t.exports = r(He());
  })(Ne, /* @__PURE__ */ a(function(r) {
    var i = /(^|@)\S+:\d+/, s = /^\s*at .*(\S+:\d+|\(native\))/m, o = /^(eval@)?(\[native code])?$/;
    return {
      /**
       * Given an Error object, extract the most information from it.
       *
       * @param {Error} error object
       * @return {Array} of StackFrames
       */
      parse: /* @__PURE__ */ a(function(c) {
        if (typeof c.stacktrace < "u" || typeof c["opera#sourceloc"] < "u")
          return this.parseOpera(c);
        if (c.stack && c.stack.match(s))
          return this.parseV8OrIE(c);
        if (c.stack)
          return this.parseFFOrSafari(c);
        throw new Error("Cannot parse given Error object");
      }, "ErrorStackParser$$parse"),
      // Separate line and column numbers from a string of the form: (URI:Line:Column)
      extractLocation: /* @__PURE__ */ a(function(c) {
        if (c.indexOf(":") === -1)
          return [c];
        var y = /(.+?)(?::(\d+))?(?::(\d+))?$/, u = y.exec(c.replace(/[()]/g, ""));
        return [u[1], u[2] || void 0, u[3] || void 0];
      }, "ErrorStackParser$$extractLocation"),
      parseV8OrIE: /* @__PURE__ */ a(function(c) {
        var y = c.stack.split(`
`).filter(function(u) {
          return !!u.match(s);
        }, this);
        return y.map(function(u) {
          u.indexOf("(eval ") > -1 && (u = u.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, ""));
          var h = u.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, ""), g = h.match(/ (\(.+\)$)/);
          h = g ? h.replace(g[0], "") : h;
          var w = this.extractLocation(g ? g[1] : h), p = g && h || void 0, f = ["eval", "<anonymous>"].indexOf(w[0]) > -1 ? void 0 : w[0];
          return new r({
            functionName: p,
            fileName: f,
            lineNumber: w[1],
            columnNumber: w[2],
            source: u
          });
        }, this);
      }, "ErrorStackParser$$parseV8OrIE"),
      parseFFOrSafari: /* @__PURE__ */ a(function(c) {
        var y = c.stack.split(`
`).filter(function(u) {
          return !u.match(o);
        }, this);
        return y.map(function(u) {
          if (u.indexOf(" > eval") > -1 && (u = u.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1")), u.indexOf("@") === -1 && u.indexOf(":") === -1)
            return new r({
              functionName: u
            });
          var h = /((.*".+"[^@]*)?[^@]*)(?:@)/, g = u.match(h), w = g && g[1] ? g[1] : void 0, p = this.extractLocation(u.replace(h, ""));
          return new r({
            functionName: w,
            fileName: p[0],
            lineNumber: p[1],
            columnNumber: p[2],
            source: u
          });
        }, this);
      }, "ErrorStackParser$$parseFFOrSafari"),
      parseOpera: /* @__PURE__ */ a(function(c) {
        return !c.stacktrace || c.message.indexOf(`
`) > -1 && c.message.split(`
`).length > c.stacktrace.split(`
`).length ? this.parseOpera9(c) : c.stack ? this.parseOpera11(c) : this.parseOpera10(c);
      }, "ErrorStackParser$$parseOpera"),
      parseOpera9: /* @__PURE__ */ a(function(c) {
        for (var y = /Line (\d+).*script (?:in )?(\S+)/i, u = c.message.split(`
`), h = [], g = 2, w = u.length; g < w; g += 2) {
          var p = y.exec(u[g]);
          p && h.push(new r({
            fileName: p[2],
            lineNumber: p[1],
            source: u[g]
          }));
        }
        return h;
      }, "ErrorStackParser$$parseOpera9"),
      parseOpera10: /* @__PURE__ */ a(function(c) {
        for (var y = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i, u = c.stacktrace.split(`
`), h = [], g = 0, w = u.length; g < w; g += 2) {
          var p = y.exec(u[g]);
          p && h.push(
            new r({
              functionName: p[3] || void 0,
              fileName: p[2],
              lineNumber: p[1],
              source: u[g]
            })
          );
        }
        return h;
      }, "ErrorStackParser$$parseOpera10"),
      // Opera 10.65+ Error.stack very similar to FF/Safari
      parseOpera11: /* @__PURE__ */ a(function(c) {
        var y = c.stack.split(`
`).filter(function(u) {
          return !!u.match(i) && !u.match(/^Error created at/);
        }, this);
        return y.map(function(u) {
          var h = u.split("@"), g = this.extractLocation(h.pop()), w = h.shift() || "", p = w.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0, f;
          w.match(/\(([^)]*)\)/) && (f = w.replace(/^[^(]+\(([^)]*)\)$/, "$1"));
          var d = f === void 0 || f === "[arguments not available]" ? void 0 : f.split(",");
          return new r({
            functionName: p,
            args: d,
            fileName: g[0],
            lineNumber: g[1],
            columnNumber: g[2],
            source: u
          });
        }, this);
      }, "ErrorStackParser$$parseOpera11")
    };
  }, "ErrorStackParser"));
})(Oe);
var Je = Oe.exports;
const X = /* @__PURE__ */ Ve(Je);
function le(t) {
  return t.replaceAll("\r", "").replaceAll(/^\n+|\n+$/g, "").replaceAll(/^  +/gm, "	");
}
a(le, "fixString");
function Q(t) {
  let e = "";
  for (let n of t) {
    if (n.functionName?.includes("$RPC_MARKER_BEGIN$"))
      break;
    e += `
	at ` + n;
  }
  return e;
}
a(Q, "framesToString");
function Le(t) {
  return t === void 0 ? "" : t instanceof b ? `
caused by: ` + t.toString() : t instanceof Error ? `
caused by: ` + le(t.toString()) + Q(X.parse(t)) + Le(t.cause) : `
caused by: ` + le(t?.toString() ?? "null");
}
a(Le, "causeToString");
function xe(t, e) {
  return (t === b || xe(t.__proto__, e)) && e[0].functionName?.replace(/^new /, "") === t.name ? (e.shift(), !0) : !1;
}
a(xe, "removeFromStackTrace");
class b extends Error {
  static {
    a(this, "RpcError");
  }
  //public get type(){return this.name}
  from;
  data = {};
  #t = [];
  get stackTrace() {
    let e = this.#e;
    return e += Q(this.#t), e += this.#r, e.replaceAll(/^\n+/g, "");
  }
  #e = "";
  #n = !1;
  #r = "";
  constructor(...e) {
    let n = null, r = null, i = null, s = {}, o;
    switch (e.length) {
      case 1:
        [r] = e;
        break;
      case 2:
        [r, o] = e;
        break;
      case 4:
        [r, n, r, i] = e;
        break;
      case 5:
        e[4] instanceof b ? [r, n, r, i, o] = e : [r, n, r, i, s] = e;
        break;
      case 6:
        [r, n, r, i, s, o] = e;
        break;
      default:
        throw new Error("Invalid arg count");
    }
    o != null ? super(r ?? void 0, { cause: o }) : super(r ?? void 0), this.name = this.constructor.name, this.from = n ?? v.prettyName;
    const l = ce[1].get(this.constructor);
    if (l != null && (this.data.$type = l), Object.assign(this.data, s ?? {}), i == null)
      this.#n = !0, this.#t = X.parse(this), xe(this.constructor, this.#t);
    else {
      this.#e = `
` + le(i);
      const c = this.#e.indexOf(`
caused by: `);
      c != -1 && (this.#r += this.#e.substring(c), this.#e = this.#e.substring(0, c));
    }
    this.#r += Le(o), this.stack = this.toString();
  }
  toString() {
    let e = this.name + "(" + this.from + ")";
    this.message?.trim() && (e += ": " + this.message);
    const n = this.stackTrace;
    return n?.trim() && (e += `
` + n), e;
  }
  write(e) {
    e.writeString(this.name), e.writeString(this.from), e.writeString(this.message), e.writeString(this.stackTrace), e.writeString(Object.keys(this.data).length == 0 ? null : JSON.stringify(this.data));
  }
  static read(e) {
    const n = e.readString(), r = e.readString() ?? "???", i = e.readString(), s = e.readString() ?? "";
    let o;
    try {
      o = JSON.parse(e.readString() ?? "null");
    } catch (l) {
      if (l instanceof RangeError)
        o = { $info: "JsonData was not included, due to an old PlayifyRpc version" };
      else
        throw l;
    }
    return b.create(n, r, i, s, o);
  }
  static create(e, n, r, i, s) {
    const o = s?.$type, l = ce[0].get(o) ?? b;
    return new l(e, n, r, i, s);
  }
  static wrapAndFreeze(e) {
    return e instanceof b ? (e.#n && (e.#n = !1, e.#e += Q(e.#t), e.#t = [], e.stack = e.toString()), e) : new b(
      e.name,
      e instanceof b ? e.from : null,
      e.message,
      Q(X.parse(e)).substring(1),
      {},
      e.cause
    );
  }
  unfreeze(e, n) {
    return this.#n ? this : (this.#n = !0, this.#t = X.parse(e).slice(n), this.stack = this.toString(), this);
  }
  trashLocalStack() {
    return this.#n = !1, this.#t = [], this.stack = this.toString(), this;
  }
  append(e, n, r) {
    return this.#e += `
	rpc ` + (r == null ? "<<callLocal>>" : (e ?? "<<null>>") + "." + (n ?? "<<null>>") + "(" + r.map((i) => JSON.stringify(i)).join(",") + ")"), this.stack = this.toString(), this;
  }
}
const Te = globalThis?.process?.versions?.node != null, Ee = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", ue = /* @__PURE__ */ a(() => Date.now().toString(36) + Array(10).fill(void 0).map(() => Ee[Math.floor(Math.random() * Ee.length)]).join(""), "randomId");
let _;
if (Te)
  try {
    process?.versions.bun ? _ = "bun@" + require("os").hostname() + "@" + process.pid : _ = "node@" + process.binding("os").getHostname() + "@" + process.pid;
  } catch {
    _ = "node-alternative@" + process.platform + ":" + process.arch + "@" + process.pid;
  }
else
  "document" in globalThis ? _ = "web@" + document.location + "#" + ue() : _ = "js@" + ue();
var $e = Object.defineProperty, Xe = Object.getOwnPropertyDescriptor, Qe = /* @__PURE__ */ a((t, e, n) => e in t ? $e(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, "__defNormalProp"), H = /* @__PURE__ */ a((t, e, n, r) => {
  for (var i = r > 1 ? void 0 : r ? Xe(e, n) : e, s = t.length - 1, o; s >= 0; s--)
    (o = t[s]) && (i = (r ? o(e, n, i) : o(i)) || i);
  return r && i && $e(e, n, i), i;
}, "__decorateClass"), ne = /* @__PURE__ */ a((t, e, n) => (Qe(t, typeof e != "symbol" ? e + "" : e, n), n), "__publicField");
const G = /* @__PURE__ */ a((t) => t == null ? "null" : '"' + t + '"', "quoted");
class J extends b {
  static {
    a(this, "RpcCallError");
  }
}
let A = class extends J {
  static {
    a(this, "RpcTypeNotFoundError");
  }
};
ne(A, "new", (t) => new A(
  null,
  null,
  `Type ${G(t)} does not exist`,
  "",
  { type: t }
));
A = H([
  W("$type")
], A);
let P = class extends J {
  static {
    a(this, "RpcMethodNotFoundError");
  }
};
ne(P, "new", (t, e) => new P(
  null,
  null,
  `Method ${G(e)} does not exist on type ${G(t)}`,
  "",
  { type: t, method: e }
));
P = H([
  W("$method")
], P);
let K = class extends P {
  static {
    a(this, "RpcMetaMethodNotFoundError");
  }
};
ne(K, "new", (t, e) => new K(
  null,
  null,
  `Meta-Method ${G(e)} does not exist on type ${G(t)}`,
  "",
  { type: t, method: null, meta: e }
));
K = H([
  W("$method-meta")
], K);
let L = class extends J {
  static {
    a(this, "RpcConnectionError");
  }
};
ne(L, "new", (t) => new L(null, null, t, ""));
L = H([
  W("$connection")
], L);
let fe = class extends J {
  static {
    a(this, "RpcEvalError");
  }
};
fe = H([
  W("$eval")
], fe);
const pe = /* @__PURE__ */ Object.create(null), E = /* @__PURE__ */ new Map();
E.set("$" + _, pe);
async function Ye() {
  return "$" + _ + "$" + ue();
}
a(Ye, "generateTypeName");
async function Ae(t, e) {
  if (!E.has(t)) {
    E.set(t, e);
    try {
      k && await m(null, "+", t);
    } catch (n) {
      console.warn(n), E.delete(t);
    }
  }
}
a(Ae, "registerType");
async function Ze(t) {
  if (E.has(t)) {
    try {
      k && await m(null, "-", t);
    } catch (e) {
      console.warn(e);
    }
    E.delete(t);
  }
}
a(Ze, "unregisterType");
async function Re(t) {
  const e = t[V];
  return e ? await e.call(t) : Object.getOwnPropertyNames(t).filter((n) => typeof t[n] == "function");
}
a(Re, "getMethods");
async function Pe(t, e, n, ...r) {
  if (n != null) {
    let s = t[n];
    if (s == null) {
      let l = (await Re(t)).find((c) => c.toLowerCase() == n.toLowerCase());
      l != null && (s = t[l]);
    }
    const o = {}[n];
    if (s == null || s === o)
      throw P.new(e, n);
    try {
      return await {
        async $RPC_MARKER_BEGIN$() {
          return await s.call(t, ...r);
        }
      }.$RPC_MARKER_BEGIN$();
    } catch (l) {
      throw b.wrapAndFreeze(l);
    }
  }
  const i = r.length == 0 ? null : r[0];
  switch (i) {
    case "M":
      return Re(t);
    default:
      throw K.new(e, i);
  }
}
a(Pe, "invoke");
class ye {
  static {
    a(this, "PendingCall");
  }
  [Symbol.toStringTag] = "PendingCall";
  finished = !1;
  promise;
  constructor(e, n) {
    try {
      throw new Error();
    } catch (r) {
      this.promise = new Promise((i, s) => {
        B.set(this, (o) => {
          B.delete(this), C.delete(this), this.finished = !0, i(o), ee(n);
        }), C.set(this, (o) => {
          B.delete(this), C.delete(this), this.finished = !0, s(o instanceof b ? o.unfreeze(r, e) : o), ee(n);
        });
      });
    }
  }
  catch(e) {
    return this.promise.catch(e);
  }
  finally(e) {
    return this.promise.finally(e);
  }
  then(e, n) {
    return this.promise.then(e, n);
  }
  sendMessage(...e) {
    return this;
  }
  addMessageListener(e) {
    return ie(this, e);
  }
  cancel() {
  }
  //overridden by callFunction and callLocal
  getCaller() {
    return Promise.resolve(v.prettyName);
  }
  //overridden by callFunction and callLocal
  [Symbol.asyncIterator]() {
    return re(this);
  }
}
function re(t) {
  let e = [], n = [];
  return t.promise.catch(() => {
  }), t.promise.finally(() => {
    for (let r of n)
      r({ done: !0, value: void 0 });
  }), t.addMessageListener((...r) => {
    (n.shift() ?? e.push)({ done: !1, value: r });
  }), {
    async next() {
      return t.finished ? { done: !0, value: void 0 } : e.shift() ?? await new Promise((r) => n.push(r));
    }
  };
}
a(re, "getAsyncIterator");
const B = /* @__PURE__ */ new WeakMap(), C = /* @__PURE__ */ new WeakMap(), I = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap();
function ie(t, e) {
  if (D.has(t))
    D.get(t).push(e);
  else {
    D.set(t, [e]);
    const n = I.get(t) ?? [];
    for (let r of n)
      try {
        e(...r);
      } catch (i) {
        console.warn("Error receiving pending: ", i);
      }
  }
  return t;
}
a(ie, "registerReceive");
function z(t, e) {
  if (!t.finished)
    if (D.has(t))
      for (let n of D.get(t))
        try {
          n(...e);
        } catch (r) {
          console.warn("Error receiving: ", r);
        }
    else
      I.has(t) ? I.set(t, [...I.get(t), e]) : I.set(t, [e]);
}
a(z, "runReceiveMessage");
let N = null;
function et(t, e) {
  const n = N;
  N = e;
  try {
    return t();
  } finally {
    N = n;
  }
}
a(et, "runWithContext");
function tt() {
  if (N == null)
    throw new Error("FunctionCallContext not available");
  return N;
}
a(tt, "getFunctionContext");
let nt = 0;
function m(t, e, ...n) {
  if (t != null) {
    const l = E.get(t);
    if (l)
      return ke(Pe.bind(null, l, t, e, ...n), t, e, n, 3);
  }
  const r = [], i = new ye(2, r), s = new $(), o = nt++;
  try {
    s.writeByte(Y.FunctionCall), s.writeLength(o), s.writeString(t), s.writeString(e), s.writeArray(n, (l) => s.writeDynamic(l, r));
  } catch (l) {
    return C.get(i)?.(l), i;
  }
  return k || t == null && U != null ? (i.sendMessage = (...l) => {
    if (i.finished)
      return i;
    const c = new $();
    c.writeByte(Y.MessageToExecutor), c.writeLength(o);
    const y = [];
    return c.writeArray(l, (u) => c.writeDynamic(u, y)), r.push(...y), j(c), i;
  }, i.cancel = () => {
    if (i.finished)
      return;
    const l = new $();
    l.writeByte(Y.FunctionCancel), l.writeLength(o), j(l);
  }, i.getCaller = () => m(null, "c", o), at(o, i, s), i) : (C.get(i)?.(L.new("Not connected")), i);
}
a(m, "callRemoteFunction");
function rt(t) {
  return ke(t, null, null, null, 3);
}
a(rt, "callLocal");
function ke(t, e, n, r, i) {
  const s = new ye(i, []), o = new AbortController(), l = {
    type: e,
    method: n,
    sendMessage: (...c) => (s.finished || z(s, c), l),
    get finished() {
      return s.finished;
    },
    promise: s,
    addMessageListener: (c) => ie(l, c),
    cancelToken: o.signal,
    cancelSelf: () => o.abort(),
    [Symbol.asyncIterator]: () => re(l)
  };
  return s.sendMessage = (...c) => (s.finished || z(l, c), s), s.cancel = () => s.finished || l.cancelSelf(), Fe(t, l, B.get(s), C.get(s), e, n, r), s;
}
a(ke, "callLocalFunction");
async function Fe(t, e, n, r, i, s, o) {
  try {
    let l;
    const c = N;
    N = e;
    try {
      l = await {
        async $RPC_MARKER_BEGIN$() {
          return await t();
        }
      }.$RPC_MARKER_BEGIN$();
    } finally {
      N = c;
    }
    n?.(await l);
  } catch (l) {
    r?.(b.wrapAndFreeze(l).append(i, s, o));
  }
}
a(Fe, "invokeForPromise");
const O = class extends (/* @__PURE__ */ a(function(n) {
  return Object.setPrototypeOf(n, new.target.prototype);
}, "Extendable")) {
  static {
    a(this, "RpcFunction2");
  }
  constructor(e, n) {
    super(m.bind(null, e, n)), this.type = e, this.method = n;
  }
  toString() {
    return `rpc (...params) => ${this.type ?? "null"}.${this.method}(...params)`;
  }
};
let it = Date.now();
const he = /* @__PURE__ */ new WeakMap();
function me(t) {
  if (t instanceof O)
    return t;
  const e = he.get(t);
  if (e != null)
    return new O("$" + _, e);
  const n = (it++).toString(16);
  pe[n] = t, he.set(t, n);
  const r = "$" + _;
  return new O(r, n);
}
a(me, "registerFunction");
function be(t) {
  const e = "$" + _;
  if (t.type != e)
    throw new Error("Can't unregister RemoteFunction, that was not registered locally");
  delete pe[t.method], he.delete(t);
}
a(be, "unregisterFunction");
const T = Symbol("RpcObjectType"), Z = Symbol("RpcObjectExists"), V = Symbol("RpcObjectGetMethods");
function se(t, e = new class {
  static {
    a(this, "RpcObject");
  }
  [T] = t;
}()) {
  const n = /* @__PURE__ */ new Map();
  return new Proxy(e, {
    get(r, i) {
      if (i == T)
        return t;
      if (i == Z)
        return () => m(null, "E", t);
      if (i == V)
        return () => m(t, null, "M");
      if (typeof i != "string" || i == "then")
        return e[i];
      if (n.has(i))
        return n.get(i);
      const s = new O(
        t,
        i
      );
      return n.set(i, s), s;
    },
    construct(r, i) {
      return new r(...i);
    },
    has(r, i) {
      return i == T || i == V || i == Z || i in e;
    }
  });
}
a(se, "createRemoteObject");
const Me = new Proxy({}, {
  get: (t, e) => typeof e == "string" ? se(e) : void 0,
  has: (t, e) => typeof e == "string" && e != "then"
}), Ie = [], Be = /* @__PURE__ */ new Map();
function ge(t, e) {
  let n = t.readLength();
  if (n < 0) {
    switch (n = -n, n % 4) {
      case 0:
        return e[n / 4];
      case 1:
        return new TextDecoder().decode(t.readBuffer((n - 1) / 4));
      case 2: {
        const r = {};
        e.push(r);
        for (let i = 0; i < (n - 2) / 4; i++) {
          const s = t.readString();
          r[s] = ge(t, e);
        }
        return r;
      }
      case 3: {
        const r = new Array((n - 3) / 4);
        e.push(r);
        for (let i = 0; i < r.length; i++)
          r[i] = ge(t, e);
        return r;
      }
    }
    throw new Error("Unreachable code reached");
  } else if (n >= 128) {
    const r = new TextDecoder().decode(t.readBuffer(n - 128)), i = Be.get(r);
    if (i)
      return i(t, e);
    throw new Error("Unknown data type: " + r);
  } else
    switch (String.fromCodePoint(n)) {
      case "n":
        return null;
      case "t":
        return !0;
      case "f":
        return !1;
      case "i":
        return t.readInt();
      case "d":
        return t.readDouble();
      case "l":
        return t.readLong();
      case "b":
        return t.readBuffer(t.readLength());
      case "D":
        return new Date(Number(t.readLong()));
      case "R": {
        const l = t.readString(), c = t.readByte();
        return new RegExp(
          l,
          "g" + (c & 1 ? "i" : "") + (c & 2 ? "m" : "")
        );
      }
      case "E":
        return t.readError();
      case "O":
        const r = t.readString();
        if (r == null)
          throw new Error("Type can't be null");
        return se(r);
      case "F":
        const i = t.readString();
        if (i == null)
          throw new Error("Type can't be null");
        const s = t.readString();
        if (s == null)
          throw new Error("Method can't be null");
        const o = new O(i, s);
        return e.push(o), o;
      default:
        throw new Error("Unknown data type number: " + n);
    }
}
a(ge, "readDynamic");
function we(t, e, n) {
  if (e == null)
    t.writeLength(110);
  else if (e === !0)
    t.writeLength(116);
  else if (e === !1)
    t.writeLength(102);
  else if (typeof e == "number" && (e | 0) === e)
    t.writeLength(105), t.writeInt(e);
  else if (typeof e == "number")
    t.writeLength(100), t.writeDouble(e);
  else if (typeof e == "bigint")
    t.writeLength(108), t.writeLong(e);
  else if (e instanceof Uint8Array)
    t.writeLength(98), t.writeLength(e.length), t.writeBuffer(e);
  else if (e instanceof Date)
    t.writeLength(68), t.writeLong(+e);
  else if (e instanceof RegExp) {
    t.writeLength(82), t.writeString(e.source);
    const r = e.flags;
    t.writeByte(
      (r.includes("i") ? 1 : 0) || (r.includes("m") ? 2 : 0)
    );
  } else if (e instanceof Error)
    t.writeLength(69), t.writeError(e);
  else if (typeof e == "object" && T in e)
    t.writeLength(79), t.writeString(e[T]);
  else if (typeof e == "function") {
    n.push(e), t.writeLength(70);
    let r;
    e instanceof O ? r = e : (r = me(e), De.set(e, () => be(r))), t.writeString(r.type), t.writeString(r.method);
  } else if (n.includes(e))
    t.writeLength(-(n.indexOf(e) * 4));
  else if (typeof e == "string") {
    const r = new TextEncoder().encode(e);
    t.writeLength(-(r.length * 4 + 1)), t.writeBytes(r);
  } else if (Array.isArray(e)) {
    n.push(e), t.writeLength(-(e.length * 4 + 3));
    for (let r of e)
      we(t, r, n);
  } else {
    for (let [r, i, s] of Ie) {
      if (!i(e))
        continue;
      const o = new TextEncoder().encode(r);
      t.writeLength(o.length + 128), t.writeBytes(o), s(t, e, n);
      return;
    }
    if (typeof e == "object") {
      n.push(e);
      const r = Object.entries(e);
      t.writeLength(-(r.length * 4 + 2));
      for (let [i, s] of r)
        t.writeString(i), we(t, s, n);
    } else
      throw new Error("Unknown type for " + e);
  }
}
a(we, "writeDynamic");
const De = /* @__PURE__ */ new WeakMap();
function ee(t) {
  for (let e of t)
    De.get(e)?.();
}
a(ee, "freeDynamic");
class $ {
  static {
    a(this, "DataOutput");
  }
  _buf;
  _data;
  _count = 0;
  constructor(e = 32) {
    this._buf = typeof e == "number" ? new Uint8Array(e) : e, this._data = new DataView(this._buf.buffer);
  }
  ensureCapacity(e) {
    if (e += this._count, e > this._buf.byteLength) {
      let n = new Uint8Array(Math.max(this._buf.byteLength * 2, e));
      this._data = new DataView(n.buffer), n.set(this._buf), this._buf = n;
    }
  }
  writeByte(e) {
    this.ensureCapacity(1), this._buf[this._count] = e, this._count++;
  }
  writeBytes(e) {
    this.ensureCapacity(e.length), this._buf.set(e, this._count), this._count += e.length;
  }
  writeBuffer(e) {
    this.writeBytes(e);
  }
  writeBoolean(e) {
    this.writeByte(e ? 1 : 0);
  }
  writeNullBoolean(e) {
    this.writeByte(e == null ? 2 : e ? 1 : 0);
  }
  writeShort(e) {
    this.ensureCapacity(2), this._data.setInt16(this._count, e), this._count += 2;
  }
  writeChar(e) {
    this.writeShort(e.charCodeAt(0));
  }
  writeInt(e) {
    this.ensureCapacity(4), this._data.setInt32(this._count, e), this._count += 4;
  }
  writeLong(e) {
    typeof e == "number" ? (this.writeInt(e / 2 ** 32), this.writeInt(e % 2 ** 32)) : (this.writeInt(Number(e / BigInt(2 ** 32))), this.writeInt(Number(e % BigInt(2 ** 32))));
  }
  writeFloat(e) {
    this.ensureCapacity(4), this._data.setFloat32(this._count, e), this._count += 4;
  }
  writeDouble(e) {
    this.ensureCapacity(8), this._data.setFloat64(this._count, e), this._count += 8;
  }
  writeString(e) {
    if (e == null) {
      this.writeLength(-1);
      return;
    }
    let n = new TextEncoder().encode(e);
    this.writeLength(n.length), this.writeBytes(n);
  }
  writeLength(e) {
    let n = (e < 0 ? ~e : e) >>> 0;
    for (; n >= 128; )
      this.writeByte(n | 128), n >>= 7;
    e < 0 ? (this.writeByte(n | 128), this.writeByte(0)) : this.writeByte(n);
  }
  writeByteArray(e) {
    e ? (this.writeLength(e.length), this.writeBytes(e)) : this.writeLength(-1);
  }
  writeArray(e, n) {
    if (!e)
      this.writeLength(-1);
    else {
      this.writeLength(e.length);
      for (let r = 0; r < e.length; r++)
        n.call(this, e[r]);
    }
  }
  toBuffer(e = 0) {
    return this._buf.slice(e, this._count - e);
  }
  writeError(e) {
    try {
      throw b.wrapAndFreeze(e);
    } catch (n) {
      n.write(this);
    }
  }
  writeDynamic(e, n = []) {
    we(this, e, n);
  }
}
const S = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Map();
function st(t) {
  for (let e of S.values())
    C.get(e)?.(t);
  S.clear();
  for (let e of F.values())
    e.cancelSelf();
}
a(st, "disposeConnection");
function j(t) {
  if (U == null)
    throw L.new("Not connected");
  U.send(t.toBuffer());
}
a(j, "sendRaw");
function at(t, e, n) {
  S.set(t, e);
  try {
    j(n);
  } catch (r) {
    C.get(e)?.(r);
  }
}
a(at, "sendCall");
var Y = /* @__PURE__ */ ((t) => (t[t.FunctionCall = 0] = "FunctionCall", t[t.FunctionSuccess = 1] = "FunctionSuccess", t[t.FunctionError = 2] = "FunctionError", t[t.FunctionCancel = 3] = "FunctionCancel", t[t.MessageToExecutor = 4] = "MessageToExecutor", t[t.MessageToCaller = 5] = "MessageToCaller", t))(Y || {});
async function ot(t) {
  try {
    switch (t.readByte()) {
      case 0: {
        const n = t.readLength(), r = [];
        let i = !1, s = null, o = null;
        const l = new Promise((c, y) => {
          s = /* @__PURE__ */ a((u) => {
            c(u), i = !0;
            const h = new $();
            h.writeByte(
              1
              /* FunctionSuccess */
            ), h.writeLength(n), h.writeDynamic(u), j(h), F.delete(n), ee(r);
          }, "resolve"), o = /* @__PURE__ */ a((u) => {
            y(u), i = !0;
            const h = new $();
            h.writeByte(
              2
              /* FunctionError */
            ), h.writeLength(n), h.writeError(u), j(h), F.delete(n), ee(r);
          }, "reject");
        });
        l.catch(() => {
        });
        try {
          const c = t.readString();
          if (c == null)
            throw A.new(null);
          const y = E.get(c);
          if (!y)
            throw A.new(c);
          const u = t.readString(), h = t.readArray(() => t.readDynamic(r)) ?? [], g = new AbortController(), w = {
            type: c,
            method: u,
            get finished() {
              return i;
            },
            promise: l,
            sendMessage(...p) {
              if (i)
                return w;
              const f = new $();
              f.writeByte(
                5
                /* MessageToCaller */
              ), f.writeLength(n);
              const d = [];
              return f.writeArray(p, (R) => f.writeDynamic(R, d)), r.push(...d), j(f), w;
            },
            addMessageListener(p) {
              return ie(w, p), w;
            },
            cancelToken: g.signal,
            cancelSelf: () => g.abort(),
            [Symbol.asyncIterator]: () => re(w)
          };
          F.set(n, w), await Fe(Pe.bind(null, y, c, u, ...h), w, s, o, c, u, h);
        } catch (c) {
          o(c);
        }
        break;
      }
      case 1: {
        const n = t.readLength(), r = S.get(n);
        if (r == null) {
          console.warn(`${v.prettyName} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          B.get(r)?.(t.readDynamic());
        } catch (i) {
          C.get(r)?.(i);
        } finally {
          S.delete(n);
        }
        break;
      }
      case 2: {
        const n = t.readLength(), r = S.get(n);
        if (r == null) {
          console.warn(`${v.prettyName} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          throw t.readError();
        } catch (i) {
          C.get(r)?.(i);
        } finally {
          S.delete(n);
        }
        break;
      }
      case 3: {
        const n = t.readLength();
        let r = F.get(n);
        if (!r) {
          console.warn(`${v.prettyName} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        r.cancelSelf();
        break;
      }
      case 4: {
        const n = t.readLength();
        let r = F.get(n);
        if (!r) {
          console.warn(`${v.prettyName} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        const i = [], s = t.readArray(() => t.readDynamic(i)) ?? [];
        z(r, s);
        break;
      }
      case 5: {
        const n = t.readLength();
        let r = S.get(n);
        if (!r) {
          console.warn(`${v.prettyName} has no ActiveRequest with id: ${n}`);
          break;
        }
        const i = [], s = t.readArray(() => t.readDynamic(i)) ?? [];
        z(r, s);
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
}
a(ot, "receiveRpc");
class je {
  static {
    a(this, "DataInput");
  }
  _buf;
  _data;
  _pos;
  _count;
  constructor(e, n = 0, r = e.length) {
    this._buf = e, this._data = new DataView(e.buffer), this._pos = n, this._count = n + r;
  }
  readFully(e, n = 0, r = e.length) {
    let i = this._pos;
    if (this._count - i < r)
      throw new RangeError("not enough bytes available to use readFully");
    for (let o = n; o < n + r; o++)
      e[o] = this._buf[i++];
    this._pos = i;
  }
  skip(e) {
    let n = this.available();
    return e < n && (n = e < 0 ? 0 : e), this._pos += n, n;
  }
  available() {
    return this._count - this._pos;
  }
  readAll() {
    return this._buf.slice(this._pos, this._pos = this._count);
  }
  readBuffer(e) {
    if (e > this.available())
      throw new RangeError();
    return this._buf.slice(this._pos, this._pos += e);
  }
  readByte() {
    return this._data.getUint8(this._pos++);
  }
  readBoolean() {
    return this.readByte() != 0;
  }
  readNullBoolean() {
    const e = this.readByte();
    return e < 2 ? e == 1 : null;
  }
  readShort() {
    const e = this._data.getInt16(this._pos);
    return this._pos += 2, e;
  }
  readUShort() {
    const e = this._data.getUint16(this._pos);
    return this._pos += 2, e;
  }
  readChar() {
    return String.fromCharCode(this.readUShort());
  }
  readInt() {
    const e = this._data.getInt32(this._pos);
    return this._pos += 4, e;
  }
  readLong() {
    return BigInt(this.readInt()) * BigInt(2 ** 32) + BigInt(this.readInt() >>> 0);
  }
  readFloat() {
    const e = this._data.getFloat32(this._pos);
    return this._pos += 4, e;
  }
  readDouble() {
    const e = this._data.getFloat64(this._pos);
    return this._pos += 8, e;
  }
  readString() {
    let e = this.readLength();
    return e == -1 ? null : new TextDecoder().decode(this.readBuffer(e));
  }
  readLength() {
    let e = 0, n = 0;
    for (; ; ) {
      const r = this.readByte();
      if (r == 0)
        return n == 0 ? 0 : ~e;
      if (!(r & 128))
        return e |= r << n, e;
      e |= (r & 127) << n, n += 7;
    }
  }
  readArray(e) {
    const n = this.readLength();
    if (n == -1)
      return null;
    const r = [];
    for (let i = 0; i < n; i++)
      r[i] = e.call(this);
    return r;
  }
  readError() {
    return b.read(this);
  }
  readDynamic(e = []) {
    return ge(this, e);
  }
}
let k = !1, ve, de, te = new Promise((t, e) => [ve, de] = [t, e]);
te.catch(() => {
});
async function ct() {
  for (; ; )
    if (await te.then(() => !0, () => !1))
      return;
}
a(ct, "waitConnected");
let M;
if (Te) {
  const t = "RPC_URL" in globalThis ? globalThis.RPC_URL : process.env.RPC_URL, e = "RPC_TOKEN" in globalThis ? globalThis.RPC_TOKEN : process.env.RPC_TOKEN;
  t ? M = /* @__PURE__ */ a(async (n) => {
    const r = new URL(t);
    r.search = n.toString();
    const i = "require" in globalThis ? globalThis.require("ws") : (await import("ws")).WebSocket;
    return new i(r, e == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + e
      }
    });
  }, "createWebSocket") : (console.warn("RPC_URL is not defined => RPC will not connect"), M = /* @__PURE__ */ a(async () => ({}), "createWebSocket"));
} else if ("document" in globalThis)
  M = /* @__PURE__ */ a(async (t) => new WebSocket("ws" + document.location.origin.substring(4) + "/rpc?" + t), "createWebSocket");
else {
  const t = "RPC_URL" in globalThis ? globalThis.RPC_URL : process.env.RPC_URL, e = "RPC_TOKEN" in globalThis ? globalThis.RPC_TOKEN : process.env.RPC_TOKEN;
  t ? M = /* @__PURE__ */ a(async (n) => {
    const r = new URL(t);
    return r.search = n.toString(), new WebSocket(r, e == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + e
      }
    });
  }, "createWebSocket") : (console.warn("RPC_URL is not defined => RPC will not connect"), M = /* @__PURE__ */ a(async () => ({}), "createWebSocket"));
}
function Se(t) {
  const e = de;
  te = new Promise((n, r) => [ve, de] = [n, r]), te.catch(() => {
  }), e(t), st(t);
}
a(Se, "closeRpc");
let U = null;
async function lt(t) {
  let e = x, n = /* @__PURE__ */ new Set();
  const r = new URLSearchParams();
  r.set("id", _), n.add("$" + _), e != null && r.set("name", e);
  for (let s of E.keys())
    n.has(s) || (n.add(s), r.append("type", s));
  const i = await M(r);
  i.onclose = () => {
    setTimeout(t, 1e3), U && (U = null, k = !1, console.log("Reconnecting to RPC"), Se(L.new("Connection closed by " + v.prettyName)));
  }, i.onopen = async () => {
    console.log("Connected to RPC");
    try {
      U = i;
      const s = new Set(E.keys()), o = new Set(n);
      for (let l of s)
        o.delete(l) && s.delete(l);
      s.size || o.size ? x != e ? await m(null, "H", x, [...s.keys()], [...o.keys()]) : await m(null, "H", [...s.keys()], [...o.keys()]) : x != e && await m(null, "H", x), k = !0, ve();
    } catch (s) {
      console.error("Error registering types: ", s), Se(s), i?.close(4e3, "Error registering types");
      return;
    }
  }, i.binaryType = "arraybuffer", i.onmessage = (s) => {
    const o = s.data;
    typeof o == "string" ? console.log(o) : ot(new je(new Uint8Array(o)));
  };
}
a(lt, "connectOnce");
(/* @__PURE__ */ a(async function() {
  for (await Promise.resolve(); ; )
    await new Promise(
      (e) => lt(e)
    );
}, "connectLoop"))();
let x = null;
async function ut(t) {
  x = t;
  try {
    k && await m(null, "N", t);
  } catch (e) {
    console.error(e);
  }
}
a(ut, "setName");
function ft(t) {
  return function(e) {
    Ie.push([t, (n) => n instanceof e, (n, r, i) => r.write(n, i)]), Be.set(t, (n, r) => e.read(n, r));
  };
}
a(ft, "CustomDynamicType");
function ht(t) {
  return function(e) {
    Ae(t ?? e.prototype.constructor.name, e).catch(console.error);
  };
}
a(ht, "RpcProvider");
Promise.resolve().then(() => gt).then((t) => Object.assign(globalThis, t));
class v {
  //Rpc
  static id = _;
  static get prettyName() {
    return v.name != null ? `${v.name} (${v.id})` : v.id;
  }
  static get name() {
    return x;
  }
  static setName = ut;
  //Connection
  static get isConnected() {
    return k;
  }
  static get waitUntilConnected() {
    return ct();
  }
  //Functions
  static createObject = se;
  static createFunction = (e, n) => new O(e, n);
  static registerFunction = me;
  static unregisterFunction = be;
  static callLocal = rt;
  //Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
  static callFunction = m;
  //Call remote function
  static getContext = tt;
  static runWithContext = et;
  //Types
  static registerType = Ae;
  static unregisterType = Ze;
  static generateTypeName = Ye;
  static getObjectWithFallback = async (e, ...n) => await m("Rpc", "getObjectWithFallback", e, ...n);
  static checkTypes = async (...e) => await m("Rpc", "checkTypes", ...e);
  static checkType = async (e) => await m("Rpc", "checkType", e);
  static getAllTypes = async () => await m("Rpc", "getAllTypes");
  static getAllConnections = async () => await m("Rpc", "getAllConnections");
  static getRegistrations = async (e = !1) => await m("Rpc", "getRegistrations", e);
  static evalObject = async (e) => await m("Rpc", "evalObject", e);
  static evalString = async (e) => await m("Rpc", "evalString", e);
  static listenCalls = () => m("Rpc", "listenCalls");
  static root = Me;
  static type = T;
  static exists = Z;
  static getMethods = V;
}
const gt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CustomDynamicType: ft,
  DataInput: je,
  DataOutput: $,
  PendingCall: ye,
  RPC_ROOT: Me,
  Rpc: v,
  RpcCallError: J,
  get RpcConnectionError() {
    return L;
  },
  RpcCustomError: W,
  RpcError: b,
  get RpcEvalError() {
    return fe;
  },
  RpcFunction: O,
  get RpcMetaMethodNotFoundError() {
    return K;
  },
  get RpcMethodNotFoundError() {
    return P;
  },
  RpcObjectExists: Z,
  RpcObjectGetMethods: V,
  RpcObjectType: T,
  RpcProvider: ht,
  get RpcTypeNotFoundError() {
    return A;
  },
  createRemoteObject: se,
  getAsyncIterator: re,
  listenersMap: D,
  pendingMap: I,
  registerFunction: me,
  registerReceive: ie,
  rejectCall: C,
  resolveCall: B,
  runReceiveMessage: z,
  unregisterFunction: be
}, Symbol.toStringTag, { value: "Module" }));
export {
  ft as CustomDynamicType,
  je as DataInput,
  $ as DataOutput,
  ye as PendingCall,
  Me as RPC_ROOT,
  v as Rpc,
  J as RpcCallError,
  L as RpcConnectionError,
  W as RpcCustomError,
  b as RpcError,
  fe as RpcEvalError,
  O as RpcFunction,
  K as RpcMetaMethodNotFoundError,
  P as RpcMethodNotFoundError,
  Z as RpcObjectExists,
  V as RpcObjectGetMethods,
  T as RpcObjectType,
  ht as RpcProvider,
  A as RpcTypeNotFoundError,
  se as createRemoteObject,
  re as getAsyncIterator,
  D as listenersMap,
  I as pendingMap,
  me as registerFunction,
  ie as registerReceive,
  C as rejectCall,
  B as resolveCall,
  z as runReceiveMessage,
  be as unregisterFunction
};
//# sourceMappingURL=rpc.js.map
