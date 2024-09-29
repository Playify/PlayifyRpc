import {DataOutput} from "./DataOutput.js";
import {DataInput} from "./DataInput.js";
import {readRegistry,writeRegistry} from "./DynamicData.js";


interface RpcDataTypeInstance{
	write(outgoing:DataOutput):void;
}

interface RpcDataType<T extends RpcDataTypeInstance>{
	new(...arg: any[]):T;
	read(incoming:DataInput,alreadyFunc:(<T>(t:T)=>T)):RpcDataTypeInstance;
}

export function RpcDataTypeDecorator(id: string){
	return function<T extends RpcDataTypeInstance>(target: RpcDataType<T>){
		writeRegistry.push([id,d=>d instanceof target,(data,o)=>(o as T).write(data)]);
		readRegistry.set(id,(data,alreadyFunc)=>target.read(data,alreadyFunc));
	};
}