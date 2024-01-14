class v extends Error {
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
const z = globalThis?.process?.versions?.node != null;
let w;
if (z)
  try {
    w = "node@" + process.binding("os").getHostname() + "@" + process.pid;
  } catch {
    w = "node@" + process.platform + ":" + process.arch + "@" + process.pid;
  }
else if ("document" in globalThis)
  w = "web@" + document.location + "@" + Date.now().toString(36) + "X" + Math.random().toString(36).substring(2);
else
  throw new Error("Unknown Platform");
const J = /* @__PURE__ */ Object.create(null), d = /* @__PURE__ */ new Map();
d.set("$" + w, J);
async function se(t, e) {
  if (!d.has(t)) {
    d.set(t, e);
    try {
      R && await l(null, "+", t);
    } catch (n) {
      console.warn(n), d.delete(t);
    }
  }
}
async function de(t) {
  if (d.has(t)) {
    try {
      R && await l(null, "-", t);
    } catch (e) {
      console.warn(e);
    }
    d.delete(t);
  }
}
async function ne(t) {
  const e = t[I];
  if (e)
    return await e.call(t);
  const n = [];
  for (let r in t)
    typeof t[r] == "function" && n.push(r);
  return n;
}
async function ie(t, e, n, ...r) {
  if (n != null) {
    let s = t[n];
    if (s == null) {
      let o = (await ne(t)).find((c) => c.toLowerCase() == n.toLowerCase());
      o != null && (s = t[o]);
    }
    const i = {}[n];
    if (s == null || s === i)
      throw new Error(`Method "${n}" not found in "${e}"`);
    return s.call(t, ...r);
  }
  switch (r.length == 0 ? null : r[0]) {
    case "M":
      return ne(t);
    default:
      throw new Error("Invalid meta-call");
  }
}
class X {
  [Symbol.toStringTag] = "PendingCall";
  finished = !1;
  promise;
  constructor() {
    this.promise = new Promise((e, n) => {
      C.set(this, (r) => {
        e(r), this.finished = !0;
      }), u.set(this, (r) => {
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
    return N(this, e), this;
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
const C = /* @__PURE__ */ new WeakMap(), u = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap();
function N(t, e) {
  if (B.has(t))
    B.get(t).push(e);
  else {
    B.set(t, [e]);
    const n = k.get(t) ?? [];
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
    if (B.has(t))
      for (let n of B.get(t))
        try {
          n(...e);
        } catch (r) {
          console.warn("Error receiving: ", r);
        }
    else
      k.has(t) ? k.set(t, [...k.get(t), e]) : k.set(t, [e]);
}
let M = null;
function oe(t, e) {
  const n = M;
  M = e;
  try {
    return t();
  } finally {
    M = n;
  }
}
function ye() {
  if (M == null)
    throw new Error("FunctionCallContext not available");
  return M;
}
let pe = 0;
function l(t, e, ...n) {
  if (t != null) {
    const c = d.get(t);
    if (c)
      return ce(t, e, () => ie(c, t, e, ...n));
  }
  const r = new X(), s = [];
  r.finally(() => V(s));
  const i = new S(), o = pe++;
  try {
    i.writeByte(D.FunctionCall), i.writeLength(o), i.writeString(t), i.writeString(e), i.writeArray(n, (c) => i.writeDynamic(c, s));
  } catch (c) {
    return u.get(r)?.(c), r;
  }
  return R || t == null && T != null ? (r.sendMessage = (...c) => {
    if (r.finished)
      return r;
    const a = new S();
    a.writeByte(D.MessageToExecutor), a.writeLength(o);
    const b = [];
    return a.writeArray(c, (g) => a.writeDynamic(g, b)), s.push(...b), x(a), r;
  }, r.cancel = () => {
    if (r.finished)
      return;
    const c = new S();
    c.writeByte(D.FunctionCancel), c.writeLength(o), x(c);
  }, Ce(o, r, i), r) : (u.get(r)?.(new Error("Not connected")), r);
}
function be(t) {
  return ce(null, null, t);
}
function ce(t, e, n) {
  const r = new X(), s = new AbortController(), i = {
    type: t,
    method: e,
    sendMessage: (...o) => (r.finished || F(r, o), i),
    get finished() {
      return r.finished;
    },
    promise: r,
    addMessageListener: (o) => (N(i, o), i),
    cancelToken: s.signal,
    cancelSelf: () => s.abort(),
    [Symbol.asyncIterator]: () => $(i)
  };
  r.sendMessage = (...o) => (r.finished || F(i, o), r), r.cancel = () => r.finished || i.cancelSelf();
  try {
    const o = oe(n, i);
    o instanceof Promise ? o.then((c) => C.get(r)?.(c), (c) => u.get(r)?.(c)) : C.get(r)?.(o);
  } catch (o) {
    u.get(r)?.(o);
  }
  return r;
}
const p = class extends function(n) {
  return Object.setPrototypeOf(n, new.target.prototype);
} {
  constructor(e, n) {
    super(l.bind(null, e, n)), this.type = e, this.method = n;
  }
  toString() {
    return `rpc (...params) => ${this.type ?? "null"}.${this.method}(...params)`;
  }
};
let me = Date.now();
const q = /* @__PURE__ */ new WeakMap();
function Q(t) {
  if (t instanceof p)
    return t;
  const e = q.get(t);
  if (e != null)
    return new p("$" + w, e);
  const n = (me++).toString(16);
  J[n] = t, q.set(t, n);
  const r = "$" + w;
  return new p(r, n);
}
function Y(t) {
  const e = "$" + w;
  if (t.type != e)
    throw new Error("Can't unregister RemoteFunction, that was not registered locally");
  delete J[t.method], q.delete(t);
}
const L = Symbol("RpcObjectType"), U = Symbol("RpcObjectExists"), I = Symbol("RpcObjectGetMethods");
function P(t, e = new class {
  [L] = t;
}()) {
  const n = /* @__PURE__ */ new Map();
  return new Proxy(e, {
    get(r, s) {
      if (s == L)
        return t;
      if (s == U)
        return () => l(null, "E", t);
      if (s == I)
        return () => l(t, null, "M");
      if (typeof s != "string" || s == "then")
        return e[s];
      if (n.has(s))
        return n.get(s);
      const i = new p(
        t,
        s
      );
      return n.set(s, i), i;
    },
    construct(r, s) {
      return new r(...s);
    },
    has(r, s) {
      return s == L || s == I || s == U || s in e;
    }
  });
}
const ae = new Proxy({}, {
  get: (t, e) => typeof e == "string" ? P(e) : void 0,
  has: (t, e) => typeof e == "string" && e != "then"
}), le = [], he = /* @__PURE__ */ new Map();
function H(t, e) {
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
          r[i] = H(t, e);
        }
        return r;
      }
      case 3: {
        const r = new Array((n - 3) / 4);
        e.push(r);
        for (let s = 0; s < r.length; s++)
          r[s] = H(t, e);
        return r;
      }
    }
    throw new Error("Unreachable code reached");
  } else if (n >= 128) {
    const r = new TextDecoder().decode(t.readBuffer(n - 128)), s = he.get(r);
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
        return P(r);
      case "F":
        const s = t.readString();
        if (s == null)
          throw new Error("Type can't be null");
        const i = t.readString();
        if (i == null)
          throw new Error("Method can't be null");
        const o = new p(s, i);
        return e.push(o), o;
      default:
        throw new Error("Unknown data type number: " + n);
    }
}
function K(t, e, n) {
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
  else if (typeof e == "object" && L in e)
    t.writeLength(79), t.writeString(e[L]);
  else if (typeof e == "function") {
    n.push(e), t.writeLength(70);
    let r;
    e instanceof p ? r = e : (r = Q(e), ue.set(e, () => Y(r))), t.writeString(r.type), t.writeString(r.method);
  } else if (n.includes(e))
    t.writeLength(-(n.indexOf(e) * 4));
  else if (typeof e == "string") {
    const r = new TextEncoder().encode(e);
    t.writeLength(-(r.length * 4 + 1)), t.writeBytes(r);
  } else if (Array.isArray(e)) {
    n.push(e), t.writeLength(-(e.length * 4 + 3));
    for (let r of e)
      K(t, r, n);
  } else {
    for (let [r, s, i] of le) {
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
        t.writeString(s), K(t, i, n);
    } else
      throw new Error("Unknown type for " + e);
  }
}
const ue = /* @__PURE__ */ new WeakMap();
function V(t) {
  for (let e of t)
    ue.get(e)?.();
}
class S {
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
    const n = e instanceof v ? e : new v(e.name, h, e.message, e.stack);
    this.writeString(n.name), this.writeString(n.from), this.writeString(n.message), this.writeString(n.stackTrace);
  }
  writeDynamic(e, n = []) {
    K(this, e, n);
  }
}
const y = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map();
function _e(t) {
  for (let e of y.values())
    u.get(e)?.(t);
  y.clear();
  for (let e of E.values())
    e.cancelSelf();
}
function x(t) {
  if (T == null)
    throw new Error("Not connected");
  T.send(t.toBuffer());
}
function Ce(t, e, n) {
  y.set(t, e);
  try {
    x(n);
  } catch (r) {
    u.get(e)?.(r);
  }
}
var D = /* @__PURE__ */ ((t) => (t[t.FunctionCall = 0] = "FunctionCall", t[t.FunctionSuccess = 1] = "FunctionSuccess", t[t.FunctionError = 2] = "FunctionError", t[t.FunctionCancel = 3] = "FunctionCancel", t[t.MessageToExecutor = 4] = "MessageToExecutor", t[t.MessageToCaller = 5] = "MessageToCaller", t))(D || {});
let O = !1;
z ? process.on("unhandledRejection", () => {
  O = !1;
}) : window.addEventListener("unhandledrejection", (t) => {
  O && t.reason instanceof v && (O = !1, t.preventDefault());
});
async function Le(t) {
  try {
    switch (t.readByte()) {
      case 0: {
        const n = t.readLength(), r = [];
        let s = !1, i = null, o = null;
        const c = new Promise((a, b) => {
          i = (g) => {
            a(g), s = !0;
            const f = new S();
            f.writeByte(
              1
              /* FunctionSuccess */
            ), f.writeLength(n), f.writeDynamic(g), x(f), E.delete(n), V(r);
          }, o = (g) => {
            b(g), s = !0;
            const f = new S();
            f.writeByte(
              2
              /* FunctionError */
            ), f.writeLength(n), f.writeError(g), x(f), E.delete(n), V(r);
          };
        });
        try {
          const a = t.readString();
          if (a == null)
            throw new Error("Client can't use null as a type for function calls");
          const b = d.get(a);
          if (!b)
            throw new Error(`Type "${a}" is not registered on client ${h}`);
          const g = t.readString(), f = t.readArray(() => t.readDynamic(r)) ?? [], ee = new AbortController(), m = {
            type: a,
            method: g,
            get finished() {
              return s;
            },
            promise: c,
            sendMessage(..._) {
              if (s)
                return m;
              const A = new S();
              A.writeByte(
                5
                /* MessageToCaller */
              ), A.writeLength(n);
              const te = [];
              return A.writeArray(_, (ge) => A.writeDynamic(ge, te)), r.push(...te), x(A), m;
            },
            addMessageListener(_) {
              return N(m, _), m;
            },
            cancelToken: ee.signal,
            cancelSelf: () => ee.abort(),
            [Symbol.asyncIterator]: () => $(m)
          };
          E.set(n, m);
          const W = oe(() => ie(b, a, g, ...f), m);
          W instanceof Promise ? W.then((_) => i(_), (_) => o(_)) : i(W);
        } catch (a) {
          o(a);
        }
        break;
      }
      case 1: {
        const n = t.readLength(), r = y.get(n);
        if (r == null) {
          console.log(`${h} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          C.get(r)?.(t.readDynamic());
        } catch (s) {
          u.get(r)?.(s);
        } finally {
          y.delete(n), C.delete(r), u.delete(r);
        }
        break;
      }
      case 2: {
        const n = t.readLength(), r = y.get(n);
        if (r == null) {
          console.log(`${h} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          O = !0, u.get(r)?.(t.readError());
        } catch (s) {
          u.get(r)?.(s);
        } finally {
          y.delete(n), C.delete(r), u.delete(r);
        }
        break;
      }
      case 3: {
        const n = t.readLength();
        let r = E.get(n);
        if (!r) {
          console.log(`${h} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        r.cancelSelf();
        break;
      }
      case 4: {
        const n = t.readLength();
        let r = E.get(n);
        if (!r) {
          console.log(`${h} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        const s = [], i = t.readArray(() => t.readDynamic(s)) ?? [];
        F(r, i);
        break;
      }
      case 5: {
        const n = t.readLength();
        let r = y.get(n);
        if (!r) {
          console.log(`${h} has no ActiveRequest with id: ${n}`);
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
class fe {
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
    return new v(this.readString(), this.readString() ?? "???", this.readString(), this.readString());
  }
  readDynamic(e = []) {
    return H(this, e);
  }
}
let R = !1, Z, G, we = new Promise((t, e) => [Z, G] = [t, e]);
async function Se() {
  for (; ; )
    if (await we.then(() => !0, () => !1))
      return;
}
let j;
if (z) {
  const t = process.env.RPC_URL;
  t ? j = async (e) => {
    const n = new URL(t);
    return n.search = e.toString(), new (await import("ws")).WebSocket(n, process.env.RPC_TOKEN == null ? {} : {
      headers: {
        Cookie: "RPC_TOKEN=" + process.env.RPC_TOKEN
      }
    });
  } : (console.warn("RPC_URL is not defined => RPC will not connect"), j = async () => ({}));
} else if ("document" in globalThis)
  j = async (t) => new WebSocket("ws" + document.location.origin.substring(4) + "/rpc?" + t);
else
  throw new Error("Unknown Platform");
function re(t) {
  const e = G;
  we = new Promise((n, r) => [Z, G] = [n, r]), e(t), _e(t);
}
let T = null;
(async function t() {
  await Promise.resolve();
  let e = h, n = /* @__PURE__ */ new Set();
  const r = new URLSearchParams();
  r.set("name", e);
  for (let i of d.keys())
    n.add(i), r.append("type", i);
  const s = await j(r);
  s.onclose = () => {
    T = null, R = !1, console.log("Websocket disconnected");
    const i = new Error("Connection closed");
    re(i), setTimeout(t, 1e3);
  }, s.onopen = async () => {
    console.log("Websocket connected");
    try {
      T = s;
      const i = new Set(d.keys()), o = new Set(n);
      for (let c of i)
        o.delete(c) && i.delete(c);
      i.size || o.size ? h != e ? await l(null, "H", h, [...i.keys()], [...o.keys()]) : await l(null, "H", [...i.keys()], [...o.keys()]) : h != e && await l(null, "H", h), R = !0, Z();
    } catch (i) {
      console.error(i.stack), re(i), s?.close(4e3, "Error registering types");
      return;
    }
  }, s.binaryType = "arraybuffer", s.onmessage = function(o) {
    const c = o.data;
    typeof c == "string" ? console.log(c) : Le(new fe(new Uint8Array(c)));
  };
})();
let h = w;
async function Re(t) {
  h = t != null ? `${t} (${w})` : w;
  try {
    R && await l(null, "N", h);
  } catch (e) {
    console.error(e);
  }
}
function Ee(t) {
  return function(e) {
    se(t ?? e.prototype.constructor.name, e).catch(console.error);
  };
}
function ke(t) {
  return function(e) {
    le.push([t, (n) => n instanceof e, (n, r, s) => r.write(n, s)]), he.set(t, (n, r) => e.read(n, r));
  };
}
Promise.resolve().then(() => xe).then((t) => Object.assign(globalThis, t));
class Be {
  //Rpc
  static id = w;
  static get nameOrId() {
    return h;
  }
  static setName(e) {
    return Re(e);
  }
  //Connection	
  static get isConnected() {
    return R;
  }
  static get waitUntilConnected() {
    return Se();
  }
  //Functions
  static createObject = P;
  static createFunction = (e, n) => new p(e, n);
  static registerFunction = Q;
  static unregisterFunction = Y;
  static callLocal = be;
  //Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
  static callFunction = l;
  //Call remote function
  static getContext = ye;
  //Types
  static registerType = se;
  static unregisterType = de;
  static getObjectWithFallback = async (e, ...n) => await l("Rpc", "getObjectWithFallback", e, ...n);
  static checkTypes = async (...e) => await l("Rpc", "checkTypes", ...e);
  static checkType = async (e) => await l("Rpc", "checkType", e);
  static getAllTypes = async () => await l("Rpc", "getAllTypes");
  static getAllConnections = async () => await l("Rpc", "getAllConnections");
  static getRegistrations = async () => await l("Rpc", "getRegistrations");
  static eval = async (e) => await l("Rpc", "eval", e);
  static root = ae;
  static type = L;
  static exists = U;
  static getMethods = I;
}
const xe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CustomDynamicType: ke,
  DataInput: fe,
  DataOutput: S,
  PendingCall: X,
  RPC_ROOT: ae,
  Rpc: Be,
  RpcError: v,
  RpcFunction: p,
  RpcObjectExists: U,
  RpcObjectGetMethods: I,
  RpcObjectType: L,
  RpcProvider: Ee,
  createRemoteObject: P,
  getAsyncIterator: $,
  listenersMap: B,
  pendingMap: k,
  registerFunction: Q,
  registerReceive: N,
  rejectCall: u,
  resolveCall: C,
  runReceiveMessage: F,
  unregisterFunction: Y
}, Symbol.toStringTag, { value: "Module" }));
export {
  ke as CustomDynamicType,
  fe as DataInput,
  S as DataOutput,
  X as PendingCall,
  ae as RPC_ROOT,
  Be as Rpc,
  v as RpcError,
  p as RpcFunction,
  U as RpcObjectExists,
  I as RpcObjectGetMethods,
  L as RpcObjectType,
  Ee as RpcProvider,
  P as createRemoteObject,
  $ as getAsyncIterator,
  B as listenersMap,
  k as pendingMap,
  Q as registerFunction,
  N as registerReceive,
  u as rejectCall,
  C as resolveCall,
  F as runReceiveMessage,
  Y as unregisterFunction
};
//# sourceMappingURL=rpc.js.map
