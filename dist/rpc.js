var Ve = Object.defineProperty;
var a = (t, e) => Ve(t, "name", { value: e, configurable: !0 });
const le = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
function I(t) {
  return function(e) {
    const [r, n] = le;
    r.set(t, e), n.set(e, t);
  };
}
a(I, "RpcCustomError");
var Oe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function He(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
a(He, "getDefaultExportFromCjs");
var Le = { exports: {} }, ce = { exports: {} }, _e;
function Je() {
  return _e || (_e = 1, function(t, e) {
    (function(r, n) {
      t.exports = n();
    })(Oe, function() {
      function r(f) {
        return !isNaN(parseFloat(f)) && isFinite(f);
      }
      a(r, "_isNumber");
      function n(f) {
        return f.charAt(0).toUpperCase() + f.substring(1);
      }
      a(n, "_capitalize");
      function s(f) {
        return function() {
          return this[f];
        };
      }
      a(s, "_getter");
      var i = ["isConstructor", "isEval", "isNative", "isToplevel"], c = ["columnNumber", "lineNumber"], l = ["fileName", "functionName", "source"], o = ["args"], y = ["evalOrigin"], u = i.concat(c, l, o, y);
      function h(f) {
        if (f)
          for (var d = 0; d < u.length; d++)
            f[u[d]] !== void 0 && this["set" + n(u[d])](f[u[d]]);
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
          var f = this.getFileName() || "", d = this.getLineNumber() || "", C = this.getColumnNumber() || "", J = this.getFunctionName() || "";
          return this.getIsEval() ? f ? "[eval] (" + f + ":" + d + ":" + C + ")" : "[eval]:" + d + ":" + C : J ? J + " (" + f + ":" + d + ":" + C + ")" : f + ":" + d + ":" + C;
        }
      }, h.fromString = /* @__PURE__ */ a(function(d) {
        var C = d.indexOf("("), J = d.lastIndexOf(")"), Ke = d.substring(0, C), We = d.substring(C + 1, J).split(","), Ee = d.substring(J + 1);
        if (Ee.indexOf("@") === 0)
          var oe = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(Ee, ""), qe = oe[1], Ge = oe[2], ze = oe[3];
        return new h({
          functionName: Ke,
          args: We || void 0,
          fileName: qe,
          lineNumber: Ge || void 0,
          columnNumber: ze || void 0
        });
      }, "StackFrame$$fromString");
      for (var g = 0; g < i.length; g++)
        h.prototype["get" + n(i[g])] = s(i[g]), h.prototype["set" + n(i[g])] = /* @__PURE__ */ function(f) {
          return function(d) {
            this[f] = !!d;
          };
        }(i[g]);
      for (var w = 0; w < c.length; w++)
        h.prototype["get" + n(c[w])] = s(c[w]), h.prototype["set" + n(c[w])] = /* @__PURE__ */ function(f) {
          return function(d) {
            if (!r(d))
              throw new TypeError(f + " must be a Number");
            this[f] = Number(d);
          };
        }(c[w]);
      for (var p = 0; p < l.length; p++)
        h.prototype["get" + n(l[p])] = s(l[p]), h.prototype["set" + n(l[p])] = /* @__PURE__ */ function(f) {
          return function(d) {
            this[f] = String(d);
          };
        }(l[p]);
      return h;
    });
  }(ce)), ce.exports;
}
a(Je, "requireStackframe");
(function(t, e) {
  (function(r, n) {
    t.exports = n(Je());
  })(Oe, /* @__PURE__ */ a(function(n) {
    var s = /(^|@)\S+:\d+/, i = /^\s*at .*(\S+:\d+|\(native\))/m, c = /^(eval@)?(\[native code])?$/;
    return {
      /**
       * Given an Error object, extract the most information from it.
       *
       * @param {Error} error object
       * @return {Array} of StackFrames
       */
      parse: /* @__PURE__ */ a(function(o) {
        if (typeof o.stacktrace < "u" || typeof o["opera#sourceloc"] < "u")
          return this.parseOpera(o);
        if (o.stack && o.stack.match(i))
          return this.parseV8OrIE(o);
        if (o.stack)
          return this.parseFFOrSafari(o);
        throw new Error("Cannot parse given Error object");
      }, "ErrorStackParser$$parse"),
      // Separate line and column numbers from a string of the form: (URI:Line:Column)
      extractLocation: /* @__PURE__ */ a(function(o) {
        if (o.indexOf(":") === -1)
          return [o];
        var y = /(.+?)(?::(\d+))?(?::(\d+))?$/, u = y.exec(o.replace(/[()]/g, ""));
        return [u[1], u[2] || void 0, u[3] || void 0];
      }, "ErrorStackParser$$extractLocation"),
      parseV8OrIE: /* @__PURE__ */ a(function(o) {
        var y = o.stack.split(`
`).filter(function(u) {
          return !!u.match(i);
        }, this);
        return y.map(function(u) {
          u.indexOf("(eval ") > -1 && (u = u.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, ""));
          var h = u.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, ""), g = h.match(/ (\(.+\)$)/);
          h = g ? h.replace(g[0], "") : h;
          var w = this.extractLocation(g ? g[1] : h), p = g && h || void 0, f = ["eval", "<anonymous>"].indexOf(w[0]) > -1 ? void 0 : w[0];
          return new n({
            functionName: p,
            fileName: f,
            lineNumber: w[1],
            columnNumber: w[2],
            source: u
          });
        }, this);
      }, "ErrorStackParser$$parseV8OrIE"),
      parseFFOrSafari: /* @__PURE__ */ a(function(o) {
        var y = o.stack.split(`
`).filter(function(u) {
          return !u.match(c);
        }, this);
        return y.map(function(u) {
          if (u.indexOf(" > eval") > -1 && (u = u.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1")), u.indexOf("@") === -1 && u.indexOf(":") === -1)
            return new n({
              functionName: u
            });
          var h = /((.*".+"[^@]*)?[^@]*)(?:@)/, g = u.match(h), w = g && g[1] ? g[1] : void 0, p = this.extractLocation(u.replace(h, ""));
          return new n({
            functionName: w,
            fileName: p[0],
            lineNumber: p[1],
            columnNumber: p[2],
            source: u
          });
        }, this);
      }, "ErrorStackParser$$parseFFOrSafari"),
      parseOpera: /* @__PURE__ */ a(function(o) {
        return !o.stacktrace || o.message.indexOf(`
`) > -1 && o.message.split(`
`).length > o.stacktrace.split(`
`).length ? this.parseOpera9(o) : o.stack ? this.parseOpera11(o) : this.parseOpera10(o);
      }, "ErrorStackParser$$parseOpera"),
      parseOpera9: /* @__PURE__ */ a(function(o) {
        for (var y = /Line (\d+).*script (?:in )?(\S+)/i, u = o.message.split(`
`), h = [], g = 2, w = u.length; g < w; g += 2) {
          var p = y.exec(u[g]);
          p && h.push(new n({
            fileName: p[2],
            lineNumber: p[1],
            source: u[g]
          }));
        }
        return h;
      }, "ErrorStackParser$$parseOpera9"),
      parseOpera10: /* @__PURE__ */ a(function(o) {
        for (var y = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i, u = o.stacktrace.split(`
`), h = [], g = 0, w = u.length; g < w; g += 2) {
          var p = y.exec(u[g]);
          p && h.push(
            new n({
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
      parseOpera11: /* @__PURE__ */ a(function(o) {
        var y = o.stack.split(`
`).filter(function(u) {
          return !!u.match(s) && !u.match(/^Error created at/);
        }, this);
        return y.map(function(u) {
          var h = u.split("@"), g = this.extractLocation(h.pop()), w = h.shift() || "", p = w.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0, f;
          w.match(/\(([^)]*)\)/) && (f = w.replace(/^[^(]+\(([^)]*)\)$/, "$1"));
          var d = f === void 0 || f === "[arguments not available]" ? void 0 : f.split(",");
          return new n({
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
})(Le);
var Xe = Le.exports;
const te = /* @__PURE__ */ He(Xe);
function ue(t) {
  return t.replaceAll("\r", "").replaceAll(/^\n+|\n+$/g, "").replaceAll(/^  +/gm, "	");
}
a(ue, "fixString");
function re(t) {
  let e = "";
  for (let r of t) {
    if (r.functionName?.includes("$RPC_MARKER_BEGIN$"))
      break;
    e += `
	at ` + r;
  }
  return e;
}
a(re, "framesToString");
function xe(t) {
  return t === void 0 ? "" : t instanceof b ? `
caused by: ` + t.toString() : t instanceof Error ? `
caused by: ` + ue(t.toString()) + re(te.parse(t)) + xe(t.cause) : `
caused by: ` + ue(t?.toString() ?? "null");
}
a(xe, "causeToString");
function $e(t, e) {
  return (t === b || $e(t.__proto__, e)) && e[0].functionName?.replace(/^new /, "") === t.name ? (e.shift(), !0) : !1;
}
a($e, "removeFromStackTrace");
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
    return e += re(this.#t), e += this.#n, e.replaceAll(/^\n+/g, "");
  }
  #e = "";
  #r = !1;
  #n = "";
  constructor(...e) {
    let r = null, n = null, s = null, i = {}, c;
    switch (e.length) {
      case 1:
        [n] = e;
        break;
      case 2:
        [n, c] = e;
        break;
      case 4:
        [n, r, n, s] = e;
        break;
      case 5:
        e[4] instanceof b ? [n, r, n, s, c] = e : [n, r, n, s, i] = e;
        break;
      case 6:
        [n, r, n, s, i, c] = e;
        break;
      default:
        throw new Error("Invalid arg count");
    }
    c != null ? super(n ?? void 0, { cause: c }) : super(n ?? void 0), this.name = this.constructor.name, this.from = r ?? S.prettyName;
    const l = le[1].get(this.constructor);
    if (l != null && (this.data.$type = l), Object.assign(this.data, i ?? {}), s == null)
      this.#r = !0, this.#t = te.parse(this), $e(this.constructor, this.#t);
    else {
      this.#e = `
` + ue(s);
      const o = this.#e.indexOf(`
caused by: `);
      o != -1 && (this.#n += this.#e.substring(o), this.#e = this.#e.substring(0, o));
    }
    this.#n += xe(c), this.stack = this.toString();
  }
  toString() {
    let e = this.name + "(" + this.from + ")";
    this.message?.trim() && (e += ": " + this.message);
    const r = this.stackTrace;
    return r?.trim() && (e += `
` + r), e;
  }
  write(e) {
    e.writeString(this.name), e.writeString(this.from), e.writeString(this.message), e.writeString(this.stackTrace), e.writeString(Object.keys(this.data).length == 0 ? null : JSON.stringify(this.data));
  }
  static read(e) {
    const r = e.readString(), n = e.readString() ?? "???", s = e.readString(), i = e.readString() ?? "";
    let c;
    try {
      c = JSON.parse(e.readString() ?? "null");
    } catch (l) {
      if (l instanceof RangeError)
        c = { $info: "JsonData was not included, due to an old PlayifyRpc version" };
      else
        throw l;
    }
    return b.create(r, n, s, i, c);
  }
  static create(e, r, n, s, i) {
    const c = i?.$type, l = le[0].get(c) ?? b;
    return new l(e, r, n, s, i);
  }
  static wrapAndFreeze(e) {
    return e instanceof b ? (e.#r && (e.#r = !1, e.#e += re(e.#t), e.#t = [], e.stack = e.toString()), e) : new b(
      e.name,
      e instanceof b ? e.from : null,
      e.message,
      re(te.parse(e)).substring(1),
      {},
      e.cause
    );
  }
  unfreeze(e, r) {
    return this.#r ? this : (this.#r = !0, this.#t = te.parse(e).slice(r), this.stack = this.toString(), this);
  }
  trashLocalStack() {
    return this.#r = !1, this.#t = [], this.stack = this.toString(), this;
  }
  append(e, r, n) {
    return this.#e += `
	rpc ` + (n == null ? "<<callLocal>>" : (e ?? "<<null>>") + "." + (r ?? "<<null>>") + "(" + n.map((s) => JSON.stringify(s)).join(",") + ")"), this.stack = this.toString(), this;
  }
}
const Te = globalThis?.process?.versions?.node != null, Ce = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", fe = /* @__PURE__ */ a(() => Date.now().toString(36) + Array(10).fill(void 0).map(() => Ce[Math.floor(Math.random() * Ce.length)]).join(""), "randomId");
let v;
if (Te)
  try {
    process?.versions.bun ? v = "bun@" + require("os").hostname() + "@" + process.pid : v = "node@" + process.binding("os").getHostname() + "@" + process.pid;
  } catch {
    v = "node-alternative@" + process.platform + ":" + process.arch + "@" + process.pid;
  }
else
  "document" in globalThis ? v = "web@" + document.location + "#" + fe() : v = "js@" + fe();
var Pe = Object.defineProperty, Qe = Object.getOwnPropertyDescriptor, Ye = /* @__PURE__ */ a((t, e, r) => e in t ? Pe(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, "__defNormalProp"), H = /* @__PURE__ */ a((t, e, r, n) => {
  for (var s = n > 1 ? void 0 : n ? Qe(e, r) : e, i = t.length - 1, c; i >= 0; i--)
    (c = t[i]) && (s = (n ? c(e, r, s) : c(s)) || s);
  return n && s && Pe(e, r, s), s;
}, "__decorateClass"), Z = /* @__PURE__ */ a((t, e, r) => (Ye(t, typeof e != "symbol" ? e + "" : e, r), r), "__publicField");
const X = /* @__PURE__ */ a((t) => t == null ? "null" : '"' + t + '"', "quoted");
class ee extends b {
  static {
    a(this, "RpcCallError");
  }
}
let A = class extends ee {
  static {
    a(this, "RpcTypeNotFoundError");
  }
};
Z(A, "new", (t) => new A(
  null,
  null,
  `Type ${X(t)} does not exist`,
  "",
  { type: t }
));
A = H([
  I("$type")
], A);
let F = class extends ee {
  static {
    a(this, "RpcMethodNotFoundError");
  }
};
Z(F, "new", (t, e) => new F(
  null,
  null,
  `Method ${X(e)} does not exist on type ${X(t)}`,
  "",
  { type: t, method: e }
));
F = H([
  I("$method")
], F);
let z = class extends F {
  static {
    a(this, "RpcMetaMethodNotFoundError");
  }
};
Z(z, "new", (t, e) => new z(
  null,
  null,
  `Meta-Method ${X(e)} does not exist on type ${X(t)}`,
  "",
  { type: t, method: null, meta: e }
));
z = H([
  I("$method-meta")
], z);
let T = class extends ee {
  static {
    a(this, "RpcConnectionError");
  }
};
Z(T, "new", (t) => new T(null, null, t, ""));
T = H([
  I("$connection")
], T);
let he = class extends ee {
  static {
    a(this, "RpcEvalError");
  }
};
he = H([
  I("$eval")
], he);
let O = class extends b {
  static {
    a(this, "RpcDataError");
  }
};
Z(O, "new", (t, e) => new O(null, null, t, "", e));
O = H([
  I("$data")
], O);
const ye = /* @__PURE__ */ Object.create(null), _ = /* @__PURE__ */ new Map();
_.set("$" + v, ye);
async function Ze() {
  return "$" + v + "$" + fe();
}
a(Ze, "generateTypeName");
async function ke(t, e) {
  if (!_.has(t)) {
    _.set(t, e);
    try {
      M && await m(null, "+", t);
    } catch (r) {
      console.error(`[Rpc] Error registering type "${t}":`, r), _.delete(t);
    }
  }
}
a(ke, "registerType");
async function et(t) {
  if (_.has(t)) {
    try {
      M && await m(null, "-", t);
    } catch (e) {
      console.error(`[Rpc] Error unregistering type "${t}":`, e);
    }
    _.delete(t);
  }
}
a(et, "unregisterType");
async function Se(t) {
  const e = t[V];
  return e ? await e.call(t) : Object.getOwnPropertyNames(t).filter((r) => typeof t[r] == "function");
}
a(Se, "getMethods");
async function Ae(t, e, r, ...n) {
  if (r != null) {
    let i = t[r];
    if (i == null) {
      let l = (await Se(t)).find((o) => o.toLowerCase() == r.toLowerCase());
      l != null && (i = t[l]);
    }
    const c = {}[r];
    if (i == null || i === c)
      throw F.new(e, r);
    try {
      return await {
        async $RPC_MARKER_BEGIN$() {
          return await i.call(t, ...n);
        }
      }.$RPC_MARKER_BEGIN$();
    } catch (l) {
      throw b.wrapAndFreeze(l);
    }
  }
  const s = n.length == 0 ? null : n[0];
  switch (s) {
    case "M":
      return Se(t);
    default:
      throw z.new(e, s);
  }
}
a(Ae, "invoke");
class me {
  static {
    a(this, "PendingCall");
  }
  [Symbol.toStringTag] = "PendingCall";
  finished = !1;
  promise;
  constructor(e, r) {
    try {
      throw new Error();
    } catch (n) {
      this.promise = new Promise((s, i) => {
        U.set(this, (c) => {
          U.delete(this), E.delete(this), this.finished = !0, s(c), ne(r);
        }), E.set(this, (c) => {
          U.delete(this), E.delete(this), this.finished = !0, i(c instanceof b ? c.unfreeze(n, e) : c), ne(r);
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
  then(e, r) {
    return this.promise.then(e, r);
  }
  sendMessage(...e) {
    return this;
  }
  addMessageListener(e) {
    return ae(this, e);
  }
  cancel() {
  }
  //overridden by callFunction and callLocal
  getCaller() {
    return Promise.resolve(S.prettyName);
  }
  //overridden by callFunction and callLocal
  [Symbol.asyncIterator]() {
    return ie(this);
  }
}
function ie(t) {
  let e = [], r = [];
  return t.promise.catch(() => {
  }), t.promise.finally(() => {
    for (let n of r)
      n({ done: !0, value: void 0 });
  }), t.addMessageListener((...n) => {
    (r.shift() ?? e.push)({ done: !1, value: n });
  }), {
    async next() {
      return t.finished ? { done: !0, value: void 0 } : e.shift() ?? await new Promise((n) => r.push(n));
    }
  };
}
a(ie, "getAsyncIterator");
const U = /* @__PURE__ */ new WeakMap(), E = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap(), K = /* @__PURE__ */ new WeakMap();
function ae(t, e) {
  if (K.has(t))
    K.get(t).push(e);
  else {
    K.set(t, [e]);
    const r = j.get(t) ?? [];
    for (let n of r)
      try {
        e(...n);
      } catch (s) {
        console.warn("[Rpc] Error while handling pending message:", s);
      }
  }
  return t;
}
a(ae, "registerReceive");
function Q(t, e) {
  if (!t.finished)
    if (K.has(t))
      for (let r of K.get(t))
        try {
          r(...e);
        } catch (n) {
          console.warn("[Rpc] Error while receiving message:", n);
        }
    else
      j.has(t) ? j.set(t, [...j.get(t), e]) : j.set(t, [e]);
}
a(Q, "runReceiveMessage");
let L = null;
function tt(t, e) {
  const r = L;
  L = e;
  try {
    return t();
  } finally {
    L = r;
  }
}
a(tt, "runWithContext");
function rt() {
  if (L == null)
    throw new Error("FunctionCallContext not available");
  return L;
}
a(rt, "getFunctionContext");
let nt = 0;
function m(t, e, ...r) {
  if (t != null) {
    const l = _.get(t);
    if (l)
      return Fe(Ae.bind(null, l, t, e, ...r), t, e, r, 3);
  }
  const n = [], s = new me(2, n), i = new k(), c = nt++;
  try {
    i.writeByte(R.FunctionCall), i.writeLength(c), i.writeString(t), i.writeString(e), i.writeArray(r, (l) => i.writeDynamic(l, n));
  } catch (l) {
    return E.get(s)?.(l), s;
  }
  return M || t == null && G != null ? (s.sendMessage = (...l) => {
    if (s.finished)
      return s;
    const o = new k();
    o.writeByte(R.MessageToExecutor), o.writeLength(c);
    const y = [];
    return o.writeArray(l, (u) => o.writeDynamic(u, y)), n.push(...y), q(o), s;
  }, s.cancel = () => {
    if (s.finished)
      return;
    const l = new k();
    l.writeByte(R.FunctionCancel), l.writeLength(c), q(l);
  }, s.getCaller = () => m(null, "c", c), ot(c, s, i), s) : (E.get(s)?.(T.new("Not connected")), s);
}
a(m, "callRemoteFunction");
function st(t) {
  return Fe(t, null, null, null, 3);
}
a(st, "callLocal");
function Fe(t, e, r, n, s) {
  const i = new me(s, []), c = new AbortController(), l = {
    type: e,
    method: r,
    sendMessage: (...o) => (i.finished || Q(i, o), l),
    get finished() {
      return i.finished;
    },
    promise: i,
    addMessageListener: (o) => ae(l, o),
    cancelToken: c.signal,
    cancelSelf: () => c.abort(),
    [Symbol.asyncIterator]: () => ie(l)
  };
  return i.sendMessage = (...o) => (i.finished || Q(l, o), i), i.cancel = () => i.finished || l.cancelSelf(), Me(t, l, U.get(i), E.get(i), e, r, n), i;
}
a(Fe, "callLocalFunction");
async function Me(t, e, r, n, s, i, c) {
  try {
    let l;
    const o = L;
    L = e;
    try {
      l = await {
        async $RPC_MARKER_BEGIN$() {
          return await t();
        }
      }.$RPC_MARKER_BEGIN$();
    } finally {
      L = o;
    }
    r?.(await l);
  } catch (l) {
    n?.(b.wrapAndFreeze(l).append(s, i, c));
  }
}
a(Me, "invokeForPromise");
const x = class extends (/* @__PURE__ */ a(function(r) {
  return Object.setPrototypeOf(r, new.target.prototype);
}, "Extendable")) {
  static {
    a(this, "RpcFunction2");
  }
  constructor(e, r) {
    super(m.bind(null, e, r)), this.type = e, this.method = r;
  }
  toString() {
    return `rpc (...params) => ${this.type ?? "null"}.${this.method}(...params)`;
  }
};
let it = Date.now();
const ge = /* @__PURE__ */ new WeakMap();
function be(t) {
  if (t instanceof x)
    return t;
  const e = ge.get(t);
  if (e != null)
    return new x("$" + v, e);
  const r = (it++).toString(16);
  ye[r] = t, ge.set(t, r);
  const n = "$" + v;
  return new x(n, r);
}
a(be, "registerFunction");
function ve(t) {
  const e = "$" + v;
  if (t.type != e)
    throw new Error("Can't unregister RemoteFunction, that was not registered locally");
  delete ye[t.method], ge.delete(t);
}
a(ve, "unregisterFunction");
const $ = Symbol("RpcObjectType"), Y = Symbol("RpcObjectExists"), V = Symbol("RpcObjectGetMethods");
function W(t, e = new class {
  static {
    a(this, "RpcObject");
  }
  [$] = t;
}()) {
  const r = /* @__PURE__ */ new Map();
  return new Proxy(e, {
    get(n, s) {
      if (s == $)
        return t;
      if (s == Y)
        return () => m(null, "E", t);
      if (s == V)
        return () => m(t, null, "M");
      if (typeof s != "string" || s == "then")
        return e[s];
      if (r.has(s))
        return r.get(s);
      const i = new x(
        t,
        s
      );
      return r.set(s, i), i;
    },
    construct(n, s) {
      return new n(...s);
    },
    has(n, s) {
      return s == $ || s == V || s == Y || s in e;
    }
  });
}
a(W, "createRemoteObject");
const Ie = new Proxy({}, {
  get: (t, e) => typeof e == "string" ? W(e) : void 0,
  has: (t, e) => typeof e == "string" && e != "then"
}), Be = [], De = /* @__PURE__ */ new Map();
function we(t, e) {
  let r = t.readLength();
  if (r < 0) {
    switch (r = -r, r % 4) {
      case 0:
        return e[r / 4];
      case 1:
        return new TextDecoder().decode(t.readBuffer((r - 1) / 4));
      case 2: {
        const n = {};
        e.push(n);
        for (let s = 0; s < (r - 2) / 4; s++) {
          const i = t.readString();
          n[i] = we(t, e);
        }
        return n;
      }
      case 3: {
        const n = new Array((r - 3) / 4);
        e.push(n);
        for (let s = 0; s < n.length; s++)
          n[s] = we(t, e);
        return n;
      }
    }
    throw new Error("Unreachable code reached");
  } else if (r >= 128) {
    const n = new TextDecoder().decode(t.readBuffer(r - 128)), s = De.get(n);
    if (s)
      return s(t, e);
    throw new Error("Unknown data type: " + n);
  } else
    switch (String.fromCodePoint(r)) {
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
        const l = t.readString(), o = t.readByte();
        return new RegExp(
          l,
          "g" + (o & 1 ? "i" : "") + (o & 2 ? "m" : "")
        );
      }
      case "E":
        return t.readError();
      case "O":
        const n = t.readString();
        if (n == null)
          throw new Error("Type can't be null");
        return W(n);
      case "F":
        const s = t.readString();
        if (s == null)
          throw new Error("Type can't be null");
        const i = t.readString();
        if (i == null)
          throw new Error("Method can't be null");
        const c = new x(s, i);
        return e.push(c), c;
      default:
        throw new Error("Unknown data type number: " + r);
    }
}
a(we, "readDynamic");
function de(t, e, r) {
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
    const n = e.flags;
    t.writeByte(
      (n.includes("i") ? 1 : 0) || (n.includes("m") ? 2 : 0)
    );
  } else if (e instanceof Error)
    t.writeLength(69), t.writeError(e);
  else if (typeof e == "object" && $ in e)
    t.writeLength(79), t.writeString(e[$]);
  else if (typeof e == "function") {
    r.push(e), t.writeLength(70);
    let n;
    e instanceof x ? n = e : (n = be(e), je.set(e, () => ve(n))), t.writeString(n.type), t.writeString(n.method);
  } else if (r.includes(e))
    t.writeLength(-(r.indexOf(e) * 4));
  else if (typeof e == "string") {
    const n = new TextEncoder().encode(e);
    t.writeLength(-(n.length * 4 + 1)), t.writeBytes(n);
  } else if (Array.isArray(e)) {
    r.push(e), t.writeLength(-(e.length * 4 + 3));
    for (let n of e)
      de(t, n, r);
  } else {
    for (let [n, s, i] of Be) {
      if (!s(e))
        continue;
      const c = new TextEncoder().encode(n);
      t.writeLength(c.length + 128), t.writeBytes(c), i(t, e, r);
      return;
    }
    if (typeof e == "object") {
      r.push(e);
      const n = Object.entries(e);
      t.writeLength(-(n.length * 4 + 2));
      for (let [s, i] of n)
        t.writeString(s), de(t, i, r);
    } else
      throw new Error("Unknown type for " + e);
  }
}
a(de, "writeDynamic");
const je = /* @__PURE__ */ new WeakMap();
function ne(t) {
  for (let e of t)
    je.get(e)?.();
}
a(ne, "freeDynamic");
class k {
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
      let r = new Uint8Array(Math.max(this._buf.byteLength * 2, e));
      this._data = new DataView(r.buffer), r.set(this._buf), this._buf = r;
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
    let r = new TextEncoder().encode(e);
    this.writeLength(r.length), this.writeBytes(r);
  }
  writeLength(e) {
    let r = (e < 0 ? ~e : e) >>> 0;
    for (; r >= 128; )
      this.writeByte(r | 128), r >>= 7;
    e < 0 ? (this.writeByte(r | 128), this.writeByte(0)) : this.writeByte(r);
  }
  writeByteArray(e) {
    e ? (this.writeLength(e.length), this.writeBytes(e)) : this.writeLength(-1);
  }
  writeArray(e, r) {
    if (!e)
      this.writeLength(-1);
    else {
      this.writeLength(e.length);
      for (let n = 0; n < e.length; n++)
        r.call(this, e[n]);
    }
  }
  toBuffer(e = 0) {
    return this._buf.slice(e, this._count - e);
  }
  writeError(e) {
    try {
      throw b.wrapAndFreeze(e);
    } catch (r) {
      r.write(this);
    }
  }
  writeDynamic(e, r = []) {
    de(this, e, r);
  }
}
const N = /* @__PURE__ */ new Map(), B = /* @__PURE__ */ new Map();
function at(t) {
  for (let e of N.values())
    E.get(e)?.(t);
  N.clear();
  for (let e of B.values())
    e.cancelSelf();
}
a(at, "disposeConnection");
function q(t) {
  if (G == null)
    throw T.new("Not connected");
  G.send(t.toBuffer());
}
a(q, "sendRaw");
function ot(t, e, r) {
  N.set(t, e);
  try {
    q(r);
  } catch (n) {
    E.get(e)?.(n);
  }
}
a(ot, "sendCall");
var R = /* @__PURE__ */ ((t) => (t[t.FunctionCall = 0] = "FunctionCall", t[t.FunctionSuccess = 1] = "FunctionSuccess", t[t.FunctionError = 2] = "FunctionError", t[t.FunctionCancel = 3] = "FunctionCancel", t[t.MessageToExecutor = 4] = "MessageToExecutor", t[t.MessageToCaller = 5] = "MessageToCaller", t))(R || {});
async function ct(t) {
  const e = t.readByte();
  switch (e) {
    case 0: {
      const r = t.readLength(), n = [];
      let s = !1, i = null, c = null;
      const l = new Promise((o, y) => {
        i = /* @__PURE__ */ a((u) => {
          o(u), s = !0;
          const h = new k();
          h.writeByte(
            1
            /* FunctionSuccess */
          ), h.writeLength(r), h.writeDynamic(u), q(h), B.delete(r), ne(n);
        }, "resolve"), c = /* @__PURE__ */ a((u) => {
          y(u), s = !0;
          const h = new k();
          h.writeByte(
            2
            /* FunctionError */
          ), h.writeLength(r), h.writeError(u), q(h), B.delete(r), ne(n);
        }, "reject");
      });
      l.catch(() => {
      });
      try {
        const o = t.readString();
        if (o == null)
          throw A.new(null);
        const y = _.get(o);
        if (!y)
          throw A.new(o);
        const u = t.readString(), h = t.readArray(() => t.readDynamic(n)) ?? [], g = new AbortController(), w = {
          type: o,
          method: u,
          get finished() {
            return s;
          },
          promise: l,
          sendMessage(...p) {
            if (s)
              return w;
            const f = new k();
            f.writeByte(
              5
              /* MessageToCaller */
            ), f.writeLength(r);
            const d = [];
            return f.writeArray(p, (C) => f.writeDynamic(C, d)), n.push(...d), q(f), w;
          },
          addMessageListener(p) {
            return ae(w, p), w;
          },
          cancelToken: g.signal,
          cancelSelf: () => g.abort(),
          [Symbol.asyncIterator]: () => ie(w)
        };
        B.set(r, w), await Me(Ae.bind(null, y, o, u, ...h), w, i, c, o, u, h);
      } catch (o) {
        o instanceof b || (o = O.new(`Error reading binary stream (${R[e]})`, o)), c(o);
      }
      break;
    }
    case 1: {
      const r = t.readLength(), n = N.get(r);
      if (n == null) {
        console.warn(`[Rpc] No activeRequest[${r}] (${R[e]})`);
        break;
      }
      try {
        U.get(n)?.(t.readDynamic());
      } catch (s) {
        E.get(n)?.(O.new(`Error reading binary stream (${R[e]})`, s));
      } finally {
        N.delete(r);
      }
      break;
    }
    case 2: {
      const r = t.readLength(), n = N.get(r);
      if (n == null) {
        console.warn(`[Rpc] No activeRequest[${r}] (${R[e]})`);
        break;
      }
      try {
        let s;
        try {
          s = t.readError();
        } catch (i) {
          s = O.new(`Error reading binary stream (${R[e]})`, i);
        }
        throw s;
      } catch (s) {
        E.get(n)?.(s);
      } finally {
        N.delete(r);
      }
      break;
    }
    case 3: {
      const r = t.readLength();
      let n = B.get(r);
      if (!n) {
        console.warn(`[Rpc] No currentlyExecuting[${r}] (${R[e]})`);
        break;
      }
      n.cancelSelf();
      break;
    }
    case 4: {
      const r = t.readLength();
      let n = B.get(r);
      if (!n) {
        console.warn(`[Rpc] No currentlyExecuting[${r}] (${R[e]})`);
        break;
      }
      const s = [], i = t.readArray(() => t.readDynamic(s)) ?? [];
      Q(n, i);
      break;
    }
    case 5: {
      const r = t.readLength();
      let n = N.get(r);
      if (!n) {
        console.warn(`[Rpc] No activeRequest[${r}] (${R[e]})`);
        break;
      }
      const s = [], i = t.readArray(() => t.readDynamic(s)) ?? [];
      Q(n, i);
      break;
    }
  }
}
a(ct, "receiveRpc");
class Ue {
  static {
    a(this, "DataInput");
  }
  _buf;
  _data;
  _pos;
  _count;
  constructor(e, r = 0, n = e.length) {
    this._buf = e, this._data = new DataView(e.buffer), this._pos = r, this._count = r + n;
  }
  readFully(e, r = 0, n = e.length) {
    let s = this._pos;
    if (this._count - s < n)
      throw new RangeError("not enough bytes available to use readFully");
    for (let c = r; c < r + n; c++)
      e[c] = this._buf[s++];
    this._pos = s;
  }
  skip(e) {
    let r = this.available();
    return e < r && (r = e < 0 ? 0 : e), this._pos += r, r;
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
    let e = 0, r = 0;
    for (; ; ) {
      const n = this.readByte();
      if (n == 0)
        return r == 0 ? 0 : ~e;
      if (!(n & 128))
        return e |= n << r, e;
      e |= (n & 127) << r, r += 7;
    }
  }
  readArray(e) {
    const r = this.readLength();
    if (r == -1)
      return null;
    const n = [];
    for (let s = 0; s < r; s++)
      n[s] = e.call(this);
    return n;
  }
  readError() {
    return b.read(this);
  }
  readDynamic(e = []) {
    return we(this, e);
  }
}
let M = !1, Re, pe, se = new Promise((t, e) => [Re, pe] = [t, e]);
se.catch(() => {
});
async function lt() {
  for (; ; )
    if (await se.then(() => !0, () => !1))
      return;
}
a(lt, "waitConnected");
let D;
if (Te) {
  const t = "RPC_URL" in globalThis ? globalThis.RPC_URL : process.env.RPC_URL, e = "RPC_TOKEN" in globalThis ? globalThis.RPC_TOKEN : process.env.RPC_TOKEN;
  t ? D = /* @__PURE__ */ a(async (r) => {
    const n = new URL(t);
    n.search = r.toString();
    const s = "require" in globalThis ? globalThis.require("ws") : (await import("ws")).WebSocket;
    return new s(n, e == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + e
      }
    });
  }, "createWebSocket") : (console.warn("[Rpc] RPC_URL is not defined => RPC will not connect"), D = /* @__PURE__ */ a(async () => ({}), "createWebSocket"));
} else if ("document" in globalThis)
  D = /* @__PURE__ */ a(async (t) => new WebSocket("ws" + document.location.origin.substring(4) + "/rpc?" + t), "createWebSocket");
else {
  const t = "RPC_URL" in globalThis ? globalThis.RPC_URL : process.env.RPC_URL, e = "RPC_TOKEN" in globalThis ? globalThis.RPC_TOKEN : process.env.RPC_TOKEN;
  t ? D = /* @__PURE__ */ a(async (r) => {
    const n = new URL(t);
    return n.search = r.toString(), new WebSocket(n, e == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + e
      }
    });
  }, "createWebSocket") : (console.warn("[Rpc] RPC_URL is not defined => RPC will not connect"), D = /* @__PURE__ */ a(async () => ({}), "createWebSocket"));
}
function Ne(t) {
  const e = pe;
  se = new Promise((r, n) => [Re, pe] = [r, n]), se.catch(() => {
  }), e(t), at(t);
}
a(Ne, "closeRpc");
let G = null;
async function ut(t) {
  let e = P, r = /* @__PURE__ */ new Set();
  const n = new URLSearchParams();
  n.set("id", v), r.add("$" + v), e != null && n.set("name", e);
  for (let i of _.keys())
    r.has(i) || (r.add(i), n.append("type", i));
  const s = await D(n);
  s.onclose = () => {
    setTimeout(t, 1e3), G && (G = null, M = !1, console.info("[Rpc] Reconnecting to RPC"), Ne(T.new("Connection closed by " + S.prettyName)));
  }, s.onopen = async () => {
    console.info("[Rpc] Connected to RPC");
    try {
      G = s;
      const i = new Set(_.keys()), c = new Set(r);
      for (let l of i)
        c.delete(l) && i.delete(l);
      i.size || c.size ? P != e ? await m(null, "H", P, [...i.keys()], [...c.keys()]) : await m(null, "H", [...i.keys()], [...c.keys()]) : P != e && await m(null, "H", P), M = !0, Re();
    } catch (i) {
      console.error("[Rpc] Error connecting to RPC: ", i), Ne(i), s?.close(4e3, "Error registering types");
      return;
    }
  }, s.binaryType = "arraybuffer", s.onmessage = (i) => {
    const c = i.data;
    typeof c == "string" ? console.log("[Rpc] WebSocket Message:", c) : ct(new Ue(new Uint8Array(c))).catch((l) => console.warn("[Rpc] Error receiving Packet:", l));
  };
}
a(ut, "connectOnce");
(/* @__PURE__ */ a(async function() {
  for (await Promise.resolve(); ; )
    await new Promise(
      (e) => ut(e)
    );
}, "connectLoop"))();
let P = null;
async function ft(t) {
  P = t;
  try {
    M && await m(null, "N", t);
  } catch (e) {
    console.error(`[Rpc] Error changing name to "${t}":`, e);
  }
}
a(ft, "setName");
function ht(t) {
  return function(e) {
    Be.push([t, (r) => r instanceof e, (r, n, s) => n.write(r, s)]), De.set(t, (r, n) => e.read(r, n));
  };
}
a(ht, "CustomDynamicType");
function gt(t) {
  return (e) => void ke(t ?? e.prototype.constructor.name, e);
}
a(gt, "RpcProvider");
Promise.resolve().then(() => wt).then((t) => Object.assign(globalThis, t));
class S {
  //Rpc
  static id = v;
  static get prettyName() {
    return S.name != null ? `${S.name} (${S.id})` : S.id;
  }
  static get name() {
    return P;
  }
  static setName = ft;
  //Connection
  static get isConnected() {
    return M;
  }
  static get waitUntilConnected() {
    return lt();
  }
  //Functions
  static createObject = W;
  static createFunction = (e, r) => new x(e, r);
  static registerFunction = be;
  static unregisterFunction = ve;
  static callLocal = st;
  //Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
  static callFunction = m;
  //Call remote function
  static getContext = rt;
  static runWithContext = tt;
  //Types
  static registerType = ke;
  static unregisterType = et;
  static generateTypeName = Ze;
  static getObjectWithFallback = async (e, ...r) => await m("Rpc", "getObjectWithFallback", e, ...r);
  static checkTypes = async (...e) => await m("Rpc", "checkTypes", ...e);
  static checkType = async (e) => await m("Rpc", "checkType", e);
  static getAllTypes = async () => await m("Rpc", "getAllTypes");
  static getAllConnections = async () => await m("Rpc", "getAllConnections");
  static getRegistrations = async (e = !1) => await m("Rpc", "getRegistrations", e);
  static evalObject = async (e) => await m("Rpc", "evalObject", e);
  static evalString = async (e) => await m("Rpc", "evalString", e);
  static listenCalls = () => m("Rpc", "listenCalls");
  static root = Ie;
  /** @deprecated*/
  static type = $;
  /** @deprecated*/
  static exists = Y;
  /** @deprecated*/
  static getMethods = V;
  static getObjectMethods = (e) => (typeof e == "string" ? W(e) : e)[V]();
  static getObjectExists = (e) => (typeof e == "string" ? W(e) : e)[Y]();
  static getObjectType = (e) => e[$];
}
const wt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CustomDynamicType: ht,
  DataInput: Ue,
  DataOutput: k,
  PendingCall: me,
  RPC_ROOT: Ie,
  Rpc: S,
  RpcCallError: ee,
  get RpcConnectionError() {
    return T;
  },
  RpcCustomError: I,
  get RpcDataError() {
    return O;
  },
  RpcError: b,
  get RpcEvalError() {
    return he;
  },
  RpcFunction: x,
  get RpcMetaMethodNotFoundError() {
    return z;
  },
  get RpcMethodNotFoundError() {
    return F;
  },
  RpcObjectExists: Y,
  RpcObjectGetMethods: V,
  RpcObjectType: $,
  RpcProvider: gt,
  get RpcTypeNotFoundError() {
    return A;
  },
  createRemoteObject: W,
  getAsyncIterator: ie,
  listenersMap: K,
  pendingMap: j,
  registerFunction: be,
  registerReceive: ae,
  rejectCall: E,
  resolveCall: U,
  runReceiveMessage: Q,
  unregisterFunction: ve
}, Symbol.toStringTag, { value: "Module" }));
export {
  ht as CustomDynamicType,
  Ue as DataInput,
  k as DataOutput,
  me as PendingCall,
  Ie as RPC_ROOT,
  S as Rpc,
  ee as RpcCallError,
  T as RpcConnectionError,
  I as RpcCustomError,
  O as RpcDataError,
  b as RpcError,
  he as RpcEvalError,
  x as RpcFunction,
  z as RpcMetaMethodNotFoundError,
  F as RpcMethodNotFoundError,
  Y as RpcObjectExists,
  V as RpcObjectGetMethods,
  $ as RpcObjectType,
  gt as RpcProvider,
  A as RpcTypeNotFoundError,
  W as createRemoteObject,
  ie as getAsyncIterator,
  K as listenersMap,
  j as pendingMap,
  be as registerFunction,
  ae as registerReceive,
  E as rejectCall,
  U as resolveCall,
  Q as runReceiveMessage,
  ve as unregisterFunction
};
//# sourceMappingURL=rpc.js.map
