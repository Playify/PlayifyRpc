import {DataInput} from "./DataInput";
import {createRemoteObject,RpcObjectType} from "../RpcObject";
import {DataOutput} from "./DataOutput";
import {registerFunction,RpcFunction,unregisterFunction} from "../RemoteFunction";

export const writeRegistry: [id: string,check: (d: unknown)=>boolean,write: (data: DataOutput,o: unknown,already: unknown[])=>void][]=[];
export const readRegistry=new Map<string,(data: DataInput,already: unknown[])=>unknown>();

export function readDynamic(data: DataInput,already: unknown[]){
	let objectId=data.readLength();

	if(objectId<0){
		objectId= -objectId;
		switch(objectId%4){
			case 0:
				return already[objectId/4];
			case 1:
				return new TextDecoder().decode(data.readBuffer((objectId-1)/4));
			case 2:{
				const o: Record<string,any>={};
				already.push(o);
				for(let i=0; i<(objectId-2)/4; i++){
					const key=data.readString();
					o[key!]=readDynamic(data,already);
				}
				return o;
			}
			case 3:{
				const o=new Array((objectId-3)/4);
				already.push(o);
				for(let i=0; i<o.length; i++) o[i]=readDynamic(data,already);
				return o;
			}
		}
		throw new Error("Unreachable code reached");
	}else if(objectId>=128){
		const type=new TextDecoder().decode(data.readBuffer(objectId-128));
		const registryEntry=readRegistry.get(type);
		if(registryEntry)
			return registryEntry(data,already);
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
			case 'l':
				return data.readLong();
			case 'b':
				return data.readBuffer(data.readLength());
			case 'D':
				return new Date(Number(data.readLong()));
			case 'R':{
				const pattern=data.readString();
				const flags=data.readByte();

				return new RegExp(pattern!,"g"+
					((flags&1)?"i": "")+
					((flags&2)?"m": ""),
				);
			}
			case 'E':
				return data.readError();
			case 'O':
				return createRemoteObject(data.readString());
			case 'F':
				const type=data.readString();
				const method=data.readString();
				if(method==null) throw new Error("InvalidOperation");
				const func=new RpcFunction(type,method);
				already.push(func);
				return func;
			default:
				throw new Error("Unknown data type number: "+objectId);
		}
	}
}

export function writeDynamic(output: DataOutput,d: unknown,already: unknown[]){
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
		output.writeLength('l'.charCodeAt(0));
		output.writeLong(d);
	}else if(d instanceof Uint8Array){
		output.writeLength('b'.charCodeAt(0));
		output.writeLength(d.length);
		output.writeBuffer(d);
	}else if(d instanceof Date){
		output.writeLength('D'.charCodeAt(0));
		output.writeLong(+d);
	}else if(d instanceof RegExp){
		output.writeLength('R'.charCodeAt(0));
		output.writeString(d.source);
		const flags=d.flags;
		output.writeByte(
			(flags.includes("i")?1: 0)||
			(flags.includes("m")?2: 0),
		);
	}else if(d instanceof Error){
		output.writeLength('E'.charCodeAt(0));
		output.writeError(d);
	}else if(typeof d==="object"&&RpcObjectType in d){//RpcObject
		output.writeLength('O'.charCodeAt(0));
		output.writeString((d as any)[RpcObjectType]);
	}else if(typeof d==="function"){//RpcFunction
		already.push(d);
		output.writeLength('F'.charCodeAt(0));
		
		let rpcFunc:RpcFunction<any>;
		if(d instanceof RpcFunction)rpcFunc=d;
		else{
			rpcFunc=registerFunction(d as any);
			onFree.set(d,()=>unregisterFunction(rpcFunc));
		}

		output.writeString(rpcFunc.type);
		output.writeString(rpcFunc.method);
		
	}else if(already.includes(d)){
		output.writeLength(-(already.indexOf(d)*4/* +0 */));
	}else if(typeof d==="string"){
		const buffer=new TextEncoder().encode(d);
		output.writeLength(-(buffer.length*4+1));
		output.writeBytes(buffer);
	} else if(Array.isArray(d)){
		already.push(d);
		output.writeLength(-(d.length*4+3));
		for(let element of d) writeDynamic(output,element,already);
	}else{
		for(let [id,check,write] of writeRegistry){
			if(!check(d)) continue;
			const idBytes=new TextEncoder().encode(id);
			output.writeLength(idBytes.length+128);
			output.writeBytes(idBytes);
			write(output,d,already);
			return;
		}

		if(typeof d==="object"){
			already.push(d);
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