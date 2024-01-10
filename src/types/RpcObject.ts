import {RpcFunction} from "./RemoteFunction";
import {callRemoteFunction} from "./functions/FunctionCallContext";

export const RpcObjectType=Symbol("RpcObjectType");
export const RpcObjectGetMethods=Symbol("RpcObjectGetMethods");
export type RpcObject<T=RpcObjectTemplate,Type=string>={
	[x in keyof T]:
	x extends "then" | symbol?
		T[x]:
		T[x] extends (...args: any[])=>unknown?
			RpcFunction<T[x]>:
			RpcFunction<any>;
} & {
	[RpcObjectType]: Type,
	[RpcObjectGetMethods]: ()=>Promise<string[]>
};

export type RpcObjectTemplate={
	[s: string]: (...args: any[])=>unknown
}


export function createRemoteObject<
	T extends object=RpcObjectTemplate,
	TypeString extends string=string
>(
	type: TypeString,
	target: T=new class RpcObject{[RpcObjectType]=type} as T,
): RpcObject<T,TypeString>{
	
	const cache=new Map<string,RpcFunction<any>>();
	
	
	return new Proxy<RpcObject<T,TypeString>>(<any>target,{
		get(_: never,p: string | symbol): any{
			if(p==RpcObjectType) return type;
			if(p==RpcObjectGetMethods) return ()=>callRemoteFunction(type,null,"M");
			if(typeof p!="string"||
				p=="then"//otherwise every RemoteObject would be thenable => would interfere with async await
			) return (<any>target)[p];
			if(cache.has(p)) return cache.get(p);

			const func=new RpcFunction(
				type,
				p);
			cache.set(p,func);
			return func;
		},
		construct(target: any,argArray: any[]): object{
			return new target(...argArray);
		},
		has(_:never,p: string | symbol): boolean{
			return p==RpcObjectType||p==RpcObjectGetMethods||p in target;
		},
	});
}


export const RPC_ROOT=new Proxy({},{
	get:(_,prop)=>typeof prop=="string"?createRemoteObject(prop):undefined,
	has:(_,prop)=>typeof prop=="string"&&prop!="then",
}) as Record<string,RpcObject>;