import {RpcNameOrId} from "./IdAndName";
import {disposeConnection,receiveRpc} from "./Connection";
import {DataInput} from "../types/data/DataInput";
import {callFunction} from "../types/functions/FunctionCallContext";
import {registeredTypes} from "../internal/RegisteredTypes";
import {isNodeJs} from "./RpcId";


export let isConnected=false;


let resolveWaitUntilConnected: VoidFunction,rejectWaitUntilConnected: (e: Error)=>void;
let waitUntilConnectedAttempt=new Promise<void>((res,rej)=>[resolveWaitUntilConnected,rejectWaitUntilConnected]=[res,rej]);

export async function waitConnected(){
	while(true)
		if(await waitUntilConnectedAttempt.then(()=>true,()=>false))
			return;
}


let createWebSocket: ()=>WebSocket;
if(isNodeJs){
	const WebSocket=(await import("ws")).WebSocket;
	createWebSocket=()=>new WebSocket(process.env.RPC_URL!,{
		headers:{
			Cookie:"token="+process.env.RPC_TOKEN
		}
	}) as unknown as WebSocket
}else if("document" in globalThis){
	createWebSocket=()=>new WebSocket("ws"+globalThis.document.location.origin.substring(4)+"/rpc");
}else throw new Error("Unknown Platform");


function closeRpc(e: Error){
	const reject=rejectWaitUntilConnected;
	waitUntilConnectedAttempt=new Promise<void>((res,rej)=>[resolveWaitUntilConnected,rejectWaitUntilConnected]=[res,rej]);
	reject(e);

	disposeConnection(e);
}


//connect

export let _webSocket: WebSocket | null=null;
(function reconnect(){
	const webSocket=createWebSocket();

	webSocket.onclose=()=>{
		_webSocket=null;
		isConnected=false;
		console.log("Websocket disconnected");
		const e=new Error("Connection closed");
		closeRpc(e);
		setTimeout(reconnect,1000);
	};
	webSocket.onopen=async()=>{
		console.log("Websocket connected");

		try{
			_webSocket=webSocket;

			await callFunction(null,'N',RpcNameOrId);
			await callFunction(null,'+',...registeredTypes.keys());

			isConnected=true;
			resolveWaitUntilConnected();


			// @ts-ignore
		}catch(e: Error){
			console.error(e.stack);
			closeRpc(e);

			webSocket?.close(4000,"Error registering types");
			return;
		}
	};

	webSocket.binaryType="arraybuffer";
	webSocket.onmessage=function onMessage(e: MessageEvent){
		const data=e.data;

		if(typeof data=="string"){
			console.log(data);
		}else{
			// noinspection JSIgnoredPromiseFromCall
			receiveRpc(new DataInput(new Uint8Array(data)));
		}
	};
}());
