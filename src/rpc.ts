import {RpcNameOrId,setName} from "./connection/IdAndName";
import {isConnected,waitConnected} from "./connection/WebSocketConnection";
import {createRemoteObject,RPC_ROOT,RpcObjectGetMethods,RpcObjectType} from "./types/RpcObject";
import {registerFunction,RpcFunction,unregisterFunction} from "./types/RemoteFunction";
import {
	callLocal,
	callRemoteFunction,
	FunctionCallContext,
	getFunctionContext,
} from "./types/functions/FunctionCallContext";
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

// noinspection JSUnusedGlobalSymbols
export class Rpc{

	//Rpc
	public static readonly id: string=RpcId;

	public static get nameOrId(): string{return RpcNameOrId;}

	public static setName(name: string){return setName(name);}

	//Connection	
	public static get isConnected(): boolean{return isConnected;}

	public static get waitUntilConnected(): Promise<void>{return waitConnected();}

	//Functions
	public static createObject=createRemoteObject;
	public static createFunction=<T>(type: string,method: string)=>new RpcFunction<T>(type,method);
	public static registerFunction=registerFunction;
	public static unregisterFunction=unregisterFunction;

	public static callLocal=callLocal;//Call function and get a PendingCall, this allows the use of the FunctionCallContext within the function
	public static callFunction=callRemoteFunction;//Call remote function

	public static getContext: ()=>FunctionCallContext=getFunctionContext;

	//Types
	public static registerType=registerType;
	public static unregisterType=unregisterType;


	public static getObjectWithFallback=async(type: string,...types: string[]): Promise<number>=>await callRemoteFunction("Rpc","getObjectWithFallback",type,...types);
	public static checkTypes=async(...types: string[]): Promise<number>=>await callRemoteFunction("Rpc","checkTypes",...types);
	public static checkType=async(type: string): Promise<boolean>=>await callRemoteFunction("Rpc","checkType",type);
	public static getAllTypes=async(): Promise<string[]>=>await callRemoteFunction("Rpc","getAllTypes");
	public static getAllConnections=async(): Promise<string[]>=>await callRemoteFunction("Rpc","getAllConnections");
	public static getRegistrations=async(): Promise<(Record<string,string[]>)>=>await callRemoteFunction("Rpc","getRegistrations");
	public static eval=async(expression: string): Promise<string>=>await callRemoteFunction("Rpc","eval",expression);

	public static root=RPC_ROOT;
	public static objectType=RpcObjectType;
	public static getMethods=RpcObjectGetMethods;
}