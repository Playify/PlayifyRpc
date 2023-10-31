const Z = globalThis?.process?.versions?.node != null;
let d;
if (Z)
  d = "node@" + (await import("os")).hostname() + "@" + process.pid;
else if ("document" in globalThis)
  d = "web@" + globalThis.document.location + "@" + Date.now().toString(36) + "X" + Math.random().toString(36).substring(2);
else
  throw new Error("Unknown Platform");
const K = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ new Map();
y.set("$" + d, K);
async function z(t, e) {
  if (!y.has(t) && (y.set(t, e), C))
    try {
      await w(null, "+", t);
    } catch (n) {
      console.log(n);
    }
}
async function le(t) {
  if (y.has(t)) {
    if (C)
      try {
        await w(null, "-", t);
      } catch (e) {
        console.log(e);
      }
    y.delete(t);
  }
}
class V {
  [Symbol.toStringTag] = "PendingCall";
  finished = !1;
  promise;
  constructor() {
    this.promise = new Promise((e, n) => {
      A.set(this, (r) => {
        e(r), this.finished = !0;
      }), f.set(this, (r) => {
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
    return j(this, e), this;
  }
  cancel() {
  }
  //overridden by callFunction and callLocal
  [Symbol.asyncIterator]() {
    return O(this);
  }
}
function O(t) {
  let e = [], n = [], r = t.finished;
  return t.promise.finally(() => {
    r = !0;
    for (let i of n)
      i(void 0);
  }), t.addMessageListener((...i) => e.push(i)), {
    async next() {
      if (r || t.finished)
        return { done: !0, value: void 0 };
      if (e.length)
        return { done: !1, value: e.shift() };
      const i = await new Promise((s) => n.push(s));
      return i == null ? { done: !0, value: void 0 } : { done: !1, value: i[0] };
    }
  };
}
const A = /* @__PURE__ */ new WeakMap(), f = /* @__PURE__ */ new WeakMap(), S = /* @__PURE__ */ new WeakMap(), E = /* @__PURE__ */ new WeakMap();
function j(t, e) {
  if (E.has(t))
    E.get(t).push(e);
  else {
    E.set(t, [e]);
    const n = S.get(t) ?? [];
    for (let r of n)
      try {
        e(...r);
      } catch (i) {
        console.warn("Error receiving pending: ", i);
      }
  }
}
function I(t, e) {
  if (!t.finished)
    if (E.has(t))
      for (let n of E.get(t))
        try {
          n(...e);
        } catch (r) {
          console.warn("Error receiving: ", r);
        }
    else
      S.has(t) ? S.set(t, [...S.get(t), e]) : S.set(t, [e]);
}
let F = null;
function ee(t, e) {
  const n = F;
  F = e;
  try {
    return t();
  } finally {
    F = n;
  }
}
function he() {
  if (F == null)
    throw new Error("FunctionCallContext not available");
  return F;
}
let ue = 0;
function w(t, e, ...n) {
  if (t != null) {
    const c = y.get(t);
    if (c)
      return te(t, e, () => c[e](...n));
  }
  const r = new V(), i = [];
  r.finally(() => {
  });
  const s = new m(), o = ue++;
  try {
    s.writeByte(D.FunctionCall), s.writeLength(o), s.writeString(t), s.writeString(e), s.writeArray(n, (c) => s.writeDynamic(c, i));
  } catch (c) {
    return f.get(r)?.(c), r;
  }
  return C || t == null && T != null ? (r.sendMessage = (...c) => {
    if (r.finished)
      return r;
    const a = new m();
    a.writeByte(D.MessageToExecutor), a.writeLength(o);
    const b = [];
    return a.writeArray(c, (l) => a.writeDynamic(l, i)), i.push(...b), v(a), r;
  }, r.cancel = () => {
    if (r.finished)
      return;
    const c = new m();
    c.writeByte(D.FunctionCancel), c.writeLength(o), v(c);
  }, de(o, r, s), r) : (f.get(r)?.(new Error("Not connected")), r);
}
function fe(t) {
  return te(null, null, t);
}
function te(t, e, n) {
  const r = new V(), i = new AbortController(), s = {
    type: t,
    method: e,
    sendMessage: (...o) => (r.finished || I(r, o), s),
    get finished() {
      return r.finished;
    },
    promise: r,
    addMessageListener: (o) => (j(s, o), s),
    cancelToken: i.signal,
    cancel: () => i.abort(),
    [Symbol.asyncIterator]: () => O(s)
  };
  r.sendMessage = (...o) => (r.finished || I(s, o), r), r.cancel = () => r.finished || s.cancel();
  try {
    const o = ee(n, s);
    o instanceof Promise ? o.then((c) => A.get(r)?.(c), (c) => f.get(r)?.(c)) : A.get(r)?.(o);
  } catch (o) {
    f.get(r)?.(o);
  }
  return r;
}
const _ = class extends function(n) {
  return Object.setPrototypeOf(n, new.target.prototype);
} {
  constructor(e, n) {
    super(w.bind(null, e, n)), this.type = e, this.method = n;
  }
  toString() {
    return `rpc (...params) => ${this.type ?? "null"}.${this.method}(...params)`;
  }
};
let ge = Date.now();
function J(t) {
  if (t instanceof _)
    return t;
  const e = (ge++).toString(16);
  K[e] = t;
  const n = "$" + d;
  return new _(n, e);
}
function ne(t) {
  const e = "$" + d;
  if (t.type != e)
    throw new Error("Can't unregister RemoteFunction, that was not registered locally");
  delete K[t.method];
}
class x extends Error {
  name;
  from;
  stackTrace;
  constructor(e, n, r, i) {
    typeof i == "string" ? (super(r), this.stackTrace = i) : i ? (super(r, { cause: i }), this.stackTrace = this.stack.substring(this.stack.indexOf(`
`) + 1) + `
caused by: ` + i.stack) : (super(r), this.stackTrace = this.stack.substring(this.stack.indexOf(`
`) + 1)), this.name = e ?? "UnknownRemoteError", this.from = n, this.stack = this.name + "(" + n + ")", r != null && (this.stack += ": " + r), i != null && (this.stack += `
`, this.stackTrace = this.stackTrace.replaceAll(/^  +/gm, "	"), this.stack += this.stackTrace);
  }
}
const k = Symbol("RpcObjectType");
function $(t, e = new class {
  [k] = t;
}()) {
  const n = /* @__PURE__ */ new Map();
  return new Proxy(e, {
    get(r, i) {
      if (i == k)
        return t;
      if (typeof i != "string" || i == "then")
        return e[i];
      if (n.has(i))
        return n.get(i);
      const s = new _(
        t,
        i
      );
      return n.set(i, s), s;
    },
    construct(r, i) {
      return new r(...i);
    },
    has(r, i) {
      return i == k || i in e;
    }
  });
}
const re = new Proxy({}, {
  get: (t, e) => typeof e == "string" ? $(e) : void 0,
  has: (t, e) => !(e in globalThis) && e != "then"
}), ie = [], se = /* @__PURE__ */ new Map();
function N(t, e) {
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
        for (let i = 0; i < n / 4; i++) {
          const s = t.readString();
          r[s] = N(t, e);
        }
        return r;
      }
      case 3: {
        const r = new Array((n - 3) / 4);
        e.push(r);
        for (let i = 0; i < r.length; i++)
          r[i] = N(t, e);
        return r;
      }
    }
    throw new Error("Unreachable code reached");
  } else if (n >= 128) {
    const r = new TextDecoder().decode(t.readBuffer(n - 128)), i = se.get(r);
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
        const r = t.readString(), i = t.readByte();
        return new RegExp(
          r,
          "g" + (i & 1 ? "i" : "") + (i & 2 ? "m" : "")
        );
      }
      case "E":
        return t.readError();
      case "O":
        return $(t.readString());
      case "F":
        return t.readFunction();
      default:
        throw new Error("Unknown data type number: " + n);
    }
}
function W(t, e, n) {
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
  else if (typeof e == "object" && k in e)
    t.writeLength("O".charCodeAt(0)), t.writeString(e[k]);
  else if (typeof e == "function")
    t.writeLength("F".charCodeAt(0)), t.writeFunction(e);
  else if (n.includes(e))
    t.writeLength(-(n.indexOf(e) * 4));
  else if (typeof e == "string") {
    const r = new TextEncoder().encode(e);
    t.writeLength(-(r.length * 4 + 1)), t.writeBytes(r);
  } else if (Array.isArray(e)) {
    n.push(e), t.writeLength(-(e.length * 4 + 3));
    for (let r of e)
      W(t, r, n);
  } else {
    for (let [r, i, s] of ie) {
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
        t.writeString(i), W(t, s, n);
    } else
      throw new Error("Unknown type for " + e);
  }
}
class m {
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
  writeFunction(e) {
    let n;
    e instanceof _ ? n = e : n = J(e), this.writeString(n.type), this.writeString(n.method);
  }
  writeError(e) {
    const n = e instanceof x ? e : new x(e.name, u, e.message, e.stack);
    this.writeString(n.name), this.writeString(n.from), this.writeString(n.message), this.writeString(n.stackTrace);
  }
  /*writeError(error: Error){
  	const remote=error instanceof RemoteError?
  		error:
  		new UserRemoteError(error);
  	remote.writeError(this);
  }*/
  writeObject(e, n) {
    n.push(e);
    for (const r in e)
      this.writeString(r), this.writeDynamic(e[r], n);
    this.writeString(null);
  }
  writeDynamic(e, n = []) {
    W(this, e, n);
  }
}
const B = /* @__PURE__ */ new Map(), L = /* @__PURE__ */ new Map();
function we(t) {
  for (let e of B.values())
    f.get(e)?.(t);
  B.clear();
  for (let e of L.values())
    e.cancel();
}
function v(t) {
  if (T == null)
    throw new Error("Not connected");
  T.send(t.toBuffer());
}
function de(t, e, n) {
  B.set(t, e);
  try {
    v(n);
  } catch (r) {
    f.get(e)?.(r);
  }
}
var D = /* @__PURE__ */ ((t) => (t[t.FunctionCall = 0] = "FunctionCall", t[t.FunctionSuccess = 1] = "FunctionSuccess", t[t.FunctionError = 2] = "FunctionError", t[t.FunctionCancel = 3] = "FunctionCancel", t[t.MessageToExecutor = 4] = "MessageToExecutor", t[t.MessageToCaller = 5] = "MessageToCaller", t))(D || {});
let M = !1;
globalThis.process ? process.on("unhandledRejection", () => {
  M = !1;
}) : window.addEventListener("unhandledrejection", (t) => {
  M && t.reason instanceof x && (M = !1, t.preventDefault());
});
async function ye(t) {
  try {
    switch (t.readByte()) {
      case 0: {
        const n = t.readLength(), r = [];
        let i = !1, s = null, o = null;
        const c = new Promise((a, b) => {
          s = (l) => {
            a(l), i = !0;
            const h = new m();
            h.writeByte(
              1
              /* FunctionSuccess */
            ), h.writeLength(n), h.writeDynamic(l), v(h), L.delete(n);
          }, o = (l) => {
            b(l), i = !0;
            const h = new m();
            h.writeByte(
              2
              /* FunctionError */
            ), h.writeLength(n), h.writeError(l), v(h), L.delete(n);
          };
        });
        try {
          const a = t.readString();
          if (a == null)
            throw new Error("Client can't use null as a type for function calls");
          const b = y.get(a);
          if (!b)
            throw new Error(`Type "${a}" is not registered on client ${u}`);
          const l = t.readString(), h = t.readArray(() => t.readDynamic(r)) ?? [], H = new AbortController(), p = {
            type: a,
            method: l,
            get finished() {
              return i;
            },
            promise: c,
            sendMessage(...g) {
              if (i)
                return p;
              const R = new m();
              R.writeByte(
                5
                /* MessageToCaller */
              ), R.writeLength(n);
              const Q = [];
              return R.writeArray(g, (ae) => R.writeDynamic(ae, Q)), r.push(...Q), v(R), p;
            },
            addMessageListener(g) {
              return j(p, g), p;
            },
            cancelToken: H.signal,
            cancel: () => H.abort(),
            [Symbol.asyncIterator]: () => O(p)
          };
          L.set(n, p);
          const U = ee(() => {
            const g = b[l];
            if (g == null)
              throw new Error(`Method "${l}" not found in "${a}"`);
            return g.call(b, ...h);
          }, p);
          U instanceof Promise ? U.then((g) => s(g), (g) => o(g)) : s(U);
        } catch (a) {
          o(a);
        }
        break;
      }
      case 1: {
        const n = t.readLength(), r = B.get(n);
        if (r == null) {
          console.log(`${u} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          A.get(r)?.(t.readDynamic());
        } catch (i) {
          f.get(r)?.(i);
        }
        break;
      }
      case 2: {
        const n = t.readLength(), r = B.get(n);
        if (r == null) {
          console.log(`${u} has no activeRequest with id: ${n}`);
          break;
        }
        try {
          M = !0, f.get(r)?.(await t.readError());
        } catch (i) {
          f.get(r)?.(i);
        } finally {
        }
        break;
      }
      case 3: {
        const n = t.readLength();
        let r = L.get(n);
        if (!r) {
          console.log(`${u} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        r.cancel();
        break;
      }
      case 4: {
        const n = t.readLength();
        let r = L.get(n);
        if (!r) {
          console.log(`${u} has no CurrentlyExecuting with id: ${n}`);
          break;
        }
        const i = [], s = t.readArray(() => t.readDynamic(i)) ?? [];
        I(r, s);
        break;
      }
      case 5: {
        const n = t.readLength();
        let r = B.get(n);
        if (!r) {
          console.log(`${u} has no ActiveRequest with id: ${n}`);
          break;
        }
        const i = [], s = t.readArray(() => t.readDynamic(i)) ?? [];
        I(r, s);
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
}
class oe {
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
  readFunction() {
    const e = this.readString(), n = this.readString();
    if (n == null)
      throw new Error("InvalidOperation");
    return new _(e, n);
  }
  readError() {
    return new x(this.readString(), this.readString() ?? "???", this.readString(), this.readString());
  }
  readObject(e) {
    const n = {};
    e.push(n);
    for (let r = this.readString(); r != null; r = this.readString())
      n[r] = this.readDynamic(e);
    return n;
  }
  readDynamic(e = []) {
    return N(this, e);
  }
}
let C = !1, X, P, ce = new Promise((t, e) => [X, P] = [t, e]);
async function be() {
  for (; ; )
    if (await ce.then(() => !0, () => !1))
      return;
}
let q;
if (Z) {
  const t = (await import("ws")).WebSocket;
  q = () => new t(process.env.RPC_URL, process.env.RPC_TOKEN == null ? {} : {
    headers: {
      Cookie: "RPC_TOKEN=" + process.env.RPC_TOKEN
    }
  });
} else if ("document" in globalThis)
  q = () => new WebSocket("ws" + globalThis.document.location.origin.substring(4) + "/rpc");
else
  throw new Error("Unknown Platform");
function Y(t) {
  const e = P;
  ce = new Promise((n, r) => [X, P] = [n, r]), e(t), we(t);
}
let T = null;
(function t() {
  const e = q();
  e.onclose = () => {
    T = null, C = !1, console.log("Websocket disconnected");
    const n = new Error("Connection closed");
    Y(n), setTimeout(t, 1e3);
  }, e.onopen = async () => {
    console.log("Websocket connected");
    try {
      T = e, await w(null, "N", u), await w(null, "+", ...y.keys()), C = !0, X();
    } catch (n) {
      console.error(n.stack), Y(n), e?.close(4e3, "Error registering types");
      return;
    }
  }, e.binaryType = "arraybuffer", e.onmessage = function(r) {
    const i = r.data;
    typeof i == "string" ? console.log(i) : ye(new oe(new Uint8Array(i)));
  };
})();
let u = d;
async function pe(t) {
  u = t != null ? `${t} (${d})` : d;
  try {
    C && await w(null, "N", u);
  } catch (e) {
    console.error(e);
  }
}
function me(t) {
  return function(e) {
    z(t ?? e.prototype.constructor.name, e).catch(console.error);
  };
}
function _e(t) {
  return function(e) {
    ie.push([t, (n) => n instanceof e, (n, r, i) => r.write(n, i)]), se.set(t, (n, r) => e.read(n, r));
  };
}
Promise.resolve().then(() => Ce).then((t) => Object.assign(globalThis, t));
class G {
  //Rpc
  static id = d;
  static get nameOrId() {
    return u;
  }
  static setName(e) {
    return pe(e);
  }
  //Connection	
  static get isConnected() {
    return C;
  }
  static get waitUntilConnected() {
    return be();
  }
  //Functions
  static createObject = $;
  static createFunction = (e, n) => new _(e, n);
  static registerFunction = J;
  static unregisterFunction = ne;
  static callLocal = fe;
  //Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
  static callFunction = w;
  //Call remote function
  static getContext = he;
  //Types
  static registerType = z;
  static unregisterType = le;
  static checkTypes = async (...e) => await w(null, "?", ...e);
  static checkType = async (e) => await G.checkTypes(e) != 0;
  static getAllTypes = async () => await w(null, "T");
  static getAllConnections = async () => await w(null, "C");
  static objects = re;
}
const Ce = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CustomDynamicType: _e,
  DataInput: oe,
  DataOutput: m,
  PendingCall: V,
  RPC_ROOT: re,
  Rpc: G,
  RpcError: x,
  RpcFunction: _,
  RpcObjectType: k,
  RpcProvider: me,
  createRemoteObject: $,
  getAsyncIterator: O,
  listenersMap: E,
  pendingMap: S,
  registerFunction: J,
  registerReceive: j,
  rejectCall: f,
  resolveCall: A,
  runReceiveMessage: I,
  unregisterFunction: ne
}, Symbol.toStringTag, { value: "Module" }));
export {
  _e as CustomDynamicType,
  oe as DataInput,
  m as DataOutput,
  V as PendingCall,
  re as RPC_ROOT,
  G as Rpc,
  x as RpcError,
  _ as RpcFunction,
  k as RpcObjectType,
  me as RpcProvider,
  $ as createRemoteObject,
  O as getAsyncIterator,
  E as listenersMap,
  S as pendingMap,
  J as registerFunction,
  j as registerReceive,
  f as rejectCall,
  A as resolveCall,
  I as runReceiveMessage,
  ne as unregisterFunction
};
//# sourceMappingURL=rpc.js.map
