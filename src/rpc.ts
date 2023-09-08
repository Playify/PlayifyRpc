import {RpcNameOrId,setName} from "./connection/IdAndName";
import {isConnected,waitConnected} from "./connection/WebSocketConnection";
import {createRpcObject,RPC_ROOT} from "./types/RpcObject";
import {createRemoteFunction,registerFunction,unregisterFunction} from "./types/RemoteFunction";
import {callFunction,callLocal,FunctionCallContext,getFunctionContext} from "./types/functions/FunctionCallContext";
import {registerType,unregisterType} from "./internal/RegisteredTypes";
import {RpcId} from "./connection/RpcId";


export * from "./types/data/DataInput";
export * from "./types/data/DataOutput";

export type {FunctionCallContext} from "./types/functions/FunctionCallContext";
export * from "./types/functions/PendingCall";

export * from "./types/RpcObject";
export * from "./types/RemoteFunction";
export * from "./types/RpcError";
export {RpcProvider} from "./types/RpcProviderDecorator";
export {CustomDynamicType} from "./types/data/CustomDynamicTypeDecorator";

import("./rpc").then((m)=>Object.assign(globalThis,m));

export class Rpc{

	//Rpc
	public static id:string=RpcId;
	public static get nameOrId():string{return RpcNameOrId;}
	
	public static setName(name:string){return setName(name);}

	//Connection	
	public static get isConnected():boolean{return isConnected;}
	public static get waitUntilConnected():Promise<void>{return waitConnected();}
	
	//Functions
	public static createRemoteObject=createRpcObject;
	public static createRemoteFunction=createRemoteFunction;
	public static registerFunction=registerFunction;
	public static unregisterFunction=unregisterFunction;
	
	public static callLocal=callLocal;//Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
	public static callFunction=callFunction;//Call remote function
	
	public static getContext:()=>FunctionCallContext=getFunctionContext;
	
	
	public static registerType=registerType;
	public static unregisterType=unregisterType;
	
	
	public static checkTypes=async(...types:string[])=>await callFunction<number>(null,'?',...types);
	public static checkType=async(type:string)=>(await Rpc.checkTypes(type))!=0;
	public static getAllTypes=async()=>await callFunction<string[]>(null,'T');
	public static getAllConnections=async()=>await callFunction<string[]>(null,'C');
	
	public static objects=RPC_ROOT;
}