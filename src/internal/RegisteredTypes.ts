import {isConnected} from "../connection/WebSocketConnection";
import {RpcId} from "../connection/RpcId";
import {callRemoteFunction} from "../types/functions/FunctionCallContext";
import {RpcObjectGetMethods} from "../types/RpcObject";


export type Func=(...args:any[])=>Promise<any>;
export type Invoker={
	[RpcObjectGetMethods]?:()=>Promise<string[]>,
	[s:string]:Func | any,
};
export const registeredFunctions:Invoker=Object.create(null);
export const registeredTypes=new Map<string,Invoker>();
registeredTypes.set("$"+RpcId,registeredFunctions);


export async function registerType(type:string,invoker:Invoker):Promise<void>{
	if(registeredTypes.has(type)) return;
	registeredTypes.set(type,invoker);
	
	try{
		if(isConnected)
			await callRemoteFunction(null,'+',type);
	}catch(e){
		console.warn(e);

		registeredTypes.delete(type);
	}
}

export async function unregisterType(type:string):Promise<void>{
	if(!registeredTypes.has(type)) return;

	try{
		if(isConnected)
			await callRemoteFunction(null,'-',type);
	}catch(e){
		console.warn(e);

		//Also delete locally, as it won't be listened to, and on the server it probably is already unregistered
	}
	registeredTypes.delete(type);
}


async function getMethods(invoker:Invoker):Promise<string[]>{
	const getter=invoker[RpcObjectGetMethods];
	if(getter) return await getter.call(invoker);

	const arr=[];
	for(let key in invoker)
		if(typeof invoker[key]=="function")
			arr.push(key);

	return arr;
}

export async function invoke(invoker:Invoker,type:string,method:string | null,...args:any[]){
	if(method!=null){
		let func=invoker[method];
		if(func==null){
			let ignoreCase=(await getMethods(invoker)).find(s=>s.toLowerCase()==method.toLowerCase());
			if(ignoreCase!=null) func=invoker[ignoreCase];
		}
		//Try finding the same method on a default object, if it is reference equals, then it is a builtin function, that should not be available via RPC
		const reference=({})[method];

		if(func==null||func===reference) throw new Error(`Method \"${method}\" not found in \"${type}\"`);
		return func.call(invoker,...args);
	}

	switch(args.length==0?null:args[0]){
		case "M":
			return getMethods(invoker);
		default:
			throw new Error("Invalid meta-call");
	}
}