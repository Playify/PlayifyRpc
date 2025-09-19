import {RpcFunction} from "./RpcFunction.js";
import {callRemoteFunction} from "./functions/FunctionCallContext.js";

import * as RpcSymbols from "./RpcSymbols";

export {RpcSymbols};

export type RpcObject<T=RpcObjectTemplate,Type=string>={
	[x in keyof T]:
	x extends "then" | symbol?
		T[x]:
		T[x] extends (...args:any[])=>unknown?
			RpcFunction<T[x]>:
			RpcFunction<any>;
} & {
	[RpcSymbols.ObjectType]:Type,
	[RpcSymbols.ObjectExists]:()=>Promise<boolean>
	[RpcSymbols.GetMethods]:()=>Promise<string[]>
	[RpcSymbols.GetRpcVersion]:()=>Promise<string>
} & Omit<{
	(_:"type"):Type
},"toString">;

export type RpcObjectTemplate={
	[s:string]:(...args:any[])=>unknown
}

const metaObject=<Type extends string>(type:Type)=>({
	[RpcSymbols.ObjectType]:type,
	[RpcSymbols.ObjectExists]:()=>callRemoteFunction<boolean>(null,"E",type),
	[RpcSymbols.GetMethods]:()=>callRemoteFunction<string[]>(type,null,"M"),
	[RpcSymbols.GetRpcVersion]:()=>callRemoteFunction<string>(type,null,"V"),
}) as const;


export function createRemoteObject<
	T extends object=RpcObjectTemplate,
	TypeString extends string=string
>(
	type:TypeString,
	target:T=new class RpcObject{
		[RpcSymbols.ObjectType]=null!;//Predefine symbols here, so it shows up in devtools as possible keys
		[RpcSymbols.ObjectExists]=null!;
		[RpcSymbols.GetMethods]=null!;
		[RpcSymbols.GetRpcVersion]=null!;
	} as T,
):RpcObject<T,TypeString>{

	const cache=new Map<string,RpcFunction<any>>();
	const meta=metaObject(type);


	return new Proxy<RpcObject<T,TypeString>>(<any>target,{
		get(_:never,p:string | symbol):any{
			if(p in meta)return (meta as any)[p];
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
		construct(target:any,argArray:any[]):object{
			return new target(...argArray);
		},
		has(_:never,p:string | symbol):boolean{
			return p in meta||p in target;
		},
	});
}