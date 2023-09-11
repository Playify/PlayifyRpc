import {isConnected} from "./WebSocketConnection";
import {callRemoteFunction} from "../types/functions/FunctionCallContext";
import {RpcId} from "./RpcId";


let _name:string|null;
export let RpcNameOrId=RpcId;

export async function setName(name:string|null){
	_name=name;
	RpcNameOrId=_name!=null?`${_name} (${RpcId})`: RpcId;
	try{
		if(isConnected) await callRemoteFunction(null,'N',RpcNameOrId);
	}catch(e){
		console.error(e);
	}
}