import {Rpc,RpcError} from "../rpc";


export const delayAsync=(millis:number):Promise<void>=>new Promise<void>(res=>setTimeout(res,millis));

export function rpcAutoRecall(onMessage:(...args:any[])=>void,onError:null | ((e?:RpcError)=>void),type:string,method:string,...args:any[]){
	(async()=>{
		// noinspection InfiniteLoopJS
		while(true){
			let ex:RpcError | undefined=undefined;
			try{
				await Rpc.callFunction(type,method,...args).addMessageListener(onMessage);
			}catch(e){
				ex=e as RpcError;
			}
			onError?.(ex);

			await delayAsync(1000);
		}
	})();
}

export function rpcListenValue<T>(type:string,method:string,...args:any[]):()=>T{
	let value:T;
	rpcAutoRecall(msg=>value=msg,null,type,method,...args);
	return ()=>value;
}
export function rpcListenValueWithDefault<T>(def:T,type:string,method:string,...args:any[]):()=>T{
	let value:T;
	rpcAutoRecall(msg=>value=msg,()=>value=def,type,method,...args);
	return ()=>value;
}
export function rpcListenSetter<T>(onChange:(t:T)=>void,type:string,method:string,...args:any[]):void{
	rpcAutoRecall(msg=>onChange(msg),null,type,method,...args);
}
export function rpcListenSetterWithDefault<T>(onChange:(t:T)=>void,def:T,type:string,method:string,...args:any[]):void{
	rpcAutoRecall(msg=>onChange(msg),()=>onChange(def),type,method,...args);
}