import {isConnected} from "./WebSocketConnection";
import {callRemoteFunction} from "../types/functions/FunctionCallContext";
import {RpcId} from "./RpcId";


export let RpcNameOrId=RpcId;

export async function setName(name:string|null){
	RpcNameOrId=name!=null?`${name} (${RpcId})`: RpcId;
	try{
		if(isConnected) await callRemoteFunction(null,'N',RpcNameOrId);
	}catch(e){
		console.error(e);
	}
}