import {createRemoteFunction,RemoteFunction} from "./RemoteFunction";

export const RpcObjectType=Symbol("RemoteObjectType");
export type RpcObject<T=RpcObjectTemplate,Type=string>={
	[x in keyof T]:
	x extends "then" | symbol?
		T[x]:
		T[x] extends (...args: any[])=>unknown?
			RemoteFunction<T[x]>:
			RemoteFunction;
} & {
	[RpcObjectType]: Type
};

export type RpcObjectTemplate={
	[s: string]: (...args: any[])=>unknown
}


export function createRpcObject<T extends object=RpcObjectTemplate,TypeString extends string | null=string>(type: TypeString,target: T=<T>{}): RpcObject<T,TypeString>{
	const cache=new Map<string,RemoteFunction>();
	return new Proxy<RpcObject<T,TypeString>>(<any>target,{
		get(_: never,p: string | symbol): any{
			if(p==RpcObjectType) return type;
			if(typeof p!="string"||
				p=="then"//otherwise every RemoteObject would be thenable => would interfere with async await
			) return (<any>target)[p];
			if(cache.has(p)) return cache.get(p);

			const func=createRemoteFunction(
				type,
				p);
			cache.set(p,func);
			return func;
		},
		construct(target: any,argArray: any[]): object{
			return new target(...argArray);
		}
	});
}


export const RPC_ROOT=new Proxy({},{
	get:(_,prop)=>typeof prop=="string"?createRpcObject(prop):undefined,
	has:(_,prop)=>!(prop in globalThis)&&prop!="then",
}) as Record<string,RpcObject>;