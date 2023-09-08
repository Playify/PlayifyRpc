import {FunctionCallContext} from "./FunctionCallContext";

type Action<T>=(t: T)=>void;

export class PendingCall<T=unknown> implements Promise<T>{
	public readonly [Symbol.toStringTag]: string="PendingCall";
	public finished=false;
	public readonly promise: Promise<T>;

	constructor(){
		this.promise=new Promise((resolve,reject)=>{
			resolveCall.set(this as PendingCall,t=>{
				resolve(t);
				this.finished=true
			});
			rejectCall.set(this as PendingCall,e=>{
				reject(e);
				this.finished=true
			});
		});
	}

	catch<TResult=never>(onrejected?: ((reason: any)=>(PromiseLike<TResult> | TResult)) | undefined | null): Promise<T | TResult>{
		return this.promise.catch(onrejected);
	}

	finally(onfinally?: (()=>void) | undefined | null): Promise<T>{
		return this.promise.finally(onfinally);
	}

	then<TResult1=T,TResult2=never>(onfulfilled?: ((value: T)=>(PromiseLike<TResult1> | TResult1)) | undefined | null,onrejected?: ((reason: any)=>(PromiseLike<TResult2> | TResult2)) | undefined | null): Promise<TResult1 | TResult2>{
		return this.promise.then(onfulfilled,onrejected);
	}

	// noinspection JSUnusedLocalSymbols
	sendMessage(...args: any[]):PendingCall<T>{//overridden by callFunction and callLocal
		return this;
	}

	addMessageListener<Args extends any[]=any[]>(func: (...args: Args)=>void):PendingCall<T>{
		registerReceive(this,func as (...args: any[])=>void);
		return this;
	}

	cancel(){}//overridden by callFunction and callLocal

	[Symbol.asyncIterator](): AsyncIterator<any[]>{
		return getAsyncIterator(this);
	}
}

export function getAsyncIterator(call: PendingCall | FunctionCallContext): AsyncIterator<unknown[]>{
	let pending:unknown[][]=[];
	let requests:((tuple:[unknown[]]|undefined)=>void)[]=[];//undefined means finished
	let finished=call.finished;
	
	call.promise.finally(()=>{
		finished=true;
		for(let request of requests) request(undefined);
	});
	call.addMessageListener((...args)=>pending.push(args));
	
	return {
		async next(): Promise<IteratorResult<unknown[]>>{
			if(finished||call.finished)return{done:true,value:undefined};
			if(pending.length)return {done:false,value:pending.shift()!};
			
			const requestResult=await new Promise<[unknown[]]|undefined>(res=>requests.push(res));
			if(requestResult==null) return {done:true,value:undefined};
			return {done:false,value:requestResult[0]};
		}
	}
}

export const resolveCall=new WeakMap<PendingCall,Action<any>>();
export const rejectCall=new WeakMap<PendingCall,Action<Error>>();
export const pendingMap=new WeakMap<PendingCall | FunctionCallContext,(any[])[]>();
export const listenersMap=new WeakMap<PendingCall | FunctionCallContext,((...args: any[])=>void)[]>();

export function registerReceive(call: PendingCall | FunctionCallContext,func: (...args: any[])=>void){
	if(listenersMap.has(call)){
		listenersMap.get(call)!.push(func);
	}else{
		listenersMap.set(call,[func]);
		const pendings=pendingMap.get(call)??[];
		for(let pending of pendings){
			try{
				func(...pending);
			}catch(e){
				console.warn("Error receiving pending: "+e);
			}
		}
	}
}

export function runReceiveMessage(call: PendingCall | FunctionCallContext,args: any[]){
	if(call.finished) return;

	if(listenersMap.has(call)){
		for(let func of listenersMap.get(call)!){
			try{
				func(...args);
			}catch(e){
				console.warn("Error receiving: "+e);
			}
		}
	}else if(pendingMap.has(call)){
		pendingMap.set(call,[...pendingMap.get(call)!,args]);
	}else{
		pendingMap.set(call,[args]);
	}
}