import {RpcNameOrId} from "./IdAndName";
import {disposeConnection,receiveRpc} from "./Connection";
import {DataInput} from "../types/data/DataInput";
import {callRemoteFunction} from "../types/functions/FunctionCallContext";
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


let createWebSocket: (query: URLSearchParams)=>Promise<WebSocket>;
if(isNodeJs){
	const url=process.env.RPC_URL;
	if(!url){
		console.warn("RPC_URL is not defined => RPC will not connect");
		createWebSocket=async()=>({} as any as WebSocket);
	}else
		createWebSocket=async(query)=>{
			const uri=new URL(url);
			uri.search=query.toString();
			return new (await import("ws")).WebSocket(uri,process.env.RPC_TOKEN==null?{}: {
				headers:{
					Cookie:"RPC_TOKEN="+process.env.RPC_TOKEN,
				},
			}) as unknown as WebSocket;
		};
}else if("document" in globalThis)
	createWebSocket=async(query)=>new WebSocket("ws"+document.location.origin.substring(4)+"/rpc?"+query);
else throw new Error("Unknown Platform");


function closeRpc(e: Error){
	const reject=rejectWaitUntilConnected;
	waitUntilConnectedAttempt=new Promise<void>((res,rej)=>[resolveWaitUntilConnected,rejectWaitUntilConnected]=[res,rej]);
	reject(e);

	disposeConnection(e);
}


//connect

export let _webSocket: WebSocket | null=null;
(async function reconnect(){
	await Promise.resolve();

	let reportedName=RpcNameOrId;
	let reportedTypes=new Set<string>();

	const query=new URLSearchParams();
	query.set("name",reportedName);
	for(let key of registeredTypes.keys()){
		reportedTypes.add(key);
		query.append("type",key);
	}


	const webSocket=await createWebSocket(query);

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

			const toRegister=new Set(registeredTypes.keys());
			const toDelete=new Set(reportedTypes);

			for(let type of toRegister)
				if(toDelete.delete(type))
					toRegister.delete(type);

			if(toRegister.size||toDelete.size)
				if(RpcNameOrId!=reportedName) await callRemoteFunction(null,'H',RpcNameOrId,[...toRegister.keys()],[...toDelete.keys()]);
				else await callRemoteFunction(null,'H',[...toRegister.keys()],[...toDelete.keys()]);
			else if(RpcNameOrId!=reportedName) await callRemoteFunction(null,'H',RpcNameOrId);
			


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
