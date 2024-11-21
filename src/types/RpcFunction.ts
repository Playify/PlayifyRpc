import {RpcId} from "../connection/RpcId.js";
import {callRemoteFunction} from "./functions/FunctionCallContext.js";
import {PendingCall} from "./functions/PendingCall.js";
import {registeredFunctions} from "../internal/RegisteredTypes.js";


type UnwrapPromise<T>=T extends Promise<infer U>?U:T;

type Overloaded<T>=T extends {
	(...args:infer P1):infer R1
	(...args:infer P2):infer R2
	(...args:infer P3):infer R3
	(...args:infer P4):infer R4
	(...args:infer P5):infer R5
	(...args:infer P6):infer R6
	(...args:infer P7):infer R7
	(...args:infer P8):infer R8
}?{
	(...args:P1):PendingCall<UnwrapPromise<R1>>
	(...args:P2):PendingCall<UnwrapPromise<R2>>
	(...args:P3):PendingCall<UnwrapPromise<R3>>
	(...args:P4):PendingCall<UnwrapPromise<R4>>
	(...args:P5):PendingCall<UnwrapPromise<R5>>
	(...args:P6):PendingCall<UnwrapPromise<R6>>
	(...args:P7):PendingCall<UnwrapPromise<R7>>
	(...args:P8):PendingCall<UnwrapPromise<R8>>
}:T extends {
	(...args:infer P1):infer R1
	(...args:infer P2):infer R2
	(...args:infer P3):infer R3
	(...args:infer P4):infer R4
	(...args:infer P5):infer R5
	(...args:infer P6):infer R6
	(...args:infer P7):infer R7
}?{
	(...args:P1):PendingCall<UnwrapPromise<R1>>
	(...args:P2):PendingCall<UnwrapPromise<R2>>
	(...args:P3):PendingCall<UnwrapPromise<R3>>
	(...args:P4):PendingCall<UnwrapPromise<R4>>
	(...args:P5):PendingCall<UnwrapPromise<R5>>
	(...args:P6):PendingCall<UnwrapPromise<R6>>
	(...args:P7):PendingCall<UnwrapPromise<R7>>
}:T extends {
	(...args:infer P1):infer R1
	(...args:infer P2):infer R2
	(...args:infer P3):infer R3
	(...args:infer P4):infer R4
	(...args:infer P5):infer R5
	(...args:infer P6):infer R6
}?{
	(...args:P1):PendingCall<UnwrapPromise<R1>>
	(...args:P2):PendingCall<UnwrapPromise<R2>>
	(...args:P3):PendingCall<UnwrapPromise<R3>>
	(...args:P4):PendingCall<UnwrapPromise<R4>>
	(...args:P5):PendingCall<UnwrapPromise<R5>>
	(...args:P6):PendingCall<UnwrapPromise<R6>>
}:T extends {
	(...args:infer P1):infer R1
	(...args:infer P2):infer R2
	(...args:infer P3):infer R3
	(...args:infer P4):infer R4
	(...args:infer P5):infer R5
}?{
	(...args:P1):PendingCall<UnwrapPromise<R1>>
	(...args:P2):PendingCall<UnwrapPromise<R2>>
	(...args:P3):PendingCall<UnwrapPromise<R3>>
	(...args:P4):PendingCall<UnwrapPromise<R4>>
	(...args:P5):PendingCall<UnwrapPromise<R5>>
}:T extends {
	(...args:infer P1):infer R1
	(...args:infer P2):infer R2
	(...args:infer P3):infer R3
	(...args:infer P4):infer R4
}?{
	(...args:P1):PendingCall<UnwrapPromise<R1>>
	(...args:P2):PendingCall<UnwrapPromise<R2>>
	(...args:P3):PendingCall<UnwrapPromise<R3>>
	(...args:P4):PendingCall<UnwrapPromise<R4>>
}:T extends {
	(...args:infer P1):infer R1
	(...args:infer P2):infer R2
	(...args:infer P3):infer R3
}?{
	(...args:P1):PendingCall<UnwrapPromise<R1>>
	(...args:P2):PendingCall<UnwrapPromise<R2>>
	(...args:P3):PendingCall<UnwrapPromise<R3>>
}:T extends {
	(...args:infer P1):infer R1
	(...args:infer P2):infer R2
}?{
	(...args:P1):PendingCall<UnwrapPromise<R1>>
	(...args:P2):PendingCall<UnwrapPromise<R2>>
}:T extends {
	(...args:infer P1):infer R1
}?{
	(...args:P1):PendingCall<UnwrapPromise<R1>>
}:T extends (...args:infer P)=>infer R? //Fallback: check if any function, with possibly too many overloads, otherwise use the generic T as return value
	(...args:P)=>PendingCall<UnwrapPromise<R>>:
	()=>PendingCall<UnwrapPromise<T>>;


const RpcFunctionClass=class RpcFunction extends (function Extendable(func:Function){
	return Object.setPrototypeOf(func,new.target.prototype);
} as any){

	constructor(
		public readonly type:string,
		public readonly method:string,
	){
		super(callRemoteFunction.bind(null,type,method));
	}

	async getMethodSignatures(typeScript:boolean=false):Promise<[parameters:string[],returns:string][]>{
		// noinspection ES6RedundantAwait
		return await callRemoteFunction(this.type,null,"S",this.method,typeScript);
	}

	toString(){
		return `rpc (...params) => ${this.type??"null"}.${this.method}(...params)`;
	}
};

export const RpcFunction:{
	new<FuncOrReturnType>(type:string,method:string):RpcFunction<FuncOrReturnType>
}=RpcFunctionClass as {new(type:string,method:string):any};

export type RpcFunction<FuncOrReturnType>=InstanceType<typeof RpcFunctionClass> & Overloaded<FuncOrReturnType>





let nextId:number=Date.now();
const functionCache=new WeakMap<((...args:any)=>any),string>();

export function registerFunction<T extends ((...args:any)=>any)>(func:T):RpcFunction<T>{
	if(func instanceof RpcFunction) return func as RpcFunction<any> as RpcFunction<T>;
	const already=functionCache.get(func);
	if(already!=null) return new RpcFunction("$"+RpcId,already);
	const id=(nextId++).toString(16);

	registeredFunctions[id]=func;
	functionCache.set(func,id);

	const type="$"+RpcId;
	return new RpcFunction(type,id);
}

export function unregisterFunction(func:RpcFunction<any>){
	const type="$"+RpcId;
	if(func.type!=type) throw new Error("Can't unregister RemoteFunction, that was not registered locally");

	delete registeredFunctions[func.method];
	functionCache.delete(func);
}