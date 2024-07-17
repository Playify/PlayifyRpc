import {isConnected} from "./WebSocketConnection.js";
import {callRemoteFunction} from "../types/functions/FunctionCallContext.js";


export let RpcName:string|null=null;

export async function setName(name:string|null){
	RpcName=name;
	try{
		if(isConnected) await callRemoteFunction(null,'N',name);
	}catch(e){
		console.error(`[Rpc] Error changing name to "${name}":`,e);
	}
}