import {RpcError} from "../RpcError.js";
import {writeDynamic} from "./DynamicData.js";

export class DataOutput{
	private _buf:Uint8Array;
	private _data:DataView;
	private _count:number=0;

	constructor(size:number | Uint8Array=32){
		this._buf=typeof size==="number"?new Uint8Array(size):size;
		this._data=new DataView(this._buf.buffer);
	}

	private ensureCapacity(additional:number){
		additional+=this._count;
		if(additional>this._buf.byteLength){
			let replacement=new Uint8Array(Math.max(this._buf.byteLength*2,additional));
			this._data=new DataView(replacement.buffer);

			replacement.set(this._buf);
			this._buf=replacement;
		}
	}

	writeByte(b:number):void{
		this.ensureCapacity(1);
		this._buf[this._count]=b;
		this._count++;
	}

	writeBytes(b:ArrayLike<number>):void{
		this.ensureCapacity(b.length);
		this._buf.set(b,this._count);
		this._count+=b.length;
	}

	writeBuffer(buf:Uint8Array):void{
		this.writeBytes(buf);
	}

	writeBoolean(b:boolean):void{
		this.writeByte(b?1:0);
	}

	writeNullBoolean(b:boolean | null):void{
		this.writeByte(b==null?2:b?1:0);
	}

	writeShort(n:number):void{
		this.ensureCapacity(2);
		this._data.setInt16(this._count,n);
		this._count+=2;
	}

	writeChar(c:string):void{
		this.writeShort(c.charCodeAt(0));
	}

	writeInt(n:number):void{
		this.ensureCapacity(4);
		this._data.setInt32(this._count,n);
		this._count+=4;
	}

	writeLong(n:bigint | number):void{
		if(typeof n==="number"){
			this.writeInt(n/(2**32));
			this.writeInt(n%(2**32));
		}else{
			this.writeInt(Number(n/BigInt(2**32)));
			this.writeInt(Number(n%BigInt(2**32)));
		}
	}

	writeFloat(n:number):void{
		this.ensureCapacity(4);
		this._data.setFloat32(this._count,n);
		this._count+=4;
	}

	writeDouble(n:number):void{
		this.ensureCapacity(8);
		this._data.setFloat64(this._count,n);
		this._count+=8;
	}

	writeString(s:string | null){
		if(s==null){
			this.writeLength(-1);
			return;
		}
		let array=new TextEncoder().encode(s);
		this.writeLength(array.length);
		this.writeBytes(array);
	}

	writeLength(i:number){
		let u=(i<0?~i:i)>>>0;// ">>>0" : convert to unsigned
		while(u>=0x80){
			this.writeByte(u|0x80);
			u>>=7;
		}
		if(i<0){
			this.writeByte(u|0x80);
			this.writeByte(0);
		}else{
			this.writeByte(u);
		}
	}

	writeByteArray(arr:ArrayLike<number> | null){
		if(!arr) this.writeLength(-1);
		else{
			this.writeLength(arr.length);
			this.writeBytes(arr);
		}
	}

	writeArray<T>(arr:ArrayLike<T> | null,writeFunction:(t:T)=>void){
		if(!arr) this.writeLength(-1);
		else{
			this.writeLength(arr.length);
			for(let i=0; i<arr.length; i++)
				writeFunction.call(this,arr[i]!);
		}
	}

	toBuffer(from=0):Uint8Array{
		return this._buf.slice(from,this._count-from);
	}

	writeError(error:Error){
		try{// noinspection ExceptionCaughtLocallyJS
			throw RpcError.wrapAndFreeze(error)
		}catch(e){
			(e as RpcError).write(this);
		}
	}

	writeDynamic(value:any,already:unknown[]=[]){
		writeDynamic(this,value,already);
	}
}
