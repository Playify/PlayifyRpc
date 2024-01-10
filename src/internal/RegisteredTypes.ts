import {isConnected} from "../connection/WebSocketConnection";
import {RpcId} from "../connection/RpcId";
import {callRemoteFunction} from "../types/functions/FunctionCallContext";
import {RpcObjectGetMethods} from "../types/RpcObject";
import {afterEach} from "node:test";


export type Func=(...args: any[])=>Promise<any>;
export type Invoker={
	[RpcObjectGetMethods]?: ()=>Promise<string[]>,
	[s: string]: Func | any,
};
export const registeredFunctions: Invoker=Object.create(null);
export const registeredTypes=new Map<string,Invoker>();
registeredTypes.set("$"+RpcId,registeredFunctions);


export async function registerType(type: string,invoker: Invoker): Promise<void>{
	if(registeredTypes.has(type)) return;
	registeredTypes.set(type,invoker);

	if(isConnected)
		try{
			await callRemoteFunction(null,'+',type);
		}catch(e){
			console.log(e);
		}
}

export async function unregisterType(type: string): Promise<void>{
	if(!registeredTypes.has(type)) return;
	if(isConnected)
		try{
			await callRemoteFunction(null,'-',type);
		}catch(e){
			console.log(e);
		}
	registeredTypes.delete(type);
}



async function getMethods(invoker: Invoker): Promise<string[]>{
	const getter=invoker[RpcObjectGetMethods];
	if(getter) return await getter.call(invoker);

	const arr=[];
	for(let key in invoker)
		if(typeof invoker[key]=="function")
			arr.push(key);

	return arr;
}

export async function invoke(invoker: Invoker,type: string,method: string | null,...args: any[]){
	if(method!=null){
		let func=invoker[method];
		if(func==null){
			let ignoreCase=(await getMethods(invoker)).find(s=>s.toLowerCase()==method.toLowerCase());
			if(ignoreCase!=null) func=invoker[ignoreCase];
		}
		const reference=({})[method];//This is used, so .toString() and .__specialFunctions__() are not allowed
		
		if(func==null||func===reference) throw new Error(`Method \"${method}\" not found in \"${type}\"`);
		return func.call(invoker,...args);
	}

	switch(args.length==0?null: args[0]){
		case "M":
			return getMethods(invoker);
		default:
			throw new Error("Invalid meta-call");
	}
}