import {isConnected} from "../connection/WebSocketConnection";
import {RpcId} from "../connection/RpcId";
import {callRemoteFunction} from "../types/functions/FunctionCallContext";


export type Func=(...args: any[])=>Promise<any>;
export type Invoker={[s:string]:Func|any};
export const registeredFunctions:Invoker=Object.create(null);
export const registeredTypes=new Map<string,Invoker>();
registeredTypes.set("$"+RpcId,registeredFunctions);


export async function registerType(type: string,invoker: Invoker): Promise<void>{
	if(registeredTypes.has(type)) return;
	registeredTypes.set(type,invoker);

	if(isConnected)
		try{
			await callRemoteFunction(null,'+',type);
		}catch(e){
			console.log(e);
		}
}
export async function unregisterType(type:string): Promise<void>{
	if(!registeredTypes.has(type)) return;
	if(isConnected)
		try{
			await callRemoteFunction(null,'-',type);
		}catch(e){
			console.log(e);
		}
	registeredTypes.delete(type);
}

