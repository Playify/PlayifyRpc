import {isConnected} from "../connection/WebSocketConnection.js";
import {randomId,RpcId} from "../connection/RpcId.js";
import {callRemoteFunction} from "../types/functions/FunctionCallContext.js";
import {RpcObjectGetMethods} from "../types/RpcObject.js";
import {RpcError} from "../types/RpcError.js";
import {RpcMetaMethodNotFoundError,RpcMethodNotFoundError} from "../types/errors/PredefinedErrors.js";


export type Func=(...args:any[])=>Promise<any>;
export type Invoker={
	[RpcObjectGetMethods]?:()=>Promise<string[]>,
	[s:string]:Func | any,
};
export const registeredFunctions:Invoker=Object.create(null);
export const registeredTypes=new Map<string,Invoker>();
registeredTypes.set("$"+RpcId,registeredFunctions);


export async function generateTypeName(){
	return "$"+RpcId+"$"+randomId();
}

export async function registerType(type:string,invoker:Invoker):Promise<void>{
	if(registeredTypes.has(type)) return;
	registeredTypes.set(type,invoker);
	
	try{
		if(isConnected)
			await callRemoteFunction(null,'+',type);
	}catch(e){
		console.error(`[Rpc] Error registering type "${type}":`,e);

		registeredTypes.delete(type);
	}
}

export async function unregisterType(type:string):Promise<void>{
	if(!registeredTypes.has(type)) return;

	try{
		if(isConnected)
			await callRemoteFunction(null,'-',type);
	}catch(e){
		console.error(`[Rpc] Error unregistering type "${type}":`,e);

		//Also delete locally, as it won't be listened to, and on the server it probably is already unregistered
	}
	registeredTypes.delete(type);
}


async function getMethods(invoker:Invoker):Promise<string[]>{
	const getter=invoker[RpcObjectGetMethods];
	if(getter) return await getter.call(invoker);

	return Object.getOwnPropertyNames(invoker).filter(key=>typeof invoker[key]=="function");
}

export async function invoke(invoker:Invoker,type:string,method:string | null,...args:any[]):Promise<any>{
	if(method!=null){
		let func=invoker[method];
		if(func==null){
			let ignoreCase=(await getMethods(invoker)).find(s=>s.toLowerCase()==method.toLowerCase());
			if(ignoreCase!=null) func=invoker[ignoreCase];
		}
		//Try finding the same method on a default object, if it is reference equals, then it is a builtin function, that should not be available via RPC
		const reference=({})[method];

		if(func==null||func===reference)throw RpcMethodNotFoundError.new(type,method);
		try{
			return await (({
				async $RPC_MARKER_BEGIN$(){
					return await func.call(invoker,...args);
				}
			})["$RPC_MARKER_BEGIN$"])();
			//return await rpcMarkInternal(async()=>await func.call(invoker,...args));
		}catch(e){
			throw RpcError.wrapAndFreeze(e as Error);
		}
	}

	const meta=args.length==0?null:args[0];
	switch(meta){
		case "M":
			return getMethods(invoker);
		default:
			throw RpcMetaMethodNotFoundError.new(type,meta);
	}
}