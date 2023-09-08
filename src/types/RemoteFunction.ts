import {RpcId} from "../connection/RpcId";
import {callFunction} from "./functions/FunctionCallContext";
import {PendingCall} from "./functions/PendingCall";
import {Func,registeredFunctions} from "../internal/RegisteredTypes";


//TODO make remotefunction its own class

export type RemoteFunction<T extends ((...args:any)=>unknown) =(...args:any[])=>unknown>
	=T extends (...args: infer P)=>infer ReturnType?//if is function
	(((...args: P)=>(//function parameters stay the same
			ReturnType extends Promise<infer PromiseType>?PendingCall<PromiseType>:PendingCall<ReturnType>//return type is always a PendingCall
			))
		//combine with RemoteFunction properties
		& {
		type: string,
		method: string
	})
	: never;


export function isRemoteFunction(func: Func): func is RemoteFunction{
	return "type" in func&&"method" in func;
}

export function createRemoteFunction<T extends ((...args: any)=>any)>(type: string | null,method: string): RemoteFunction<T>{
	return Object.freeze(Object.assign(
		((...params: any[])=>callFunction(type,method,...params)) as any,
		{
			type:type,
			method,
			toString:()=>{
				return `rpc (...params) => ${type??"null"}.${method}(...params)`;
			}
		}
	));
}


let nextId:number=Date.now();
export function registerFunction<T extends ((...args: any)=>any)>(func: T): RemoteFunction<T>{
	if(isRemoteFunction(func)) return func as unknown as RemoteFunction<T>;
	const id=(nextId++).toString(16);

	registeredFunctions[id]=func;

	const type="$"+RpcId;
	return Object.assign(func as any,{//TODO functioncontext
		type,
		method:id,
		toString:()=>{
			return `rpc (...params) => ${type??"null"}.${id}(...params)`;
		}
	});
}

export function unregisterFunction(func: RemoteFunction){
	if(!isRemoteFunction(func)) return;
	const type="$"+RpcId;
	if(func.type!=type) throw new Error("Can't unregister RemoteFunction, that was not registered locally");

	const registered=registeredFunctions[func.method] as RemoteFunction;
	delete registeredFunctions[func.method];
	// @ts-ignore
	delete registered.type;
	// @ts-ignore
	delete registered.method;
}