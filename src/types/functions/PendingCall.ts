import {FunctionCallContext} from "./FunctionCallContext.js";
import {RpcError} from "../RpcError.js";
import {freeDynamic} from "../data/DynamicData.js";
import {Rpc} from "../../rpc";

type Action<T>=(t:T)=>void;

export class PendingCall<T=unknown> implements Promise<T>{
	public readonly [Symbol.toStringTag]:string="PendingCall";
	public finished=false;
	public readonly promise:Promise<T>;

	constructor(skip:number,dispose:unknown[]){
		try{
			// noinspection ExceptionCaughtLocallyJS
			throw new Error();
		}catch(stackSource){
			this.promise=new Promise((resolve,reject)=>{
				resolveCall.set(this,t=>{
					resolveCall.delete(this);
					rejectCall.delete(this);
					this.finished=true;
					resolve(t);
					freeDynamic(dispose);
				});
				rejectCall.set(this,e=>{
					resolveCall.delete(this);
					rejectCall.delete(this);
					this.finished=true;
					reject(e instanceof RpcError?e.unfreeze(stackSource as any,skip):e);
					freeDynamic(dispose);
				});
			});
		}
	}

	catch<TResult=never>(onrejected?:((reason:any)=>(PromiseLike<TResult> | TResult)) | undefined | null):Promise<T | TResult>{
		return this.promise.catch(onrejected);
	}

	finally(onfinally?:(()=>void) | undefined | null):Promise<T>{
		return this.promise.finally(onfinally);
	}

	then<TResult1=T,TResult2=never>(onfulfilled?:((value:T)=>(PromiseLike<TResult1> | TResult1)) | undefined | null,onrejected?:((reason:any)=>(PromiseLike<TResult2> | TResult2)) | undefined | null):Promise<TResult1 | TResult2>{
		return this.promise.then(onfulfilled,onrejected);
	}

	sendMessage(..._args:any[]):PendingCall<T>{//overridden by callFunction and callLocal
		return this;
	}

	addMessageListener<Args extends any[]=any[]>(func:(...args:Args)=>void):PendingCall<T>{
		return registerReceive(this,func as (...args:any[])=>void);
	}

	cancel(){
	}//overridden by callFunction and callLocal
	
	getCaller():Promise<string>{
		return Promise.resolve(Rpc.prettyName);
	}//overridden by callFunction and callLocal

	[Symbol.asyncIterator]():AsyncIterator<any[]>{
		return getAsyncIterator(this);
	}
}

export function getAsyncIterator(call:PendingCall | FunctionCallContext):AsyncIterator<unknown[]>{
	let didReceive:IteratorResult<unknown[]>[]=[];
	let waitReceive:((r:IteratorResult<unknown[]>)=>void)[]=[];

	call.promise.catch(()=>{});
	call.promise.finally(()=>{
		for(let request of waitReceive) request({done:true,value:undefined});
	});
	call.addMessageListener((...args)=>{
		(waitReceive.shift()??didReceive.push)({done:false,value:args});
	});

	return {
		async next():Promise<IteratorResult<unknown[]>>{
			if(call.finished) return {done:true,value:undefined};
			return didReceive.shift()?? await new Promise(res=>waitReceive.push(res));
		},
	};
}

export const resolveCall=new WeakMap<PendingCall,Action<any>>();
export const rejectCall=new WeakMap<PendingCall,Action<unknown>>();
export const pendingMap=new WeakMap<PendingCall | FunctionCallContext,(any[])[]>();
export const listenersMap=new WeakMap<PendingCall | FunctionCallContext,((...args:any[])=>void)[]>();

export function registerReceive<AnyCall extends PendingCall | FunctionCallContext>(call:AnyCall,func:(...args:any[])=>void){
	if(listenersMap.has(call)){
		listenersMap.get(call)!.push(func);
	}else{
		listenersMap.set(call,[func]);
		const pendings=pendingMap.get(call)??[];
		for(let pending of pendings){
			try{
				func(...pending);
			}catch(e){
				console.warn("Error receiving pending: ",e);
			}
		}
	}
	return call;
}

export function runReceiveMessage(call:PendingCall | FunctionCallContext,args:any[]){
	if(call.finished) return;

	if(listenersMap.has(call)){
		for(let func of listenersMap.get(call)!){
			try{
				func(...args);
			}catch(e){
				console.warn("Error receiving: ",e);
			}
		}
	}else if(pendingMap.has(call)){
		pendingMap.set(call,[...pendingMap.get(call)!,args]);
	}else{
		pendingMap.set(call,[args]);
	}
}