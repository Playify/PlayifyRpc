var Je = Object.defineProperty;
var a = (t, e) => Je(t, "name", { value: e, configurable: !0 });
const fe = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
function B(t) {
  return function(e) {
    const [n, r] = fe;
    n.set(t, e), r.set(e, t);
  };
}
a(B, "RpcCustomError");
var Le = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Xe(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
a(Xe, "getDefaultExportFromCjs");
var $e = { exports: {} }, ue = { exports: {} }, Ce;
function Qe() {
  return Ce || (Ce = 1, function(t, e) {
    (function(n, r) {
      t.exports = r();
    })(Le, function() {
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
      var s = ["isConstructor", "isEval", "isNative", "isToplevel"], c = ["columnNumber", "lineNumber"], l = ["fileName", "functionName", "source"], o = ["args"], y = ["evalOrigin"], u = s.concat(c, l, o, y);
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
          var f = this.getFileName() || "", d = this.getLineNumber() || "", S = this.getColumnNumber() || "", J = this.getFunctionName() || "";
          return this.getIsEval() ? f ? "[eval] (" + f + ":" + d + ":" + S + ")" : "[eval]:" + d + ":" + S : J ? J + " (" + f + ":" + d + ":" + S + ")" : f + ":" + d + ":" + S;
        }
      }, h.fromString = /* @__PURE__ */ a(function(d) {
        var S = d.indexOf("("), J = d.lastIndexOf(")"), Ge = d.substring(0, S), qe = d.substring(S + 1, J).split(","), Se = d.substring(J + 1);
        if (Se.indexOf("@") === 0)
          var le = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(Se, ""), ze = le[1], Ve = le[2], He = le[3];
        return new h({
          functionName: Ge,
          args: qe || void 0,
          fileName: ze,
          lineNumber: Ve || void 0,
          columnNumber: He || void 0
        });
      }, "StackFrame$$fromString");
      for (var g = 0; g < s.length; g++)
        h.prototype["get" + r(s[g])] = i(s[g]), h.prototype["set" + r(s[g])] = /* @__PURE__ */ function(f) {
          return function(d) {
            this[f] = !!d;
          };
        }(s[g]);
      for (var w = 0; w < c.length; w++)
        h.prototype["get" + r(c[w])] = i(c[w]), h.prototype["set" + r(c[w])] = /* @__PURE__ */ function(f) {
          return function(d) {
            if (!n(d))
              throw new TypeError(f + " must be a Number");
            this[f] = Number(d);
          };
        }(c[w]);
      for (var p = 0; p < l.length; p++)
        h.prototype["get" + r(l[p])] = i(l[p]), h.prototype["set" + r(l[p])] = /* @__PURE__ */ function(f) {
          return function(d) {
            this[f] = String(d);
          };
        }(l[p]);
      return h;
    });
  }(ue)), ue.exports;
}
a(Qe, "requireStackframe");
(function(t, e) {
  (function(n, r) {
    t.exports = r(Qe());
  })(Le, /* @__PURE__ */ a(function(r) {
    var i = /(^|@)\S+:\d+/, s = /^\s*at .*(\S+:\d+|\(native\))/m, c = /^(eval@)?(\[native code])?$/;
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
        if (o.stack && o.stack.match(s))
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
      parseFFOrSafari: /* @__PURE__ */ a(function(o) {
        var y = o.stack.split(`
`).filter(function(u) {
          return !u.match(c);
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
          p && h.push(new r({
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
      parseOpera11: /* @__PURE__ */ a(function(o) {
        var y = o.stack.split(`
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
})($e);
var Ye = $e.exports;
const te = /* @__PURE__ */ Xe(Ye);
function he(t) {
  return t.replaceAll("\r", "").replaceAll(/^\n+|\n+$/g, "").replaceAll(/^  +/gm, "	");
}
a(he, "fixString");
function ne(t) {
  let e = "";
  for (let n of t) {
    if (n.functionName?.includes("$RPC_MARKER_BEGIN$"))
      break;
    e += `
	at ` + n;
  }
  return e;
}
a(ne, "framesToString");
function Te(t) {
  return t === void 0 ? "" : t instanceof m ? `
caused by: ` + t.toString() : t instanceof Error ? `
caused by: ` + he(t.toString()) + ne(te.parse(t)) + Te(t.cause) : `
caused by: ` + he(t?.toString() ?? "null");
}
a(Te, "causeToString");
function Pe(t, e) {
  return (t === m || Pe(t.__proto__, e)) && e[0].functionName?.replace(/^new /, "") === t.name ? (e.shift(), !0) : !1;
}
a(Pe, "removeFromStackTrace");
class m extends Error {
  static {
    a(this, "RpcError");
  }
  //public get type(){return this.name}
  from;
  data = {};
  #t = [];
  get stackTrace() {
    let e = this.#e;
    return e += ne(this.#t), e += this.#r, e.replaceAll(/^\n+/g, "");
  }
  #e = "";
  #n = !1;
  #r = "";
  constructor(...e) {
    let n = null, r = null, i = null, s = {}, c;
    switch (e.length) {
      case 1:
        [r] = e;
        break;
      case 2:
        [r, c] = e;
        break;
      case 4:
        [r, n, r, i] = e;
        break;
      case 5:
        e[4] instanceof m ? [r, n, r, i, c] = e : [r, n, r, i, s] = e;
        break;
      case 6:
        [r, n, r, i, s, c] = e;
        break;
      default:
        throw new Error("Invalid arg count");
    }
    c != null ? super(r ?? void 0, { cause: c }) : super(r ?? void 0), this.name = this.constructor.name, this.from = n ?? C.prettyName;
    const l = fe[1].get(this.constructor);
    if (l != null && (this.data.$type = l), Object.assign(this.data, s ?? {}), i == null)
      this.#n = !0, this.#t = te.parse(this), Pe(this.constructor, this.#t);
    else {
      this.#e = `
` + he(i);
      const o = this.#e.indexOf(`
caused by: `);
      o != -1 && (this.#r += this.#e.substring(o), this.#e = this.#e.substring(0, o));
    }
    this.#r += Te(c), this.stack = this.toString();
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
    let c;
    try {
      c = JSON.parse(e.readString() ?? "null");
    } catch (l) {
      if (l instanceof RangeError)
        c = { $info: "JsonData was not included, due to an old PlayifyRpc version" };
      else
        throw l;
    }
    return m.create(n, r, i, s, c);
  }
  static create(e, n, r, i, s) {
    const c = s?.$type, l = fe[0].get(c) ?? m;
    return new l(e, n, r, i, s);
  }
  static wrapAndFreeze(e) {
    return e instanceof m ? (e.#n && (e.#n = !1, e.#e += ne(e.#t), e.#t = [], e.stack = e.toString()), e) : new m(
      e.name,
      e instanceof m ? e.from : null,
      e.message,
      ne(te.parse(e)).substring(1),
      {},
      e.cause
    );
  }
  unfreeze(e, n) {
    return this.#n ? this : (this.#n = !0, this.#t = te.parse(e).slice(n), this.stack = this.toString(), this);
  }
  trashLocalStack() {
    return this.#n = !1, this.#t = [], this.stack = this.toString(), this;
  }
  append(e, n, r) {
    return this.#e += `
	rpc ` + (r == null ? "<<callLocal>>" : (e ?? "<<null>>") + "." + (n ?? "<<null>>") + "(" + r.map((i) => JSON.stringify(i)).join(",") + ")"), this.stack = this.toString(), this;
  }
}
const ke = globalThis?.process?.versions?.node != null, Oe = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", ge = /* @__PURE__ */ a(() => Date.now().toString(36) + Array(10).fill(void 0).map(() => Oe[Math.floor(Math.random() * Oe.length)]).join(""), "randomId");
let v;
if (ke)
  try {
    process?.versions.bun ? v = "bun@" + require("os").hostname() + "@" + process.pid : v = "node@" + process.binding("os").getHostname() + "@" + process.pid;
  } catch {
    v = "node-alternative@" + process.platform + ":" + process.arch + "@" + process.pid;
  }
else
  "document" in globalThis ? v = "web@" + document.location + "#" + ge() : v = "js@" + ge();
var Ae = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, et = /* @__PURE__ */ a((t, e, n) => e in t ? Ae(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, "__defNormalProp"), H = /* @__PURE__ */ a((t, e, n, r) => {
  for (var i = r > 1 ? void 0 : r ? Ze(e, n) : e, s = t.length - 1, c; s >= 0; s--)
    (c = t[s]) && (i = (r ? c(e, n, i) : c(i)) || i);
  return r && i && Ae(e, n, i), i;
}, "__decorateClass"), Z = /* @__PURE__ */ a((t, e, n) => (et(t, typeof e != "symbol" ? e + "" : e, n), n), "__publicField");
const X = /* @__PURE__ */ a((t) => t == null ? "null" : '"' + t + '"', "quoted");
class ee extends m {
  static {
    a(this, "RpcCallError");
  }
}
let F = class extends ee {
  static {
    a(this, "RpcTypeNotFoundError");
  }
};
Z(F, "new", (t) => new F(
  null,
  null,
  `Type ${X(t)} does not exist`,
  "",
  { type: t }
));
F = H([
  B("$type")
], F);
let T = class extends ee {
  static {
    a(this, "RpcMethodNotFoundError");
  }
};
Z(T, "new", (t, e) => new T(
  null,
  null,
  `Method ${X(e)} does not exist on type ${X(t)}`,
  "",
  { type: t, method: e }
));
T = H([
  B("$method")
], T);
let V = class extends T {
  static {
    a(this, "RpcMetaMethodNotFoundError");
  }
};
Z(V, "new", (t, e) => new V(
  null,
  null,
  `Meta-Method ${X(e)} does not exist on type ${X(t)}`,
  "",
  { type: t, method: null, meta: e }
));
V = H([
  B("$method-meta")
], V);
let P = class extends ee {
  static {
    a(this, "RpcConnectionError");
  }
};
Z(P, "new", (t) => new P(null, null, t, ""));
P = H([
  B("$connection")
], P);
let we = class extends ee {
  static {
    a(this, "RpcEvalError");
  }
};
we = H([
  B("$eval")
], we);
let L = class extends m {
  static {
    a(this, "RpcDataError");
  }
};
Z(L, "new", (t, e) => new L(null, null, t, "", e));
L = H([
  B("$data")
], L);
function tt(t) {
  let e = t.toString();
  e = e.substring(e.indexOf("(") + 1);
  const n = [];
  for (; ; ) {
    const r = x(e);
    for (n.push(r.replaceAll("\0", "").trim()), e = e.substring(r.length); e[0] == "/"; )
      e = e.substring(x(e).length);
    for (e[0] == "=" && (e = e.substring(x(e.substring(1)).length + 1)); e[0] == "/"; )
      e = e.substring(x(e).length);
    if (e[0] == ")")
      break;
    if (e[0] == ",")
      e = e.substring(1);
    else
      throw new Error("Invalid args");
  }
  return n;
}
a(tt, "getFunctionParameterNames");
function x(t) {
  if (t[0] == "/") {
    if (t[1] == "/") {
      const e = t.indexOf(`
`);
      return e == -1 ? t : t.substring(0, e + 1);
    }
    if (t[1] == "*") {
      const e = t.indexOf("*/", 2);
      return e == -1 ? t : t.substring(0, e + 2);
    }
  }
  if (t[0] == "[") {
    let e = "[";
    for (; ; ) {
      if (e += x(t.substring(e.length)), t[e.length] == "]")
        return e + "]";
      if (t[e.length] == ",")
        e += ",";
      else {
        if (t[e.length] == "/")
          continue;
        if (t[e.length] == "=")
          e += "\0".repeat(x(t.substring(e.length + 1)).length + 1);
        else
          throw new Error("Invalid array destructuring");
      }
    }
  }
  if (t[0] == "{") {
    let e = "{";
    for (; ; ) {
      if (e += x(t.substring(e.length)), t[e.length] == "}")
        return e + "}";
      if (t[e.length] == ":")
        e += ":";
      else if (t[e.length] == ",")
        e += ",";
      else {
        if (t[e.length] == "/")
          continue;
        if (t[e.length] == "=")
          e += "\0".repeat(x(t.substring(e.length + 1)).length + 1);
        else
          throw new Error("Invalid object destructuring");
      }
    }
  }
  if (t[0] == '"' || t[0] == "'" || t[0] == "`") {
    for (let e = 1; e < t.length; e++) {
      if (t[e] == t[0])
        return t.substring(0, e + 1);
      if (t[e] == "\\")
        switch (t[e + 1]) {
          case "u":
            e += 5;
            break;
          case "x":
            e += 3;
            break;
          default:
            e += 1;
            break;
        }
    }
    throw new Error("Missing end of string");
  }
  for (let e = 0; e < t.length; e++)
    if (t[e] == "," || t[e] == "]" || t[e] == "}" || t[e] == ")" || t[e] == "=")
      return t.substring(0, e);
  return t;
}
a(x, "identifier");
const me = /* @__PURE__ */ Object.create(null), _ = /* @__PURE__ */ new Map();
_.set("$" + v, me);
function nt() {
  return "$" + v + "$" + ge();
}
a(nt, "generateTypeName");
async function Me(t, e) {
  if (!_.has(t)) {
    _.set(t, e);
    try {
      I && await b(null, "+", t);
    } catch (n) {
      console.error(`[Rpc] Error registering type "${t}":`, n), _.delete(t);
    }
  }
}
a(Me, "registerType");
async function rt(t) {
  if (_.has(t)) {
    try {
      I && await b(null, "-", t);
    } catch (e) {
      console.error(`[Rpc] Error unregistering type "${t}":`, e);
    }
    _.delete(t);
  }
}
a(rt, "unregisterType");
async function Fe(t, e, n, ...r) {
  if (n != null) {
    let s = t[n];
    if (s == null) {
      let l = (await Ne(t)).find((o) => o.toLowerCase() == n.toLowerCase());
      l != null && (s = t[l]);
    }
    const c = {}[n];
    if (s == null || s === c)
      throw T.new(e, n);
    try {
      return await {
        async $RPC_MARKER_BEGIN$() {
          return await s.call(t, ...r);
        }
      }.$RPC_MARKER_BEGIN$();
    } catch (l) {
      throw m.wrapAndFreeze(l);
    }
  }
  const i = r.length == 0 ? null : r[0];
  switch (i) {
    case "M":
      return Ne(t);
    case "S":
      return it(t, e, r[1] == null ? null : "" + r[1], !!r[2]);
    default:
      throw V.new(e, i);
  }
}
a(Fe, "invoke");
async function it(t, e, n, r) {
  if (n == null)
    return [
      [["M"], "string[]"],
      [["S", r ? "method:string|null" : "string? method", r ? "ts:boolean" : "bool ts"], r ? "[parameters:string[],returns:string][]" : "(string[] parameters,string @return)[]"]
    ];
  const i = t[re];
  if (i)
    return await i.call(t, n, r);
  const s = t[n];
  if (!s)
    throw new T(e, n);
  return s[re] ? s[re].call(s, r) : [
    [tt(s), r ? "unknown" : "dynamic"]
  ];
}
a(it, "getMethodSignatures");
async function Ne(t) {
  const e = t[Y];
  return e ? await e.call(t) : Object.getOwnPropertyNames(t).filter((n) => typeof t[n] == "function");
}
a(Ne, "getMethods");
class ve {
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
        K.set(this, (c) => {
          K.delete(this), E.delete(this), this.finished = !0, i(c), se(n);
        }), E.set(this, (c) => {
          K.delete(this), E.delete(this), this.finished = !0, s(c instanceof m ? c.unfreeze(r, e) : c), se(n);
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
    return ce(this, e);
  }
  cancel() {
  }
  //overridden by callFunction and callLocal
  getCaller() {
    return Promise.resolve(C.prettyName);
  }
  //overridden by callFunction and callLocal
  [Symbol.asyncIterator]() {
    return oe(this);
  }
}
function oe(t) {
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
a(oe, "getAsyncIterator");
const K = /* @__PURE__ */ new WeakMap(), E = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ new WeakMap();
function ce(t, e) {
  if (W.has(t))
    W.get(t).push(e);
  else {
    W.set(t, [e]);
    const n = U.get(t) ?? [];
    for (let r of n)
      try {
        e(...r);
      } catch (i) {
        console.warn("[Rpc] Error while handling pending message:", i);
      }
  }
  return t;
}
a(ce, "registerReceive");
function Q(t, e) {
  if (!t.finished)
    if (W.has(t))
      for (let n of W.get(t))
        try {
          n(...e);
        } catch (r) {
          console.warn("[Rpc] Error while receiving message:", r);
        }
    else
      U.has(t) ? U.set(t, [...U.get(t), e]) : U.set(t, [e]);
}
a(Q, "runReceiveMessage");
let $ = null;
function st(t, e) {
  const n = $;
  $ = e;
  try {
    return t();
  } finally {
    $ = n;
  }
}
a(st, "runWithContext");
function at() {
  if ($ == null)
    throw new Error("FunctionCallContext not available");
  return $;
}
a(at, "getFunctionContext");
let ot = 0;
function b(t, e, ...n) {
  if (t != null) {
    const l = _.get(t);
    if (l)
      return Ie(Fe.bind(null, l, t, e, ...n), t, e, n, 3);
  }
  const r = [], i = new ve(2, r), s = new M(), c = ot++;
  try {
    s.writeByte(R.FunctionCall), s.writeLength(c), s.writeString(t), s.writeString(e), s.writeArray(n, (l) => s.writeDynamic(l, r));
  } catch (l) {
    return E.get(i)?.(l), i;
  }
  return I || t == null && z != null ? (i.sendMessage = (...l) => {
    if (i.finished)
      return i;
    const o = new M();
    o.writeByte(R.MessageToExecutor), o.writeLength(c);
    const y = [];
    return o.writeArray(l, (u) => o.writeDynamic(u, y)), r.push(...y), q(o), i;
  }, i.cancel = () => {
    if (i.finished)
      return;
    const l = new M();
    l.writeByte(R.FunctionCancel), l.writeLength(c), q(l);
  }, i.getCaller = () => b(null, "c", c), ft(c, i, s), i) : (E.get(i)?.(P.new("Not connected")), i);
}
a(b, "callRemoteFunction");
function ct(t) {
  return Ie(t, null, null, null, 3);
}
a(ct, "callLocal");
function Ie(t, e, n, r, i) {
  const s = new ve(i, []), c = new AbortController(), l = {
    type: e,
    method: n,
    sendMessage: (...o) => (s.finished || Q(s, o), l),
    get finished() {
      return s.finished;
    },
    promise: s,
    addMessageListener: (o) => ce(l, o),
    cancelToken: c.signal,
    cancelSelf: () => c.abort(),
    [Symbol.asyncIterator]: () => oe(l)
  };
  return s.sendMessage = (...o) => (s.finished || Q(l, o), s), s.cancel = () => s.finished || l.cancelSelf(), Be(t, l, K.get(s), E.get(s), e, n, r), s;
}
a(Ie, "callLocalFunction");
async function Be(t, e, n, r, i, s, c) {
  try {
    let l;
    const o = $;
    $ = e;
    try {
      l = await {
        async $RPC_MARKER_BEGIN$() {
          return await t();
        }
      }.$RPC_MARKER_BEGIN$();
    } finally {
      $ = o;
    }
    n?.(await l);
  } catch (l) {
    r?.(m.wrapAndFreeze(l).append(i, s, c));
  }
}
a(Be, "invokeForPromise");
const O = class extends (/* @__PURE__ */ a(function(n) {
  return Object.setPrototypeOf(n, new.target.prototype);
}, "Extendable")) {
  static {
    a(this, "RpcFunction2");
  }
  constructor(e, n) {
    super(b.bind(null, e, n)), this.type = e, this.method = n;
  }
  async getMethodSignatures(e = !1) {
    return b(this.type, null, "S", this.method, e);
  }
  toString() {
    return `rpc (...params) => ${this.type ?? "null"}.${this.method}(...params)`;
  }
};
let lt = Date.now();
const de = /* @__PURE__ */ new WeakMap();
function Re(t) {
  if (t instanceof O)
    return t;
  const e = de.get(t);
  if (e != null)
    return new O("$" + v, e);
  const n = (lt++).toString(16);
  me[n] = t, de.set(t, n);
  const r = "$" + v;
  return new O(r, n);
}
a(Re, "registerFunction");
function Ee(t) {
  const e = "$" + v;
  if (t.type != e)
    throw new Error("Can't unregister RemoteFunction, that was not registered locally");
  delete me[t.method], de.delete(t);
}
a(Ee, "unregisterFunction");
const A = Symbol("RpcObjectType"), ie = Symbol("RpcObjectExists"), Y = Symbol("RpcObjectGetMethods"), re = Symbol("RpcObjectGetMethodSignatures");
function G(t, e = new class {
  static {
    a(this, "RpcObject");
  }
  [A] = t;
}()) {
  const n = /* @__PURE__ */ new Map();
  return new Proxy(e, {
    get(r, i) {
      if (i == A)
        return t;
      if (i == ie)
        return () => b(null, "E", t);
      if (i == Y)
        return () => b(t, null, "M");
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
      return i == A || i == Y || i == ie || i in e;
    }
  });
}
a(G, "createRemoteObject");
const je = new Proxy({}, {
  get: (t, e) => typeof e == "string" ? G(e) : void 0,
  has: (t, e) => typeof e == "string" && e != "then"
}), De = [], Ue = /* @__PURE__ */ new Map();
function pe(t, e) {
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
          r[s] = pe(t, e);
        }
        return r;
      }
      case 3: {
        const r = new Array((n - 3) / 4);
        e.push(r);
        for (let i = 0; i < r.length; i++)
          r[i] = pe(t, e);
        return r;
      }
    }
    throw new Error("Unreachable code reached");
  } else if (n >= 128) {
    const r = new TextDecoder().decode(t.readBuffer(n - 128)), i = Ue.get(r);
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
        const l = t.readString(), o = t.readByte();
        return new RegExp(
          l,
          "g" + (o & 1 ? "i" : "") + (o & 2 ? "m" : "")
        );
      }
      case "E":
        return t.readError();
      case "O":
        const r = t.readString();
        if (r == null)
          throw new Error("Type can't be null");
        return G(r);
      case "F":
        const i = t.readString();
        if (i == null)
          throw new Error("Type can't be null");
        const s = t.readString();
        if (s == null)
          throw new Error("Method can't be null");
        const c = new O(i, s);
        return e.push(c), c;
      default:
        throw new Error("Unknown data type number: " + n);
    }
}
a(pe, "readDynamic");
function ye(t, e, n) {
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
  else if (typeof e == "object" && A in e)
    t.writeLength(79), t.writeString(e[A]);
  else if (typeof e == "function") {
    n.push(e), t.writeLength(70);
    let r;
    e instanceof O ? r = e : (r = Re(e), Ke.set(e, () => Ee(r))), t.writeString(r.type), t.writeString(r.method);
  } else if (n.includes(e))
    t.writeLength(-(n.indexOf(e) * 4));
  else if (typeof e == "string") {
    const r = new TextEncoder().encode(e);
    t.writeLength(-(r.length * 4 + 1)), t.writeBytes(r);
  } else if (Array.isArray(e)) {
    n.push(e), t.writeLength(-(e.length * 4 + 3));
    for (let r of e)
      ye(t, r, n);
  } else {
    for (let [r, i, s] of De) {
      if (!i(e))
        continue;
      const c = new TextEncoder().encode(r);
      t.writeLength(c.length + 128), t.writeBytes(c), s(t, e, n);
      return;
    }
    if (typeof e == "object") {
      n.push(e);
      const r = Object.entries(e);
      t.writeLength(-(r.length * 4 + 2));
      for (let [i, s] of r)
        t.writeString(i), ye(t, s, n);
    } else
      throw new Error("Unknown type for " + e);
  }
}
a(ye, "writeDynamic");
const Ke = /* @__PURE__ */ new WeakMap();
function se(t) {
  for (let e of t)
    Ke.get(e)?.();
}
a(se, "freeDynamic");
class M {
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
      throw m.wrapAndFreeze(e);
    } catch (n) {
      n.write(this);
    }
  }
  writeDynamic(e, n = []) {
    ye(this, e, n);
  }
}
const N = /* @__PURE__ */ new Map(), j = /* @__PURE__ */ new Map();
function ut(t) {
  for (let e of N.values())
    E.get(e)?.(t);
  N.clear();
  for (let e of j.values())
    e.cancelSelf();
}
a(ut, "disposeConnection");
function q(t) {
  if (z == null)
    throw P.new("Not connected");
  z.send(t.toBuffer());
}
a(q, "sendRaw");
function ft(t, e, n) {
  N.set(t, e);
  try {
    q(n);
  } catch (r) {
    E.get(e)?.(r);
  }
}
a(ft, "sendCall");
var R = /* @__PURE__ */ ((t) => (t[t.FunctionCall = 0] = "FunctionCall", t[t.FunctionSuccess = 1] = "FunctionSuccess", t[t.FunctionError = 2] = "FunctionError", t[t.FunctionCancel = 3] = "FunctionCancel", t[t.MessageToExecutor = 4] = "MessageToExecutor", t[t.MessageToCaller = 5] = "MessageToCaller", t))(R || {});
async function ht(t) {
  const e = t.readByte();
  switch (e) {
    case 0: {
      const n = t.readLength(), r = [];
      let i = !1, s = null, c = null;
      const l = new Promise((o, y) => {
        s = /* @__PURE__ */ a((u) => {
          o(u), i = !0;
          const h = new M();
          h.writeByte(
            1
            /* FunctionSuccess */
          ), h.writeLength(n), h.writeDynamic(u), q(h), j.delete(n), se(r);
        }, "resolve"), c = /* @__PURE__ */ a((u) => {
          y(u), i = !0;
          const h = new M();
          h.writeByte(
            2
            /* FunctionError */
          ), h.writeLength(n), h.writeError(u), q(h), j.delete(n), se(r);
        }, "reject");
      });
      l.catch(() => {
      });
      try {
        const o = t.readString();
        if (o == null)
          throw F.new(null);
        const y = _.get(o);
        if (!y)
          throw F.new(o);
        const u = t.readString(), h = t.readArray(() => t.readDynamic(r)) ?? [], g = new AbortController(), w = {
          type: o,
          method: u,
          get finished() {
            return i;
          },
          promise: l,
          sendMessage(...p) {
            if (i)
              return w;
            const f = new M();
            f.writeByte(
              5
              /* MessageToCaller */
            ), f.writeLength(n);
            const d = [];
            return f.writeArray(p, (S) => f.writeDynamic(S, d)), r.push(...d), q(f), w;
          },
          addMessageListener(p) {
            return ce(w, p), w;
          },
          cancelToken: g.signal,
          cancelSelf: () => g.abort(),
          [Symbol.asyncIterator]: () => oe(w)
        };
        j.set(n, w), await Be(Fe.bind(null, y, o, u, ...h), w, s, c, o, u, h);
      } catch (o) {
        o instanceof m || (o = L.new(`Error reading binary stream (${R[e]})`, o)), c(o);
      }
      break;
    }
    case 1: {
      const n = t.readLength(), r = N.get(n);
      if (r == null) {
        console.warn(`[Rpc] No activeRequest[${n}] (${R[e]})`);
        break;
      }
      try {
        K.get(r)?.(t.readDynamic());
      } catch (i) {
        E.get(r)?.(L.new(`Error reading binary stream (${R[e]})`, i));
      } finally {
        N.delete(n);
      }
      break;
    }
    case 2: {
      const n = t.readLength(), r = N.get(n);
      if (r == null) {
        console.warn(`[Rpc] No activeRequest[${n}] (${R[e]})`);
        break;
      }
      try {
        let i;
        try {
          i = t.readError();
        } catch (s) {
          i = L.new(`Error reading binary stream (${R[e]})`, s);
        }
        throw i;
      } catch (i) {
        E.get(r)?.(i);
      } finally {
        N.delete(n);
      }
      break;
    }
    case 3: {
      const n = t.readLength();
      let r = j.get(n);
      if (!r) {
        console.warn(`[Rpc] No currentlyExecuting[${n}] (${R[e]})`);
        break;
      }
      r.cancelSelf();
      break;
    }
    case 4: {
      const n = t.readLength();
      let r = j.get(n);
      if (!r) {
        console.warn(`[Rpc] No currentlyExecuting[${n}] (${R[e]})`);
        break;
      }
      const i = [], s = t.readArray(() => t.readDynamic(i)) ?? [];
      Q(r, s);
      break;
    }
    case 5: {
      const n = t.readLength();
      let r = N.get(n);
      if (!r) {
        console.warn(`[Rpc] No activeRequest[${n}] (${R[e]})`);
        break;
      }
      const i = [], s = t.readArray(() => t.readDynamic(i)) ?? [];
      Q(r, s);
      break;
    }
  }
}
a(ht, "receiveRpc");
class We {
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
    for (let c = n; c < n + r; c++)
      e[c] = this._buf[i++];
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
    return m.read(this);
  }
  readDynamic(e = []) {
    return pe(this, e);
  }
}
let I = !1, _e, be, ae = new Promise((t, e) => [_e, be] = [t, e]);
ae.catch(() => {
});
async function gt() {
  for (; ; )
    if (await ae.then(() => !0, () => !1))
      return;
}
a(gt, "waitConnected");
let D;
if (ke) {
  const t = "RPC_URL" in globalThis ? globalThis.RPC_URL : process.env.RPC_URL, e = "RPC_TOKEN" in globalThis ? globalThis.RPC_TOKEN : process.env.RPC_TOKEN;
  t ? D = /* @__PURE__ */ a(async (n) => {
    const r = new URL(t);
    r.search = n.toString();
    const i = "require" in globalThis ? globalThis.require("ws") : (await import("ws")).WebSocket;
    return new i(r, e == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + e
      }
    });
  }, "createWebSocket") : (console.warn("[Rpc] RPC_URL is not defined => RPC will not connect"), D = /* @__PURE__ */ a(async () => ({}), "createWebSocket"));
} else if ("document" in globalThis)
  D = /* @__PURE__ */ a(async (t) => new WebSocket("ws" + document.location.origin.substring(4) + "/rpc?" + t), "createWebSocket");
else {
  const t = "RPC_URL" in globalThis ? globalThis.RPC_URL : process.env.RPC_URL, e = "RPC_TOKEN" in globalThis ? globalThis.RPC_TOKEN : process.env.RPC_TOKEN;
  t ? D = /* @__PURE__ */ a(async (n) => {
    const r = new URL(t);
    return r.search = n.toString(), new WebSocket(r, e == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + e
      }
    });
  }, "createWebSocket") : (console.warn("[Rpc] RPC_URL is not defined => RPC will not connect"), D = /* @__PURE__ */ a(async () => ({}), "createWebSocket"));
}
function xe(t) {
  const e = be;
  ae = new Promise((n, r) => [_e, be] = [n, r]), ae.catch(() => {
  }), e(t), ut(t);
}
a(xe, "closeRpc");
let z = null;
async function wt(t) {
  let e = k, n = /* @__PURE__ */ new Set();
  const r = new URLSearchParams();
  r.set("id", v), n.add("$" + v), e != null && r.set("name", e);
  for (let s of _.keys())
    n.has(s) || (n.add(s), r.append("type", s));
  const i = await D(r);
  i.onclose = () => {
    setTimeout(t, 1e3), z && (z = null, I = !1, console.info("[Rpc] Reconnecting to RPC"), xe(P.new("Connection closed by " + C.prettyName)));
  }, i.onopen = async () => {
    console.info("[Rpc] Connected to RPC");
    try {
      z = i;
      const s = new Set(_.keys()), c = new Set(n);
      for (let l of s)
        c.delete(l) && s.delete(l);
      s.size || c.size ? k != e ? await b(null, "H", k, [...s.keys()], [...c.keys()]) : await b(null, "H", [...s.keys()], [...c.keys()]) : k != e && await b(null, "H", k), I = !0, _e();
    } catch (s) {
      console.error("[Rpc] Error connecting to RPC: ", s), xe(s), i?.close(4e3, "Error registering types");
      return;
    }
  }, i.binaryType = "arraybuffer", i.onmessage = (s) => {
    const c = s.data;
    typeof c == "string" ? console.log("[Rpc] WebSocket Message:", c) : ht(new We(new Uint8Array(c))).catch((l) => console.warn("[Rpc] Error receiving Packet:", l));
  };
}
a(wt, "connectOnce");
(/* @__PURE__ */ a(async function() {
  for (await Promise.resolve(); ; )
    await new Promise(
      (e) => wt(e)
    );
}, "connectLoop"))();
let k = null;
async function dt(t) {
  k = t;
  try {
    I && await b(null, "N", t);
  } catch (e) {
    console.error(`[Rpc] Error changing name to "${t}":`, e);
  }
}
a(dt, "setName");
function pt(t) {
  return function(e) {
    De.push([t, (n) => n instanceof e, (n, r, i) => r.write(n, i)]), Ue.set(t, (n, r) => e.read(n, r));
  };
}
a(pt, "CustomDynamicType");
function yt(t) {
  return (e) => void Me(t ?? e.prototype.constructor.name, e);
}
a(yt, "RpcProvider");
Promise.resolve().then(() => bt).then((t) => Object.assign(globalThis, t));
class C {
  //Rpc
  static id = v;
  static get prettyName() {
    return C.name != null ? `${C.name} (${C.id})` : C.id;
  }
  static get name() {
    return k;
  }
  static setName = dt;
  //Connection
  static get isConnected() {
    return I;
  }
  static get waitUntilConnected() {
    return gt();
  }
  //Functions
  static createObject = G;
  static createFunction = (e, n) => new O(e, n);
  static registerFunction = Re;
  static unregisterFunction = Ee;
  static callLocal = ct;
  //Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
  static callFunction = b;
  //Call remote function
  static getContext = at;
  static runWithContext = st;
  //Types
  static registerType = Me;
  static unregisterType = rt;
  static generateTypeName = nt;
  static getObjectWithFallback = async (e, ...n) => await b("Rpc", "getObjectWithFallback", e, ...n);
  static checkTypes = async (...e) => await b("Rpc", "checkTypes", ...e);
  static checkType = async (e) => await b("Rpc", "checkType", e);
  static getAllTypes = async () => await b("Rpc", "getAllTypes");
  static getAllConnections = async () => await b("Rpc", "getAllConnections");
  static getRegistrations = async (e = !1) => await b("Rpc", "getRegistrations", e);
  static evalObject = async (e) => await b("Rpc", "evalObject", e);
  static evalString = async (e) => await b("Rpc", "evalString", e);
  static listenCalls = () => b("Rpc", "listenCalls");
  static root = je;
  static getObjectMethods = (e) => (typeof e == "string" ? G(e) : e)[Y]();
  static getObjectExists = (e) => (typeof e == "string" ? G(e) : e)[ie]();
  static getObjectType = (e) => e[A];
  static getMethodSignatures = (e, n, r = !1) => new O(e, n).getMethodSignatures(r);
}
const bt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CustomDynamicType: pt,
  DataInput: We,
  DataOutput: M,
  PendingCall: ve,
  RPC_ROOT: je,
  Rpc: C,
  RpcCallError: ee,
  get RpcConnectionError() {
    return P;
  },
  RpcCustomError: B,
  get RpcDataError() {
    return L;
  },
  RpcError: m,
  get RpcEvalError() {
    return we;
  },
  RpcFunction: O,
  get RpcMetaMethodNotFoundError() {
    return V;
  },
  get RpcMethodNotFoundError() {
    return T;
  },
  RpcObjectExists: ie,
  RpcObjectGetMethodSignatures: re,
  RpcObjectGetMethods: Y,
  RpcObjectType: A,
  RpcProvider: yt,
  get RpcTypeNotFoundError() {
    return F;
  },
  createRemoteObject: G,
  getAsyncIterator: oe,
  listenersMap: W,
  pendingMap: U,
  registerFunction: Re,
  registerReceive: ce,
  rejectCall: E,
  resolveCall: K,
  runReceiveMessage: Q,
  unregisterFunction: Ee
}, Symbol.toStringTag, { value: "Module" }));
export {
  pt as CustomDynamicType,
  We as DataInput,
  M as DataOutput,
  ve as PendingCall,
  je as RPC_ROOT,
  C as Rpc,
  ee as RpcCallError,
  P as RpcConnectionError,
  B as RpcCustomError,
  L as RpcDataError,
  m as RpcError,
  we as RpcEvalError,
  O as RpcFunction,
  V as RpcMetaMethodNotFoundError,
  T as RpcMethodNotFoundError,
  ie as RpcObjectExists,
  re as RpcObjectGetMethodSignatures,
  Y as RpcObjectGetMethods,
  A as RpcObjectType,
  yt as RpcProvider,
  F as RpcTypeNotFoundError,
  G as createRemoteObject,
  oe as getAsyncIterator,
  W as listenersMap,
  U as pendingMap,
  Re as registerFunction,
  ce as registerReceive,
  E as rejectCall,
  K as resolveCall,
  Q as runReceiveMessage,
  Ee as unregisterFunction
};
//# sourceMappingURL=rpc.js.map
