import {DataOutput} from "./DataOutput";
import {DataInput} from "./DataInput";
import {readRegistry,writeRegistry} from "./DynamicData";


interface CustomDynamicTypeInstance{
	write(outgoing:DataOutput,already:unknown[]):void;
}

interface CustomDynamicType<T extends CustomDynamicTypeInstance>{
	new(...arg: any[]):T;
	read(incoming:DataInput,already:unknown[]):CustomDynamicTypeInstance;
}

export function CustomDynamicType(id: string){
	return function<T extends CustomDynamicTypeInstance>(target: CustomDynamicType<T>){
		writeRegistry.push([id,d=>d instanceof target,(data,o,already)=>(o as T).write(data,already)]);
		readRegistry.set(id,(data,already)=>target.read(data,already));
	};
}