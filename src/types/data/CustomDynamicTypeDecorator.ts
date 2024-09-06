import {DataOutput} from "./DataOutput.js";
import {DataInput} from "./DataInput.js";
import {readRegistry,writeRegistry} from "./DynamicData.js";


interface CustomDynamicTypeInstance{
	write(outgoing:DataOutput):void;
}

interface CustomDynamicType<T extends CustomDynamicTypeInstance>{
	new(...arg: any[]):T;
	read(incoming:DataInput,alreadyFunc:(<T>(t:T)=>T)):CustomDynamicTypeInstance;
}

export function CustomDynamicType(id: string){
	return function<T extends CustomDynamicTypeInstance>(target: CustomDynamicType<T>){
		writeRegistry.push([id,d=>d instanceof target,(data,o)=>(o as T).write(data)]);
		readRegistry.set(id,(data,alreadyFunc)=>target.read(data,alreadyFunc));
	};
}