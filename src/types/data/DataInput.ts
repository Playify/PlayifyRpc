import {RpcError} from "../RpcError.js";
import {readDynamic} from "./DynamicData.js";

// noinspection JSUnusedGlobalSymbols
export class DataInput{
	private readonly _buf: Uint8Array;
	private readonly _data: DataView;
	private _pos: number;
	private readonly _count: number;

	constructor(buf: Uint8Array);
	constructor(buf: Uint8Array,pos: number,length: number);
	constructor(buf: Uint8Array,pos: number=0,length: number=buf.length){
		this._buf=buf;
		this._data=new DataView(buf.buffer);
		this._pos=pos;
		this._count=pos+length;
	}

	readFully(b: number[],off: number=0,len: number=b.length): void{
		let pos=this._pos;
		const available=this._count-pos;

		if(available<len) throw new RangeError("not enough bytes available to use readFully");

		for(let i=off; i<off+len; i++)
			b[i]=this._buf[pos++]!;
		this._pos=pos;
	}

	skip(n: number): number{
		let k=this.available();
		if(n<k) k=n<0?0: n;
		this._pos+=k;
		return k;
	}

	offset():number{
		return this._pos;
	}
	available(): number{
		return this._count-this._pos;
	}

	readAll(): Uint8Array{
		return this._buf.slice(this._pos,this._pos=this._count);
	}

	readBuffer(length: number): Uint8Array{
		if(length>this.available()) throw new RangeError();
		return this._buf.slice(this._pos,this._pos+=length);
	}

	readByte(): number{
		return this._data.getUint8(this._pos++);
	}

	readBoolean(): boolean{
		return this.readByte()!=0;
	}

	readNullBoolean(): boolean | null{
		const b=this.readByte();
		return b<2?b==1: null;
	}

	readShort(): number{
		const n=this._data.getInt16(this._pos);
		this._pos+=2;
		return n;
	}

	readUShort(): number{
		const n=this._data.getUint16(this._pos);
		this._pos+=2;
		return n;
	}

	readChar(): string{
		return String.fromCharCode(this.readUShort());
	}

	readInt(): number{
		const n=this._data.getInt32(this._pos);
		this._pos+=4;
		return n;
	}

	readLong(): bigint{
		return BigInt(this.readInt())*BigInt(2**32)+BigInt(this.readInt()>>>0);
	}

	readFloat(): number{
		const n=this._data.getFloat32(this._pos);
		this._pos+=4;
		return n;
	}

	readDouble(): number{
		const n=this._data.getFloat64(this._pos);
		this._pos+=8;
		return n;
	}

	readString(): string|null{
		let length=this.readLength();
		if(length== -1) return null;
		return new TextDecoder().decode(this.readBuffer(length));
	}

	readLength(): number{
		let result=0;
		let push=0;
		while(true){
			const read=this.readByte();
			if(read==0) return push==0?0: ~result;
			if((read&0x80)==0){
				result|=read<<push;
				return result;
			}
			result|=(read&0x7f)<<push;
			push+=7;
		}
	}

	readArray<T>(readFunction: ()=>T): T[]|null{
		const length=this.readLength();
		if(length== -1) return null;
		const arr: T[]=[];
		for(let i=0; i<length; i++)
			arr[i]=readFunction.call(this);
		return arr;
	}

	readError(){
		return RpcError.read(this);
	}

	readDynamic(already: Record<number,unknown>){
		return readDynamic(this,already);
	}
}