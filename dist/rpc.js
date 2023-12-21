class x extends Error {
  name;
  from;
  stackTrace;
  constructor(e, n, r, s) {
    typeof s == "string" ? (super(r), this.stackTrace = s) : s ? (super(r, { cause: s }), this.stackTrace = this.stack.substring(this.stack.indexOf(`
`) + 1) + `
caused by: ` + s.stack) : (super(r), this.stackTrace = this.stack.substring(this.stack.indexOf(`
`) + 1)), this.name = e ?? "UnknownRemoteError", this.from = n, this.stack = this.name + "(" + n + ")", r != null && (this.stack += ": " + r), s != null && (this.stack += `
`, this.stackTrace = this.stackTrace.replaceAll(/^  +/gm, "	"), this.stack += this.stackTrace);
  }
}
const X = globalThis?.process?.versions?.node != null;
let d;
if (X)
  try {
    d = "node@" + process.binding("os").getHostname() + "@" + process.pid;
  } catch {
    d = "node@" + process.platform + ":" + process.arch + "@" + process.pid;
  }
else if ("document" in globalThis)
  d = "web@" + document.location + "@" + Date.now().toString(36) + "X" + Math.random().toString(36).substring(2);
else
  throw new Error("Unknown Platform");
const G = /* @__PURE__ */ Object.create(null), _ = /* @__PURE__ */ new Map();
_.set("$" + d, G);
async function re(t, e) {
  if (!_.has(t) && (_.set(t, e), S))
    try {
      await w(null, "+", t);
    } catch (n) {
      console.log(n);
    }
}
async function fe(t) {
  if (_.has(t)) {
    if (S)
      try {
        await w(null, "-", t);
      } catch (e) {
        console.log(e);
      }
    _.delete(t);
  }
}
class Q {
  [Symbol.toStringTag] = "PendingCall";
  finished = !1;
  promise;
  constructor() {
    this.promise = new Promise((e, n) => {
      L.set(this, (r) => {
        e(r), this.finished = !0;
      }), l.set(this, (r) => {
        n(r), this.finished = !0;
      });
    });
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
  // noinspection JSUnusedLocalSymbols
  sendMessage(...e) {
    return this;
  }
  addMessageListener(e) {
    return U(this, e), this;
  }
  cancel() {
  }
  //overridden by callFunction and callLocal
  [Symbol.asyncIterator]() {
    return $(this);
  }
}
function $(t) {
  let e = [], n = [], r = t.finished;
  return t.promise.finally(() => {
    r = !0;
    for (let s of n)
      s(void 0);
  }), t.addMessageListener((...s) => e.push(s)), {
    async next() {
      if (r || t.finished)
        return { done: !0, value: void 0 };
      if (e.length)
        return { done: !1, value: e.shift() };
      const s = await new Promise((i) => n.push(i));
      return s == null ? { done: !0, value: void 0 } : { done: !1, value: s[0] };
    }
  };
}
const L = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap();
function U(t, e) {
  if (R.has(t))
    R.get(t).push(e);
  else {
    R.set(t, [e]);
    const n = B.get(t) ?? [];
    for (let r of n)
      try {
        e(...r);
      } catch (s) {
        console.warn("Error receiving pending: ", s);
      }
  }
}
function F(t, e) {
  if (!t.finished)
    if (R.has(t))
      for (let n of R.get(t))
        try {
          n(...e);
        } catch (r) {
          console.warn("Error receiving: ", r);
        }
    else
      B.has(t) ? B.set(t, [...B.get(t), e]) : B.set(t, [e]);
}
let I = null;
function se(t, e) {
  const n = I;
  I = e;
  try {
    return t();
  } finally {
    I = n;
  }
}
function ge() {
  if (I == null)
    throw new Error("FunctionCallContext not available");
  return I;
}
let we = 0;
function w(t, e, ...n) {
  if (t != null) {
    const c = _.get(t);
    if (c)
      return ie(t, e, () => c[e](...n));
  }
  const r = new Q(), s = [];
  r.finally(() => H(s));
  const i = new E(), o = we++;
  try {
    i.writeByte(T.FunctionCall), i.writeLength(o), i.writeString(t), i.writeString(e), i.writeArray(n, (c) => i.writeDynamic(c, s));
  } catch (c) {
    return l.get(r)?.(c), r;
  }
  return S || t == null && D != null ? (r.sendMessage = (...c) => {
    if (r.finished)
      return r;
    const a = new E();
    a.writeByte(T.MessageToExecutor), a.writeLength(o);
    const y = [];
    return a.writeArray(c, (h) => a.writeDynamic(h, y)), s.push(...y), A(a), r;
  }, r.cancel = () => {
    if (r.finished)
      return;
    const c = new E();
    c.writeByte(T.FunctionCancel), c.writeLength(o), A(c);
  }, be(o, r, i), r) : (l.get(r)?.(new Error("Not connected")), r);
}
function de(t) {
  return ie(null, null, t);
}
function ie(t, e, n) {
  const r = new Q(), s = new AbortController(), i = {
    type: t,
    method: e,
    sendMessage: (...o) => (r.finished || F(r, o), i),
    get finished() {
      return r.finished;
    },
    promise: r,
    addMessageListener: (o) => (U(i, o), i),
    cancelToken: s.signal,
    cancel: () => s.abort(),
    [Symbol.asyncIterator]: () => $(i)
  };
  r.sendMessage = (...o) => (r.finished || F(i, o), r), r.cancel = () => r.finished || i.cancel();
  try {
    const o = se(n, i);
    o instanceof Promise ? o.then((c) => L.get(r)?.(c), (c) => l.get(r)?.(c)) : L.get(r)?.(o);
  } catch (o) {
    l.get(r)?.(o);
  }
  return r;
}
const m = class extends function(n) {
  return Object.setPrototypeOf(n, new.target.prototype);
} {
  constructor(e, n) {
    super(w.bind(null, e, n)), this.type = e, this.method = n;
  }
  toString() {
    return `rpc (...params) => ${this.type ?? "null"}.${this.method}(...params)`;
  }
};
let ye = Date.now();
const P = /* @__PURE__ */ new WeakMap();
function Y(t) {
  if (t instanceof m)
    return t;
  const e = P.get(t);
  if (e != null)
    return new m("$" + d, e);
  const n = (ye++).toString(16);
  G[n] = t, P.set(t, n);
  const r = "$" + d;
  return new m(r, n);
}
function Z(t) {
  const e = "$" + d;
  if (t.type != e)
    throw new Error("Can't unregister RemoteFunction, that was not registered locally");
  delete G[t.method], P.delete(t);
}
const v = Symbol("RpcObjectType");
function N(t, e = new class {
  [v] = t;
}()) {
  const n = /* @__PURE__ */ new Map();
  return new Proxy(e, {
    get(r, s) {
      if (s == v)
        return t;
      if (typeof s != "string" || s == "then")
        return e[s];
      if (n.has(s))
        return n.get(s);
      const i = new m(
        t,
        s
      );
      return n.set(s, i), i;
    },
    construct(r, s) {
      return new r(...s);
    },
    has(r, s) {
      return s == v || s in e;
    }
  });
}
const q = new Proxy({}, {
  get: (t, e) => typeof e == "string" ? N(e) : void 0,
  has: (t, e) => typeof e == "string" && e != "then"
}), oe = [], ce = /* @__PURE__ */ new Map();
function K(t, e) {
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
          r[i] = K(t, e);
        }
        return r;
      }
      case 3: {
        const r = new Array((n - 3) / 4);
        e.push(r);
        for (let s = 0; s < r.length; s++)
          r[s] = K(t, e);
        return r;
      }
    }
    throw new Error("Unreachable code reached");
  } else if (n >= 128) {
    const r = new TextDecoder().decode(t.readBuffer(n - 128)), s = ce.get(r);
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
        const o = t.readString(), c = t.readByte();
        return new RegExp(
          o,
          "g" + (c & 1 ? "i" : "") + (c & 2 ? "m" : "")
        );
      }
      case "E":
        return t.readError();
      case "O":
        return N(t.readString());
      case "F":
        const r = t.readString(), s = t.readString();
        if (s == null)
          throw new Error("InvalidOperation");
        const i = new m(r, s);
        return e.push(i), i;
      default:
        throw new Error("Unknown data type number: " + n);
    }
}
function V(t, e, n) {
  if (e == null)
    t.writeLength("n".charCodeAt(0));
  else if (e === !0)
    t.writeLength("t".charCodeAt(0));
  else if (e === !1)
    t.writeLength("f".charCodeAt(0));
  else if (typeof e == "number" && (e | 0) === e)
    t.writeLength("i".charCodeAt(0)), t.writeInt(e);
  else if (typeof e == "number")
    t.writeLength("d".charCodeAt(0)), t.writeDouble(e);
  else if (typeof e == "bigint")
    t.writeLength("l".charCodeAt(0)), t.writeLong(e);
  else if (e instanceof Uint8Array)
    t.writeLength("b".charCodeAt(0)), t.writeLength(e.length), t.writeBuffer(e);
  else if (e instanceof Date)
    t.writeLength("D".charCodeAt(0)), t.writeLong(+e);
  else if (e instanceof RegExp) {
    t.writeLength("R".charCodeAt(0)), t.writeString(e.source);
    const r = e.flags;
    t.writeByte(
      (r.includes("i") ? 1 : 0) || (r.includes("m") ? 2 : 0)
    );
  } else if (e instanceof Error)
    t.writeLength("E".charCodeAt(0)), t.writeError(e);
  else if (typeof e == "object" && v in e)
    t.writeLength("O".charCodeAt(0)), t.writeString(e[v]);
  else if (typeof e == "function") {
    n.push(e), t.writeLength("F".charCodeAt(0));
    let r;
    e instanceof m ? r = e : (r = Y(e), ae.set(e, () => Z(r))), t.writeString(r.type), t.writeString(r.method);
  } else if (n.includes(e))
    t.writeLength(-(n.indexOf(e) * 4));
  else if (typeof e == "string") {
    const r = new TextEncoder().encode(e);
    t.writeLength(-(r.length * 4 + 1)), t.writeBytes(r);
  } else if (Array.isArray(e)) {
    n.push(e), t.writeLength(-(e.length * 4 + 3));
    for (let r of e)
      V(t, r, n);
  } else {
    for (let [r, s, i] of oe) {
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
        t.writeString(s), V(t, i, n);
    } else
      throw new Error("Unknown type for " + e);
  }
}
const ae = /* @__PURE__ */ new WeakMap();
function H(t) {
  for (let e of t)
    ae.get(e)?.();
}
class E {
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
    const n = e instanceof x ? e : new x(e.name, g, e.message, e.stack);
    this.writeString(n.name), this.writeString(n.from), this.writeString(n.message), this.writeString(n.stackTrace);
  }
  writeDynamic(e, n = []) {
    V(this, e, n);
  }
}
const b = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map();
function pe(t) {
  for (let e of b.values())
    l.get(e)?.(t);
  b.clear();
  for (let e of k.values())
    e.cancel();
}
function A(t) {
  if (D == null)
    throw new Error("Not connected");
  D.send(t.toBuffer());
}
function be(t, e, n) {
  b.set(t, e);
  try {
    A(n);
  } catch (r) {
    l.get(e)?.(r);
  }
}
var T = /* @__PURE__ */ ((t) => (t[t.FunctionCall = 0] = "FunctionCall", t[t.FunctionSuccess = 1] = "FunctionSuccess", t[t.FunctionError = 2] = "FunctionError", t[t.FunctionCancel = 3] = "FunctionCancel", t[t.MessageToExecutor = 4] = "MessageToExecutor", t[t.MessageToCaller = 5] = "MessageToCaller", t))(T || {});
let O = !1;
X ? process.on("unhandledRejection", () => {
  O = !1;
}) : window.addEventListener("unhandledrejection", (t) => {
  O && t.reason instanceof x && (O = !1, t.preventDefault());
});
async function me(t) {
  try {
    switch (t.readByte()) {
      case 0: {
        const n = t.readLength(), r = [];
        let s = !1, i = null, o = null;
        const c = new Promise((a, y) => {
          i = (h) => {
            a(h), s = !0;
            const f = new E();
            f.writeByte(
              1
              /* FunctionSuccess */
            ), f.writeLength(n), f.writeDynamic(h), A(f), k.delete(n), H(r);
          }, o = (h) => {
            y(h), s = !0;
            const f = new E();
            f.writeByte(
              2
              /* FunctionError */
            ), f.writeLength(n), f.writeError(h), A(f), k.delete(n), H(r);
          };
        });
        try {
          const a = t.readString();
          if (a == null)
            throw new Error("Client can't use null as a type for function calls");
          const y = _.get(a);
          if (!y)
            throw new Error(`Type "${a}" is not registered on client ${g}`);
          const h = t.readString(), f = t.readArray(() => t.readDynamic(r)) ?? [], te = new AbortController(), C = {
            type: a,
            method: h,
            get finished() {
              return s;
            },
            promise: c,
            sendMessage(...u) {
              if (s)
                return C;
              const p = new E();
              p.writeByte(
                5
                /* MessageToCaller */
              ), p.writeLength(n);
              const M = [];
              return p.writeArray(u, (ue) => p.writeDynamic(ue, M)), r.push(...M), A(p), C;
            },
            addMessageListener(u) {
              return U(C, u), C;
            },
            cancelToken: te.signal,
            cancel: () => te.abort(),
            [Symbol.asyncIterator]: () => $(C)
          };
          k.set(n, C);
          const W = se(() => {
            let u = y[h];
            if (u == null) {
              let p = Object.keys(y).find((M) => M.toLowerCase() == h.toLowerCase());
              p != null && (u = y[p]);
            }
            if (u == null)
              throw new Error(`Method "${h}" not found in "${a}"`);
            return u.call(y, ...f);
          }, C);
          W instanceof Promise ? W.then((u) => i(u), (u) => o(u)) : i(W);
        } catch (a) {
          o(a);
        }
        break;
      }
      case 1: {
        const n = t.readLength(), r = b.get(n);
        if (r == null) {
          console.log(`${g} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          L.get(r)?.(t.readDynamic());
        } catch (s) {
          l.get(r)?.(s);
        } finally {
          b.delete(n), L.delete(r), l.delete(r);
        }
        break;
      }
      case 2: {
        const n = t.readLength(), r = b.get(n);
        if (r == null) {
          console.log(`${g} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          O = !0, l.get(r)?.(t.readError());
        } catch (s) {
          l.get(r)?.(s);
        } finally {
          b.delete(n), L.delete(r), l.delete(r);
        }
        break;
      }
      case 3: {
        const n = t.readLength();
        let r = k.get(n);
        if (!r) {
          console.log(`${g} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        r.cancel();
        break;
      }
      case 4: {
        const n = t.readLength();
        let r = k.get(n);
        if (!r) {
          console.log(`${g} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        const s = [], i = t.readArray(() => t.readDynamic(s)) ?? [];
        F(r, i);
        break;
      }
      case 5: {
        const n = t.readLength();
        let r = b.get(n);
        if (!r) {
          console.log(`${g} has no ActiveRequest with id: ${n}`);
          break;
        }
        const s = [], i = t.readArray(() => t.readDynamic(s)) ?? [];
        F(r, i);
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
}
class le {
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
    return new x(this.readString(), this.readString() ?? "???", this.readString(), this.readString());
  }
  readDynamic(e = []) {
    return K(this, e);
  }
}
let S = !1, z, J, he = new Promise((t, e) => [z, J] = [t, e]);
async function _e() {
  for (; ; )
    if (await he.then(() => !0, () => !1))
      return;
}
let j;
if (X) {
  const t = process.env.RPC_URL;
  t ? j = async () => new (await import("ws")).WebSocket(t, process.env.RPC_TOKEN == null ? {} : {
    headers: {
      Cookie: "RPC_TOKEN=" + process.env.RPC_TOKEN
    }
  }) : (console.warn("RPC_URL is not defined => RPC will not connect"), j = async () => ({}));
} else if ("document" in globalThis)
  j = async () => new WebSocket("ws" + document.location.origin.substring(4) + "/rpc");
else
  throw new Error("Unknown Platform");
function ne(t) {
  const e = J;
  he = new Promise((n, r) => [z, J] = [n, r]), e(t), pe(t);
}
let D = null;
(async function t() {
  const e = await j();
  e.onclose = () => {
    D = null, S = !1, console.log("Websocket disconnected");
    const n = new Error("Connection closed");
    ne(n), setTimeout(t, 1e3);
  }, e.onopen = async () => {
    console.log("Websocket connected");
    try {
      D = e, await w(null, "N", g), await w(null, "+", ..._.keys()), S = !0, z();
    } catch (n) {
      console.error(n.stack), ne(n), e?.close(4e3, "Error registering types");
      return;
    }
  }, e.binaryType = "arraybuffer", e.onmessage = function(r) {
    const s = r.data;
    typeof s == "string" ? console.log(s) : me(new le(new Uint8Array(s)));
  };
})();
let g = d;
async function Ce(t) {
  g = t != null ? `${t} (${d})` : d;
  try {
    S && await w(null, "N", g);
  } catch (e) {
    console.error(e);
  }
}
function Le(t) {
  return function(e) {
    re(t ?? e.prototype.constructor.name, e).catch(console.error);
  };
}
function Ee(t) {
  return function(e) {
    oe.push([t, (n) => n instanceof e, (n, r, s) => r.write(n, s)]), ce.set(t, (n, r) => e.read(n, r));
  };
}
Promise.resolve().then(() => Se).then((t) => Object.assign(globalThis, t));
class ee {
  //Rpc
  static id = d;
  static get nameOrId() {
    return g;
  }
  static setName(e) {
    return Ce(e);
  }
  //Connection	
  static get isConnected() {
    return S;
  }
  static get waitUntilConnected() {
    return _e();
  }
  //Functions
  static createObject = N;
  static createFunction = (e, n) => new m(e, n);
  static registerFunction = Y;
  static unregisterFunction = Z;
  static callLocal = de;
  //Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
  static callFunction = w;
  //Call remote function
  static getContext = ge;
  //Types
  static registerType = re;
  static unregisterType = fe;
  static getObjectWithFallback = async (e, ...n) => await w(null, "O", e, ...n);
  static checkTypes = async (...e) => await w(null, "?", ...e);
  static checkType = async (e) => await ee.checkTypes(e) != 0;
  static getAllTypes = async () => await w(null, "T");
  static getAllConnections = async () => await w(null, "C");
  /** @deprecated Use Rpc.root instead*/
  static objects = q;
  static root = q;
}
const Se = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CustomDynamicType: Ee,
  DataInput: le,
  DataOutput: E,
  PendingCall: Q,
  RPC_ROOT: q,
  Rpc: ee,
  RpcError: x,
  RpcFunction: m,
  RpcObjectType: v,
  RpcProvider: Le,
  createRemoteObject: N,
  getAsyncIterator: $,
  listenersMap: R,
  pendingMap: B,
  registerFunction: Y,
  registerReceive: U,
  rejectCall: l,
  resolveCall: L,
  runReceiveMessage: F,
  unregisterFunction: Z
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ee as CustomDynamicType,
  le as DataInput,
  E as DataOutput,
  Q as PendingCall,
  q as RPC_ROOT,
  ee as Rpc,
  x as RpcError,
  m as RpcFunction,
  v as RpcObjectType,
  Le as RpcProvider,
  N as createRemoteObject,
  $ as getAsyncIterator,
  R as listenersMap,
  B as pendingMap,
  Y as registerFunction,
  U as registerReceive,
  l as rejectCall,
  L as resolveCall,
  F as runReceiveMessage,
  Z as unregisterFunction
};
//# sourceMappingURL=rpc.js.map
