import {DataInput} from "./DataInput.js";
import {createRemoteObject,RpcSymbols} from "../RpcObject.js";
import {DataOutput} from "./DataOutput.js";
import {registerFunction,RpcFunction,unregisterFunction} from "../RpcFunction.js";

export const writeRegistry: [id: string,check: (d: unknown)=>boolean,write: (data: DataOutput,o: unknown)=>void][]=[];
export const readRegistry=new Map<string,(data: DataInput,already:(<T>(t:T)=>T))=>unknown>();

export function readDynamic(data: DataInput,already: Record<number,unknown>){
	const index=data.offset();
	const alreadyFunc=<T>(t:T):T=>{
		already[index]=t;
		return t;
	};
	
	let objectId=data.readLength();

	if(objectId<0){
		objectId= -objectId;
		switch(objectId%4){
			case 0:
				let alreadyElement=already[index-objectId/4];
				if(alreadyElement==null) throw new Error("Error reading from 'already'");
				return alreadyElement;
			case 1:
				return alreadyFunc(new TextDecoder().decode(data.readBuffer((objectId-1)/4)));
			case 2:{
				const o: Record<string,any>=alreadyFunc({});
				for(let i=0; i<(objectId-2)/4; i++){
					const key=data.readString();
					o[key!]=readDynamic(data,already);
				}
				return o;
			}
			case 3:{
				const o=alreadyFunc(new Array((objectId-3)/4));
				for(let i=0; i<o.length; i++) o[i]=readDynamic(data,already);
				return o;
			}
		}
		throw new Error("Unreachable code reached");
	}else if(objectId>=128){
		const type=new TextDecoder().decode(data.readBuffer(objectId-128));
		const registryEntry=readRegistry.get(type);
		if(registryEntry)
			return registryEntry(data,alreadyFunc);
		throw new Error("Unknown data type: "+type);
	}else{
		switch(String.fromCodePoint(objectId)){
			case 'n':
				return null;
			case 't':
				return true;
			case 'f':
				return false;
			case 'i':
				return data.readInt();
			case 'd':
				return data.readDouble();
			case '-':
			case '+':
				const length=data.readLength();
				const bytes=data.readBuffer(length);
				
				let big=0n;
				for(let i=length-1;i>=0;i--)
					big=(big<<8n)|BigInt(bytes[i]);
				
				return String.fromCodePoint(objectId)=='-'?-big:big;
			case 'b':
				return alreadyFunc(data.readBuffer(data.readLength()));
			case 'D':
				return new Date(Number(data.readLong()));
			case 'R':{
				const pattern=data.readString();
				const flags=data.readByte();

				return alreadyFunc(new RegExp(pattern!,"g"+
					((flags&1)?"i": "")+
					((flags&2)?"m": ""),
				));
			}
			case 'E':
				return alreadyFunc(data.readError());
			case 'O':
				const objectType=data.readString();
				if(objectType==null) throw new Error("Type can't be null");
				return alreadyFunc(createRemoteObject(objectType));
			case 'F':
				const type=data.readString();
				if(type==null) throw new Error("Type can't be null");
				const method=data.readString();
				if(method==null) throw new Error("Method can't be null");
				return alreadyFunc(new RpcFunction(type,method));
			default:
				throw new Error("Unknown data type number: "+objectId);
		}
	}
}

export function writeDynamic(output: DataOutput,d: unknown,already: Map<unknown,number>){
	if(d==null) output.writeLength('n'.charCodeAt(0));
	else if(d===true) output.writeLength('t'.charCodeAt(0));
	else if(d===false) output.writeLength('f'.charCodeAt(0));
	else if(typeof d=="number"&&(d|0)===d){
		output.writeLength('i'.charCodeAt(0));
		output.writeInt(d);
	}else if(typeof d=="number"){
		output.writeLength('d'.charCodeAt(0));
		output.writeDouble(d);
	}else if(typeof d=="bigint"){
		if(d<0n){
			output.writeLength('-'.charCodeAt(0));
			d=-d;
		}else output.writeLength('+'.charCodeAt(0));
		
		const list:number[]=[];
		for(let bigInt=d as bigint;bigInt>0n;bigInt>>=8n)
			list.push(Number(bigInt&0xFFn));

		output.writeLength(list.length);
		output.writeBytes(list);
	}else if(d instanceof Uint8Array){
		already.set(d,output.length());
		output.writeLength('b'.charCodeAt(0));
		output.writeLength(d.length);
		output.writeBuffer(d);
	}else if(d instanceof Date){
		output.writeLength('D'.charCodeAt(0));
		output.writeLong(+d);
	}else if(d instanceof RegExp){
		already.set(d,output.length());
		output.writeLength('R'.charCodeAt(0));
		output.writeString(d.source);
		const flags=d.flags;
		output.writeByte(
			(flags.includes("i")?1: 0)||
			(flags.includes("m")?2: 0),
		);
	}else if(d instanceof Error){
		already.set(d,output.length());
		output.writeLength('E'.charCodeAt(0));
		output.writeError(d);
	}else if(typeof d==="object"&&RpcSymbols.ObjectType in d){//RpcObject
		already.set(d,output.length());
		output.writeLength('O'.charCodeAt(0));
		output.writeString((d as any)[RpcSymbols.ObjectType]);
	}else if(typeof d==="function"){//RpcFunction
		already.set(d,output.length());
		output.writeLength('F'.charCodeAt(0));
		
		let rpcFunc:RpcFunction<any>;
		if(d instanceof RpcFunction)rpcFunc=d;
		else{
			rpcFunc=registerFunction(d as any);
			onFree.set(d,()=>unregisterFunction(rpcFunc));
		}

		output.writeString(rpcFunc.type);
		output.writeString(rpcFunc.method);
		
	}else if(already.has(d)){
		output.writeLength(-((output.length()-already.get(d)!)*4/* +0 */));
	}else if(typeof d==="string"){
		already.set(d,output.length());
		const buffer=new TextEncoder().encode(d);
		output.writeLength(-(buffer.length*4+1));
		output.writeBytes(buffer);
	} else if(Array.isArray(d)){
		already.set(d,output.length());
		output.writeLength(-(d.length*4+3));
		for(let element of d) writeDynamic(output,element,already);
	}else{
		for(let [id,check,write] of writeRegistry){
			if(!check(d)) continue;
			const idBytes=new TextEncoder().encode(id);
			output.writeLength(idBytes.length+128);
			output.writeBytes(idBytes);
			already.set(d,output.length());
			write(output,d);
			return;
		}

		if(typeof d==="object"){
			already.set(d,output.length());
			const entries=Object.entries(d);
			output.writeLength(-(entries.length*4+2));
			for(let [key,value] of entries){
				output.writeString(key);
				writeDynamic(output,value,already);
			}
		}else throw new Error("Unknown type for "+d);
	}
}

const onFree=new WeakMap<any,VoidFunction>();
export function freeDynamic(already:unknown[]){
	for(let element of already)
		onFree.get(element)?.();
}
export function needsFreeDynamic(obj:unknown){
	return onFree.has(obj);
}