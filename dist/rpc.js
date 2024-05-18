const oe = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
function K(t) {
  return function(e) {
    const [n, r] = oe;
    n.set(t, e), r.set(e, t);
  };
}
var Ce = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function qe(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Ne = { exports: {} }, ae = { exports: {} }, _e;
function ze() {
  return _e || (_e = 1, function(t, e) {
    (function(n, r) {
      t.exports = r();
    })(Ce, function() {
      function n(u) {
        return !isNaN(parseFloat(u)) && isFinite(u);
      }
      function r(u) {
        return u.charAt(0).toUpperCase() + u.substring(1);
      }
      function s(u) {
        return function() {
          return this[u];
        };
      }
      var i = ["isConstructor", "isEval", "isNative", "isToplevel"], o = ["columnNumber", "lineNumber"], c = ["fileName", "functionName", "source"], a = ["args"], p = ["evalOrigin"], l = i.concat(o, c, a, p);
      function f(u) {
        if (u)
          for (var w = 0; w < l.length; w++)
            u[l[w]] !== void 0 && this["set" + r(l[w])](u[l[w]]);
      }
      f.prototype = {
        getArgs: function() {
          return this.args;
        },
        setArgs: function(u) {
          if (Object.prototype.toString.call(u) !== "[object Array]")
            throw new TypeError("Args must be an Array");
          this.args = u;
        },
        getEvalOrigin: function() {
          return this.evalOrigin;
        },
        setEvalOrigin: function(u) {
          if (u instanceof f)
            this.evalOrigin = u;
          else if (u instanceof Object)
            this.evalOrigin = new f(u);
          else
            throw new TypeError("Eval Origin must be an Object or StackFrame");
        },
        toString: function() {
          var u = this.getFileName() || "", w = this.getLineNumber() || "", E = this.getColumnNumber() || "", W = this.getFunctionName() || "";
          return this.getIsEval() ? u ? "[eval] (" + u + ":" + w + ":" + E + ")" : "[eval]:" + w + ":" + E : W ? W + " (" + u + ":" + w + ":" + E + ")" : u + ":" + w + ":" + E;
        }
      }, f.fromString = function(w) {
        var E = w.indexOf("("), W = w.lastIndexOf(")"), je = w.substring(0, E), Ue = w.substring(E + 1, W).split(","), be = w.substring(W + 1);
        if (be.indexOf("@") === 0)
          var ie = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(be, ""), Ke = ie[1], We = ie[2], Ge = ie[3];
        return new f({
          functionName: je,
          args: Ue || void 0,
          fileName: Ke,
          lineNumber: We || void 0,
          columnNumber: Ge || void 0
        });
      };
      for (var h = 0; h < i.length; h++)
        f.prototype["get" + r(i[h])] = s(i[h]), f.prototype["set" + r(i[h])] = /* @__PURE__ */ function(u) {
          return function(w) {
            this[u] = !!w;
          };
        }(i[h]);
      for (var g = 0; g < o.length; g++)
        f.prototype["get" + r(o[g])] = s(o[g]), f.prototype["set" + r(o[g])] = /* @__PURE__ */ function(u) {
          return function(w) {
            if (!n(w))
              throw new TypeError(u + " must be a Number");
            this[u] = Number(w);
          };
        }(o[g]);
      for (var d = 0; d < c.length; d++)
        f.prototype["get" + r(c[d])] = s(c[d]), f.prototype["set" + r(c[d])] = /* @__PURE__ */ function(u) {
          return function(w) {
            this[u] = String(w);
          };
        }(c[d]);
      return f;
    });
  }(ae)), ae.exports;
}
(function(t, e) {
  (function(n, r) {
    t.exports = r(ze());
  })(Ce, function(r) {
    var s = /(^|@)\S+:\d+/, i = /^\s*at .*(\S+:\d+|\(native\))/m, o = /^(eval@)?(\[native code])?$/;
    return {
      /**
       * Given an Error object, extract the most information from it.
       *
       * @param {Error} error object
       * @return {Array} of StackFrames
       */
      parse: function(a) {
        if (typeof a.stacktrace < "u" || typeof a["opera#sourceloc"] < "u")
          return this.parseOpera(a);
        if (a.stack && a.stack.match(i))
          return this.parseV8OrIE(a);
        if (a.stack)
          return this.parseFFOrSafari(a);
        throw new Error("Cannot parse given Error object");
      },
      // Separate line and column numbers from a string of the form: (URI:Line:Column)
      extractLocation: function(a) {
        if (a.indexOf(":") === -1)
          return [a];
        var p = /(.+?)(?::(\d+))?(?::(\d+))?$/, l = p.exec(a.replace(/[()]/g, ""));
        return [l[1], l[2] || void 0, l[3] || void 0];
      },
      parseV8OrIE: function(a) {
        var p = a.stack.split(`
`).filter(function(l) {
          return !!l.match(i);
        }, this);
        return p.map(function(l) {
          l.indexOf("(eval ") > -1 && (l = l.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, ""));
          var f = l.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, ""), h = f.match(/ (\(.+\)$)/);
          f = h ? f.replace(h[0], "") : f;
          var g = this.extractLocation(h ? h[1] : f), d = h && f || void 0, u = ["eval", "<anonymous>"].indexOf(g[0]) > -1 ? void 0 : g[0];
          return new r({
            functionName: d,
            fileName: u,
            lineNumber: g[1],
            columnNumber: g[2],
            source: l
          });
        }, this);
      },
      parseFFOrSafari: function(a) {
        var p = a.stack.split(`
`).filter(function(l) {
          return !l.match(o);
        }, this);
        return p.map(function(l) {
          if (l.indexOf(" > eval") > -1 && (l = l.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1")), l.indexOf("@") === -1 && l.indexOf(":") === -1)
            return new r({
              functionName: l
            });
          var f = /((.*".+"[^@]*)?[^@]*)(?:@)/, h = l.match(f), g = h && h[1] ? h[1] : void 0, d = this.extractLocation(l.replace(f, ""));
          return new r({
            functionName: g,
            fileName: d[0],
            lineNumber: d[1],
            columnNumber: d[2],
            source: l
          });
        }, this);
      },
      parseOpera: function(a) {
        return !a.stacktrace || a.message.indexOf(`
`) > -1 && a.message.split(`
`).length > a.stacktrace.split(`
`).length ? this.parseOpera9(a) : a.stack ? this.parseOpera11(a) : this.parseOpera10(a);
      },
      parseOpera9: function(a) {
        for (var p = /Line (\d+).*script (?:in )?(\S+)/i, l = a.message.split(`
`), f = [], h = 2, g = l.length; h < g; h += 2) {
          var d = p.exec(l[h]);
          d && f.push(new r({
            fileName: d[2],
            lineNumber: d[1],
            source: l[h]
          }));
        }
        return f;
      },
      parseOpera10: function(a) {
        for (var p = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i, l = a.stacktrace.split(`
`), f = [], h = 0, g = l.length; h < g; h += 2) {
          var d = p.exec(l[h]);
          d && f.push(
            new r({
              functionName: d[3] || void 0,
              fileName: d[2],
              lineNumber: d[1],
              source: l[h]
            })
          );
        }
        return f;
      },
      // Opera 10.65+ Error.stack very similar to FF/Safari
      parseOpera11: function(a) {
        var p = a.stack.split(`
`).filter(function(l) {
          return !!l.match(s) && !l.match(/^Error created at/);
        }, this);
        return p.map(function(l) {
          var f = l.split("@"), h = this.extractLocation(f.pop()), g = f.shift() || "", d = g.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0, u;
          g.match(/\(([^)]*)\)/) && (u = g.replace(/^[^(]+\(([^)]*)\)$/, "$1"));
          var w = u === void 0 || u === "[arguments not available]" ? void 0 : u.split(",");
          return new r({
            functionName: d,
            args: w,
            fileName: h[0],
            lineNumber: h[1],
            columnNumber: h[2],
            source: l
          });
        }, this);
      }
    };
  });
})(Ne);
var Ve = Ne.exports;
const J = /* @__PURE__ */ qe(Ve);
function ce(t) {
  return t.replaceAll("\r", "").replaceAll(/^\n+|\n+$/g, "").replaceAll(/^  +/gm, "	");
}
function X(t) {
  let e = "";
  for (let n of t) {
    if (n.functionName?.includes("$RPC_MARKER_BEGIN$"))
      break;
    e += `
	at ` + n;
  }
  return e;
}
function Oe(t) {
  return t === void 0 ? "" : t instanceof m ? `
caused by: ` + t.toString() : t instanceof Error ? `
caused by: ` + ce(t.toString()) + X(J.parse(t)) + Oe(t.cause) : `
caused by: ` + ce(t?.toString() ?? "null");
}
function Te(t, e) {
  return (t === m || Te(t.__proto__, e)) && e[0].functionName?.replace(/^new /, "") === t.name ? (e.shift(), !0) : !1;
}
class m extends Error {
  //public get type(){return this.name}
  from;
  data = {};
  _ownStack = [];
  get stackTrace() {
    let e = this._stackTrace;
    return e += X(this._ownStack), e += this._causes, e.replaceAll(/^\n+/g, "");
  }
  _stackTrace = "";
  _appendStack = !1;
  _causes = "";
  constructor(...e) {
    let n = null, r = null, s = null, i = {}, o;
    switch (e.length) {
      case 1:
        [r] = e;
        break;
      case 2:
        [r, o] = e;
        break;
      case 4:
        [r, n, r, s] = e;
        break;
      case 5:
        e[4] instanceof m ? [r, n, r, s, o] = e : [r, n, r, s, i] = e;
        break;
      case 6:
        [r, n, r, s, i, o] = e;
        break;
      default:
        throw new Error("Invalid arg count");
    }
    o != null ? super(r ?? void 0, { cause: o }) : super(r ?? void 0), this.name = this.constructor.name, this.from = n ?? b.prettyName;
    const c = oe[1].get(this.constructor);
    if (c != null && (this.data.$type = c), Object.assign(this.data, i ?? {}), s == null)
      this._appendStack = !0, this._ownStack = J.parse(this), Te(this.constructor, this._ownStack);
    else {
      this._stackTrace = `
` + ce(s);
      const a = this._stackTrace.indexOf(`
caused by: `);
      a != -1 && (this._causes += this._stackTrace.substring(a), this._stackTrace = this._stackTrace.substring(0, a));
    }
    this._causes += Oe(o), this.stack = this.toString();
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
    const n = e.readString(), r = e.readString() ?? "???", s = e.readString(), i = e.readString() ?? "";
    let o;
    try {
      o = JSON.parse(e.readString() ?? "null");
    } catch (c) {
      if (c instanceof RangeError)
        o = { $info: "JsonData was not included, due to an old PlayifyRpc version" };
      else
        throw c;
    }
    return m.create(n, r, s, i, o);
  }
  static create(e, n, r, s, i) {
    const o = i?.$type, c = oe[0].get(o) ?? m;
    return new c(e, n, r, s, i);
  }
  static wrapAndFreeze(e) {
    return e instanceof m ? (e._appendStack && (e._appendStack = !1, e._stackTrace += X(e._ownStack), e._ownStack = [], e.stack = e.toString()), e) : new m(
      e.name,
      e instanceof m ? e.from : null,
      e.message,
      X(J.parse(e)).substring(1),
      {},
      e.cause
    );
  }
  unfreeze(e, n) {
    return this._appendStack ? this : (this._appendStack = !0, this._ownStack = J.parse(e).slice(n), this.stack = this.toString(), this);
  }
  append(e, n, r) {
    return this._stackTrace += `
	rpc ` + (r == null ? "<<callLocal>>" : (e ?? "<<null>>") + "." + (n ?? "<<null>>") + "(" + r.map((s) => JSON.stringify(s)).join(",") + ")"), this.stack = this.toString(), this;
  }
}
const ke = globalThis?.process?.versions?.node != null, ve = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", Se = () => Date.now().toString(36) + Array(10).fill(void 0).map(() => ve[Math.floor(Math.random() * ve.length)]).join("");
let _;
if (ke)
  try {
    process?.versions.bun ? _ = "bun@" + require("os").hostname() + "@" + process.pid : _ = "node@" + process.binding("os").getHostname() + "@" + process.pid;
  } catch {
    _ = "node-alternative@" + process.platform + ":" + process.arch + "@" + process.pid;
  }
else
  "document" in globalThis ? _ = "web@" + document.location + "#" + Se() : _ = "js@" + Se();
var Le = Object.defineProperty, He = Object.getOwnPropertyDescriptor, Je = (t, e, n) => e in t ? Le(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, V = (t, e, n, r) => {
  for (var s = r > 1 ? void 0 : r ? He(e, n) : e, i = t.length - 1, o; i >= 0; i--)
    (o = t[i]) && (s = (r ? o(e, n, s) : o(s)) || s);
  return r && s && Le(e, n, s), s;
}, te = (t, e, n) => (Je(t, typeof e != "symbol" ? e + "" : e, n), n);
const G = (t) => t == null ? "null" : '"' + t + '"';
class H extends m {
}
let x = class extends H {
};
te(x, "new", (t) => new x(
  null,
  null,
  `Type ${G(t)} does not exist`,
  "",
  { type: t }
));
x = V([
  K("$type")
], x);
let $ = class extends H {
};
te($, "new", (t, e) => new $(
  null,
  null,
  `Method ${G(e)} does not exist on type ${G(t)}`,
  "",
  { type: t, method: e }
));
$ = V([
  K("$method")
], $);
let U = class extends $ {
};
te(U, "new", (t, e) => new U(
  null,
  null,
  `Meta-Method ${G(e)} does not exist on type ${G(t)}`,
  "",
  { type: t, method: null, meta: e }
));
U = V([
  K("$method-meta")
], U);
let O = class extends H {
};
te(O, "new", (t) => new O(null, null, t, ""));
O = V([
  K("$connection")
], O);
let le = class extends H {
};
le = V([
  K("$eval")
], le);
const we = /* @__PURE__ */ Object.create(null), S = /* @__PURE__ */ new Map();
S.set("$" + _, we);
async function xe(t, e) {
  if (!S.has(t)) {
    S.set(t, e);
    try {
      A && await y(null, "+", t);
    } catch (n) {
      console.warn(n), S.delete(t);
    }
  }
}
async function Xe(t) {
  if (S.has(t)) {
    try {
      A && await y(null, "-", t);
    } catch (e) {
      console.warn(e);
    }
    S.delete(t);
  }
}
async function Ee(t) {
  const e = t[z];
  return e ? await e.call(t) : Object.getOwnPropertyNames(t).filter((n) => typeof t[n] == "function");
}
async function $e(t, e, n, ...r) {
  if (n != null) {
    let i = t[n];
    if (i == null) {
      let c = (await Ee(t)).find((a) => a.toLowerCase() == n.toLowerCase());
      c != null && (i = t[c]);
    }
    const o = {}[n];
    if (i == null || i === o)
      throw $.new(e, n);
    try {
      return await {
        async $RPC_MARKER_BEGIN$() {
          return await i.call(t, ...r);
        }
      }.$RPC_MARKER_BEGIN$();
    } catch (c) {
      throw m.wrapAndFreeze(c);
    }
  }
  const s = r.length == 0 ? null : r[0];
  switch (s) {
    case "M":
      return Ee(t);
    default:
      throw U.new(e, s);
  }
}
class de {
  [Symbol.toStringTag] = "PendingCall";
  finished = !1;
  promise;
  constructor(e, n) {
    try {
      throw new Error();
    } catch (r) {
      this.promise = new Promise((s, i) => {
        I.set(this, (o) => {
          I.delete(this), v.delete(this), this.finished = !0, s(o), Z(n);
        }), v.set(this, (o) => {
          I.delete(this), v.delete(this), this.finished = !0, i(o instanceof m ? o.unfreeze(r, e) : o), Z(n);
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
    return re(this, e);
  }
  cancel() {
  }
  //overridden by callFunction and callLocal
  [Symbol.asyncIterator]() {
    return ne(this);
  }
}
function ne(t) {
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
const I = /* @__PURE__ */ new WeakMap(), v = /* @__PURE__ */ new WeakMap(), M = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap();
function re(t, e) {
  if (B.has(t))
    B.get(t).push(e);
  else {
    B.set(t, [e]);
    const n = M.get(t) ?? [];
    for (let r of n)
      try {
        e(...r);
      } catch (s) {
        console.warn("Error receiving pending: ", s);
      }
  }
  return t;
}
function q(t, e) {
  if (!t.finished)
    if (B.has(t))
      for (let n of B.get(t))
        try {
          n(...e);
        } catch (r) {
          console.warn("Error receiving: ", r);
        }
    else
      M.has(t) ? M.set(t, [...M.get(t), e]) : M.set(t, [e]);
}
let C = null;
function Qe(t, e) {
  const n = C;
  C = e;
  try {
    return t();
  } finally {
    C = n;
  }
}
function Ye() {
  if (C == null)
    throw new Error("FunctionCallContext not available");
  return C;
}
let Ze = 0;
function y(t, e, ...n) {
  if (t != null) {
    const c = S.get(t);
    if (c)
      return Ae($e.bind(null, c, t, e, ...n), t, e, n, 3);
  }
  const r = [], s = new de(2, r), i = new L(), o = Ze++;
  try {
    i.writeByte(Q.FunctionCall), i.writeLength(o), i.writeString(t), i.writeString(e), i.writeArray(n, (c) => i.writeDynamic(c, r));
  } catch (c) {
    return v.get(s)?.(c), s;
  }
  return A || t == null && j != null ? (s.sendMessage = (...c) => {
    if (s.finished)
      return s;
    const a = new L();
    a.writeByte(Q.MessageToExecutor), a.writeLength(o);
    const p = [];
    return a.writeArray(c, (l) => a.writeDynamic(l, p)), r.push(...p), D(a), s;
  }, s.cancel = () => {
    if (s.finished)
      return;
    const c = new L();
    c.writeByte(Q.FunctionCancel), c.writeLength(o), D(c);
  }, rt(o, s, i), s) : (v.get(s)?.(O.new("Not connected")), s);
}
function et(t) {
  return Ae(t, null, null, null, 3);
}
function Ae(t, e, n, r, s) {
  const i = new de(s, []), o = new AbortController(), c = {
    type: e,
    method: n,
    sendMessage: (...a) => (i.finished || q(i, a), c),
    get finished() {
      return i.finished;
    },
    promise: i,
    addMessageListener: (a) => re(c, a),
    cancelToken: o.signal,
    cancelSelf: () => o.abort(),
    [Symbol.asyncIterator]: () => ne(c)
  };
  return i.sendMessage = (...a) => (i.finished || q(c, a), i), i.cancel = () => i.finished || c.cancelSelf(), Pe(t, c, I.get(i), v.get(i), e, n, r), i;
}
async function Pe(t, e, n, r, s, i, o) {
  try {
    let c;
    const a = C;
    C = e;
    try {
      c = await {
        async $RPC_MARKER_BEGIN$() {
          return await t();
        }
      }.$RPC_MARKER_BEGIN$();
    } finally {
      C = a;
    }
    n?.(await c);
  } catch (c) {
    r?.(m.wrapAndFreeze(c).append(s, i, o));
  }
}
const N = class extends function(n) {
  return Object.setPrototypeOf(n, new.target.prototype);
} {
  constructor(e, n) {
    super(y.bind(null, e, n)), this.type = e, this.method = n;
  }
  toString() {
    return `rpc (...params) => ${this.type ?? "null"}.${this.method}(...params)`;
  }
};
let tt = Date.now();
const ue = /* @__PURE__ */ new WeakMap();
function pe(t) {
  if (t instanceof N)
    return t;
  const e = ue.get(t);
  if (e != null)
    return new N("$" + _, e);
  const n = (tt++).toString(16);
  we[n] = t, ue.set(t, n);
  const r = "$" + _;
  return new N(r, n);
}
function ye(t) {
  const e = "$" + _;
  if (t.type != e)
    throw new Error("Can't unregister RemoteFunction, that was not registered locally");
  delete we[t.method], ue.delete(t);
}
const k = Symbol("RpcObjectType"), Y = Symbol("RpcObjectExists"), z = Symbol("RpcObjectGetMethods");
function se(t, e = new class {
  [k] = t;
}()) {
  const n = /* @__PURE__ */ new Map();
  return new Proxy(e, {
    get(r, s) {
      if (s == k)
        return t;
      if (s == Y)
        return () => y(null, "E", t);
      if (s == z)
        return () => y(t, null, "M");
      if (typeof s != "string" || s == "then")
        return e[s];
      if (n.has(s))
        return n.get(s);
      const i = new N(
        t,
        s
      );
      return n.set(s, i), i;
    },
    construct(r, s) {
      return new r(...s);
    },
    has(r, s) {
      return s == k || s == z || s == Y || s in e;
    }
  });
}
const Fe = new Proxy({}, {
  get: (t, e) => typeof e == "string" ? se(e) : void 0,
  has: (t, e) => typeof e == "string" && e != "then"
}), Me = [], Ie = /* @__PURE__ */ new Map();
function fe(t, e) {
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
        for (let s = 0; s < (n - 2) / 4; s++) {
          const i = t.readString();
          r[i] = fe(t, e);
        }
        return r;
      }
      case 3: {
        const r = new Array((n - 3) / 4);
        e.push(r);
        for (let s = 0; s < r.length; s++)
          r[s] = fe(t, e);
        return r;
      }
    }
    throw new Error("Unreachable code reached");
  } else if (n >= 128) {
    const r = new TextDecoder().decode(t.readBuffer(n - 128)), s = Ie.get(r);
    if (s)
      return s(t, e);
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
        const c = t.readString(), a = t.readByte();
        return new RegExp(
          c,
          "g" + (a & 1 ? "i" : "") + (a & 2 ? "m" : "")
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
        const s = t.readString();
        if (s == null)
          throw new Error("Type can't be null");
        const i = t.readString();
        if (i == null)
          throw new Error("Method can't be null");
        const o = new N(s, i);
        return e.push(o), o;
      default:
        throw new Error("Unknown data type number: " + n);
    }
}
function he(t, e, n) {
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
  else if (typeof e == "object" && k in e)
    t.writeLength(79), t.writeString(e[k]);
  else if (typeof e == "function") {
    n.push(e), t.writeLength(70);
    let r;
    e instanceof N ? r = e : (r = pe(e), Be.set(e, () => ye(r))), t.writeString(r.type), t.writeString(r.method);
  } else if (n.includes(e))
    t.writeLength(-(n.indexOf(e) * 4));
  else if (typeof e == "string") {
    const r = new TextEncoder().encode(e);
    t.writeLength(-(r.length * 4 + 1)), t.writeBytes(r);
  } else if (Array.isArray(e)) {
    n.push(e), t.writeLength(-(e.length * 4 + 3));
    for (let r of e)
      he(t, r, n);
  } else {
    for (let [r, s, i] of Me) {
      if (!s(e))
        continue;
      const o = new TextEncoder().encode(r);
      t.writeLength(o.length + 128), t.writeBytes(o), i(t, e, n);
      return;
    }
    if (typeof e == "object") {
      n.push(e);
      const r = Object.entries(e);
      t.writeLength(-(r.length * 4 + 2));
      for (let [s, i] of r)
        t.writeString(s), he(t, i, n);
    } else
      throw new Error("Unknown type for " + e);
  }
}
const Be = /* @__PURE__ */ new WeakMap();
function Z(t) {
  for (let e of t)
    Be.get(e)?.();
}
class L {
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
    he(this, e, n);
  }
}
const R = /* @__PURE__ */ new Map(), P = /* @__PURE__ */ new Map();
function nt(t) {
  for (let e of R.values())
    v.get(e)?.(t);
  R.clear();
  for (let e of P.values())
    e.cancelSelf();
}
function D(t) {
  if (j == null)
    throw O.new("Not connected");
  j.send(t.toBuffer());
}
function rt(t, e, n) {
  R.set(t, e);
  try {
    D(n);
  } catch (r) {
    v.get(e)?.(r);
  }
}
var Q = /* @__PURE__ */ ((t) => (t[t.FunctionCall = 0] = "FunctionCall", t[t.FunctionSuccess = 1] = "FunctionSuccess", t[t.FunctionError = 2] = "FunctionError", t[t.FunctionCancel = 3] = "FunctionCancel", t[t.MessageToExecutor = 4] = "MessageToExecutor", t[t.MessageToCaller = 5] = "MessageToCaller", t))(Q || {});
async function st(t) {
  try {
    switch (t.readByte()) {
      case 0: {
        const n = t.readLength(), r = [];
        let s = !1, i = null, o = null;
        const c = new Promise((a, p) => {
          i = (l) => {
            a(l), s = !0;
            const f = new L();
            f.writeByte(
              1
              /* FunctionSuccess */
            ), f.writeLength(n), f.writeDynamic(l), D(f), P.delete(n), Z(r);
          }, o = (l) => {
            p(l), s = !0;
            const f = new L();
            f.writeByte(
              2
              /* FunctionError */
            ), f.writeLength(n), f.writeError(l), D(f), P.delete(n), Z(r);
          };
        });
        c.catch(() => {
        });
        try {
          const a = t.readString();
          if (a == null)
            throw x.new(null);
          const p = S.get(a);
          if (!p)
            throw x.new(a);
          const l = t.readString(), f = t.readArray(() => t.readDynamic(r)) ?? [], h = new AbortController(), g = {
            type: a,
            method: l,
            get finished() {
              return s;
            },
            promise: c,
            sendMessage(...d) {
              if (s)
                return g;
              const u = new L();
              u.writeByte(
                5
                /* MessageToCaller */
              ), u.writeLength(n);
              const w = [];
              return u.writeArray(d, (E) => u.writeDynamic(E, w)), r.push(...w), D(u), g;
            },
            addMessageListener(d) {
              return re(g, d), g;
            },
            cancelToken: h.signal,
            cancelSelf: () => h.abort(),
            [Symbol.asyncIterator]: () => ne(g)
          };
          P.set(n, g), await Pe($e.bind(null, p, a, l, ...f), g, i, o, a, l, f);
        } catch (a) {
          o(a);
        }
        break;
      }
      case 1: {
        const n = t.readLength(), r = R.get(n);
        if (r == null) {
          console.warn(`${b.prettyName} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          I.get(r)?.(t.readDynamic());
        } catch (s) {
          v.get(r)?.(s);
        } finally {
          R.delete(n);
        }
        break;
      }
      case 2: {
        const n = t.readLength(), r = R.get(n);
        if (r == null) {
          console.warn(`${b.prettyName} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          throw t.readError();
        } catch (s) {
          v.get(r)?.(s);
        } finally {
          R.delete(n);
        }
        break;
      }
      case 3: {
        const n = t.readLength();
        let r = P.get(n);
        if (!r) {
          console.warn(`${b.prettyName} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        r.cancelSelf();
        break;
      }
      case 4: {
        const n = t.readLength();
        let r = P.get(n);
        if (!r) {
          console.warn(`${b.prettyName} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        const s = [], i = t.readArray(() => t.readDynamic(s)) ?? [];
        q(r, i);
        break;
      }
      case 5: {
        const n = t.readLength();
        let r = R.get(n);
        if (!r) {
          console.warn(`${b.prettyName} has no ActiveRequest with id: ${n}`);
          break;
        }
        const s = [], i = t.readArray(() => t.readDynamic(s)) ?? [];
        q(r, i);
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
}
class De {
  _buf;
  _data;
  _pos;
  _count;
  constructor(e, n = 0, r = e.length) {
    this._buf = e, this._data = new DataView(e.buffer), this._pos = n, this._count = n + r;
  }
  readFully(e, n = 0, r = e.length) {
    let s = this._pos;
    if (this._count - s < r)
      throw new RangeError("not enough bytes available to use readFully");
    for (let o = n; o < n + r; o++)
      e[o] = this._buf[s++];
    this._pos = s;
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
    for (let s = 0; s < n; s++)
      r[s] = e.call(this);
    return r;
  }
  readError() {
    return m.read(this);
  }
  readDynamic(e = []) {
    return fe(this, e);
  }
}
let A = !1, me, ge, ee = new Promise((t, e) => [me, ge] = [t, e]);
ee.catch(() => {
});
async function it() {
  for (; ; )
    if (await ee.then(() => !0, () => !1))
      return;
}
let F;
if (ke) {
  const t = "RPC_URL" in globalThis ? globalThis.RPC_URL : process.env.RPC_URL, e = "RPC_TOKEN" in globalThis ? globalThis.RPC_TOKEN : process.env.RPC_TOKEN;
  t ? F = async (n) => {
    const r = new URL(t);
    return r.search = n.toString(), new (await import("ws")).WebSocket(r, e == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + e
      }
    });
  } : (console.warn("RPC_URL is not defined => RPC will not connect"), F = async () => ({}));
} else if ("document" in globalThis)
  F = async (t) => new WebSocket("ws" + document.location.origin.substring(4) + "/rpc?" + t);
else {
  const t = "RPC_URL" in globalThis ? globalThis.RPC_URL : process.env.RPC_URL, e = "RPC_TOKEN" in globalThis ? globalThis.RPC_TOKEN : process.env.RPC_TOKEN;
  t ? F = async (n) => {
    const r = new URL(t);
    return r.search = n.toString(), new WebSocket(r, e == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + e
      }
    });
  } : (console.warn("RPC_URL is not defined => RPC will not connect"), F = async () => ({}));
}
function Re(t) {
  const e = ge;
  ee = new Promise((n, r) => [me, ge] = [n, r]), ee.catch(() => {
  }), e(t), nt(t);
}
let j = null;
async function at(t) {
  let e = T, n = /* @__PURE__ */ new Set();
  const r = new URLSearchParams();
  r.set("id", _), n.add("$" + _), e != null && r.set("name", e);
  for (let i of S.keys())
    n.has(i) || (n.add(i), r.append("type", i));
  const s = await F(r);
  s.onclose = () => {
    setTimeout(t, 1e3), j && (j = null, A = !1, console.log("Reconnecting to RPC"), Re(O.new("Connection closed by " + b.prettyName)));
  }, s.onopen = async () => {
    console.log("Connected to RPC");
    try {
      j = s;
      const i = new Set(S.keys()), o = new Set(n);
      for (let c of i)
        o.delete(c) && i.delete(c);
      i.size || o.size ? T != e ? await y(null, "H", T, [...i.keys()], [...o.keys()]) : await y(null, "H", [...i.keys()], [...o.keys()]) : T != e && await y(null, "H", T), A = !0, me();
    } catch (i) {
      console.error("Error registering types: ", i), Re(i), s?.close(4e3, "Error registering types");
      return;
    }
  }, s.binaryType = "arraybuffer", s.onmessage = (i) => {
    const o = i.data;
    typeof o == "string" ? console.log(o) : st(new De(new Uint8Array(o)));
  };
}
(async function() {
  for (await Promise.resolve(); ; )
    await new Promise(
      (e) => at(e)
    );
})();
let T = null;
async function ot(t) {
  T = t;
  try {
    A && await y(null, "N", t);
  } catch (e) {
    console.error(e);
  }
}
function ct(t) {
  return function(e) {
    Me.push([t, (n) => n instanceof e, (n, r, s) => r.write(n, s)]), Ie.set(t, (n, r) => e.read(n, r));
  };
}
function lt(t) {
  return function(e) {
    xe(t ?? e.prototype.constructor.name, e).catch(console.error);
  };
}
Promise.resolve().then(() => ut).then((t) => Object.assign(globalThis, t));
class b {
  //Rpc
  static id = _;
  static get prettyName() {
    return b.name != null ? `${b.name} (${b.id})` : b.id;
  }
  static get name() {
    return T;
  }
  static setName = ot;
  //Connection
  static get isConnected() {
    return A;
  }
  static get waitUntilConnected() {
    return it();
  }
  //Functions
  static createObject = se;
  static createFunction = (e, n) => new N(e, n);
  static registerFunction = pe;
  static unregisterFunction = ye;
  static callLocal = et;
  //Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
  static callFunction = y;
  //Call remote function
  static getContext = Ye;
  static runWithContext = Qe;
  //Types
  static registerType = xe;
  static unregisterType = Xe;
  static getObjectWithFallback = async (e, ...n) => await y("Rpc", "getObjectWithFallback", e, ...n);
  static checkTypes = async (...e) => await y("Rpc", "checkTypes", ...e);
  static checkType = async (e) => await y("Rpc", "checkType", e);
  static getAllTypes = async () => await y("Rpc", "getAllTypes");
  static getAllConnections = async () => await y("Rpc", "getAllConnections");
  static getRegistrations = async (e = !1) => await y("Rpc", "getRegistrations", e);
  static evalObject = async (e) => await y("Rpc", "evalObject", e);
  static evalString = async (e) => await y("Rpc", "evalString", e);
  static listenCalls = () => y("Rpc", "listenCalls");
  static root = Fe;
  static type = k;
  static exists = Y;
  static getMethods = z;
}
const ut = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CustomDynamicType: ct,
  DataInput: De,
  DataOutput: L,
  PendingCall: de,
  RPC_ROOT: Fe,
  Rpc: b,
  RpcCallError: H,
  get RpcConnectionError() {
    return O;
  },
  RpcCustomError: K,
  RpcError: m,
  get RpcEvalError() {
    return le;
  },
  RpcFunction: N,
  get RpcMetaMethodNotFoundError() {
    return U;
  },
  get RpcMethodNotFoundError() {
    return $;
  },
  RpcObjectExists: Y,
  RpcObjectGetMethods: z,
  RpcObjectType: k,
  RpcProvider: lt,
  get RpcTypeNotFoundError() {
    return x;
  },
  createRemoteObject: se,
  getAsyncIterator: ne,
  listenersMap: B,
  pendingMap: M,
  registerFunction: pe,
  registerReceive: re,
  rejectCall: v,
  resolveCall: I,
  runReceiveMessage: q,
  unregisterFunction: ye
}, Symbol.toStringTag, { value: "Module" }));
export {
  ct as CustomDynamicType,
  De as DataInput,
  L as DataOutput,
  de as PendingCall,
  Fe as RPC_ROOT,
  b as Rpc,
  H as RpcCallError,
  O as RpcConnectionError,
  K as RpcCustomError,
  m as RpcError,
  le as RpcEvalError,
  N as RpcFunction,
  U as RpcMetaMethodNotFoundError,
  $ as RpcMethodNotFoundError,
  Y as RpcObjectExists,
  z as RpcObjectGetMethods,
  k as RpcObjectType,
  lt as RpcProvider,
  x as RpcTypeNotFoundError,
  se as createRemoteObject,
  ne as getAsyncIterator,
  B as listenersMap,
  M as pendingMap,
  pe as registerFunction,
  re as registerReceive,
  v as rejectCall,
  I as resolveCall,
  q as runReceiveMessage,
  ye as unregisterFunction
};
//# sourceMappingURL=rpc.js.map
