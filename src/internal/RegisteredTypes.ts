import {isConnected} from "../connection/WebSocketConnection.js";
import {randomId,RpcId} from "../connection/RpcId.js";
import {callRemoteFunction} from "../types/functions/FunctionCallContext.js";
import {RpcSymbols} from "../types/RpcObject.js";
import {RpcError,RpcMetaMethodNotFoundError,RpcMethodNotFoundError} from "../types/errors/RpcError.js";
import {
	getFunctionParameterNames,
	ProgrammingLanguage,
	ProgrammingLanguageEnumFromAny,
	ProgrammingLanguageOrAny
} from "./functionParameterNames";
// @ts-ignore
import {version} from "../../package.json";


export type Func=((...args:any[])=>Promise<any>)&{
	[RpcSymbols.GetMethodSignatures]?:(lang:ProgrammingLanguageOrAny)=>Promise<[parameters:string[],returns:string][]>
};
export type Invoker={
	[RpcSymbols.GetMethods]?:()=>Promise<string[]>,
	[RpcSymbols.GetMethodSignatures]?:(method:string,lang:ProgrammingLanguageOrAny)=>Promise<[parameters:string[],returns:string][]>,
	[RpcSymbols.GetRpcVersion]?:()=>Promise<string>,
	[s:string]:Func | any,
};
export const registeredFunctions:Invoker=Object.create(null);
export const registeredTypes=new Map<string,Invoker>();
registeredTypes.set("$"+RpcId,registeredFunctions);


export function generateTypeName(){
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
		case "S":
			return getMethodSignatures(invoker,type,args[1]==null?null:""+args[1],+args[2]);
		case "V":
			return getRpcVersion(invoker);
		default:
			throw RpcMetaMethodNotFoundError.new(type,meta);
	}
}
async function getMethodSignatures(invoker:Invoker,type:string,method:string|null,langOrAny:ProgrammingLanguageOrAny):Promise<[parameters:string[],returns:string][]>{
	const lang=ProgrammingLanguageEnumFromAny(langOrAny);
	if(method==null)return [
		[["M"],"string[]"],
		[["S",lang?"method:string|null":"string? method",lang?"lang:ProgrammingLanguage":"ProgrammingLanguage lang"],lang?"[parameters:string[],returns:string][]":"(string[] parameters,string @return)[]"],
		[["V"],"string"],
	];
	const getter=invoker[RpcSymbols.GetMethodSignatures];
	if(getter) return await getter.call(invoker,method,lang);
	
	const func:Func=invoker[method];
	if(!func) throw new RpcMethodNotFoundError(type,method);
	let getter2=func[RpcSymbols.GetMethodSignatures];
	if(getter2) return getter2.call(func,lang);
	
	switch(lang){
		default:
		case ProgrammingLanguage.CSharp:
			return [[getFunctionParameterNames(func).map(p=>p.startsWith("...")?`params dynamic[] ${p.substring(3)}`:`dynamic ${p}`),"dynamic"]];
		case ProgrammingLanguage.TypeScript:
			return [[getFunctionParameterNames(func).map(p=>`${p}:any${p.startsWith("...")?"[]":""}`),"any"]];
		case ProgrammingLanguage.JavaScript:
			return [[getFunctionParameterNames(func),"any"]];
	}
}

async function getMethods(invoker:Invoker):Promise<string[]>{
	const getter=invoker[RpcSymbols.GetMethods];
	if(getter) return await getter.call(invoker);

	return Object.getOwnPropertyNames(invoker).filter(key=>typeof invoker[key]=="function");
}

async function getRpcVersion(invoker:Invoker):Promise<string>{
	const getter=invoker[RpcSymbols.GetRpcVersion];
	if(getter) return await getter.call(invoker);
	return version+" JS";
}