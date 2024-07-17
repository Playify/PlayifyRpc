import {RpcName} from "./RpcName.js";
import {disposeConnection,receiveRpc} from "./Connection.js";
import {DataInput} from "../types/data/DataInput.js";
import {callRemoteFunction} from "../types/functions/FunctionCallContext.js";
import {registeredTypes} from "../internal/RegisteredTypes.js";
import {isNodeJs,RpcId} from "./RpcId.js";
import {RpcConnectionError} from "../types/errors/PredefinedErrors.js";
import {Rpc} from "../rpc.js";


export let isConnected=false;


let resolveWaitUntilConnected:VoidFunction,rejectWaitUntilConnected:(e:Error)=>void;
let waitUntilConnectedAttempt=new Promise<void>((res,rej)=>[resolveWaitUntilConnected,rejectWaitUntilConnected]=[res,rej]);
waitUntilConnectedAttempt.catch(()=>{
});//Prevent uncaught error warning

export async function waitConnected(){
	while(true)
		if(await waitUntilConnectedAttempt.then(()=>true,()=>false))
			return;
}

let createWebSocket:(query:URLSearchParams)=>Promise<WebSocket>;
if(isNodeJs){
	const RPC_URL="RPC_URL" in globalThis?(globalThis as any)["RPC_URL"]:process.env.RPC_URL;
	const RPC_TOKEN="RPC_TOKEN" in globalThis?(globalThis as any)["RPC_TOKEN"]:process.env.RPC_TOKEN;
	if(!RPC_URL){
		console.warn("RPC_URL is not defined => RPC will not connect");
		createWebSocket=async()=>({} as any as WebSocket);
	}else
		createWebSocket=async(query)=>{
			const uri=new URL(RPC_URL);
			uri.search=query.toString();
			const ws:typeof import("ws").WebSocket="require" in globalThis?globalThis["require"]("ws"):(await import("ws")).WebSocket;

			return new ws(uri,RPC_TOKEN==null?{}:{
				headers:{
					Cookie:"RPC_TOKEN="+RPC_TOKEN,
				},
			}) as unknown as WebSocket;
		};
}else if("document" in globalThis)
	createWebSocket=async(query)=>new WebSocket("ws"+document.location.origin.substring(4)+"/rpc?"+query);
else{//Unknown Platform
	const RPC_URL="RPC_URL" in globalThis?(globalThis as any)["RPC_URL"]:process.env.RPC_URL;
	const RPC_TOKEN="RPC_TOKEN" in globalThis?(globalThis as any)["RPC_TOKEN"]:process.env.RPC_TOKEN;
	if(!RPC_URL){
		console.warn("RPC_URL is not defined => RPC will not connect");
		createWebSocket=async()=>({} as any as WebSocket);
	}else
		createWebSocket=async(query)=>{
			const uri=new URL(RPC_URL);
			uri.search=query.toString();
			return new WebSocket(uri,RPC_TOKEN==null?{}:{
				headers:{
					Cookie:"RPC_TOKEN="+RPC_TOKEN,
				},
			} as any) as unknown as WebSocket;
		};
}


function closeRpc(e:Error){
	const reject=rejectWaitUntilConnected;
	waitUntilConnectedAttempt=new Promise<void>((res,rej)=>[resolveWaitUntilConnected,rejectWaitUntilConnected]=[res,rej]);
	waitUntilConnectedAttempt.catch(()=>{
	});//Prevent uncaught error warning
	reject(e);

	disposeConnection(e);
}


//connect


export let _webSocket:WebSocket | null=null;


export async function connectOnce(reconnect:VoidFunction){
	let reportedName=RpcName;
	let reportedTypes=new Set<string>();

	const query=new URLSearchParams();
	query.set("id",RpcId);
	reportedTypes.add("$"+RpcId);

	if(reportedName!=null)
		query.set("name",reportedName);

	for(let key of registeredTypes.keys())
		if(!reportedTypes.has(key)){
			reportedTypes.add(key);
			query.append("type",key);
		}


	const webSocket=await createWebSocket(query);

	webSocket.onclose=()=>{
		setTimeout(reconnect,1000);

		if(!_webSocket) return;
		_webSocket=null;
		isConnected=false;
		console.log("Reconnecting to RPC");
		closeRpc(RpcConnectionError.new("Connection closed by "+Rpc.prettyName));
	};
	webSocket.onopen=async()=>{
		console.log("Connected to RPC");

		try{
			_webSocket=webSocket;

			const toRegister=new Set(registeredTypes.keys());
			const toDelete=new Set(reportedTypes);

			for(let type of toRegister)
				if(toDelete.delete(type))
					toRegister.delete(type);

			if(toRegister.size||toDelete.size)
				if(RpcName!=reportedName) await callRemoteFunction(null,'H',RpcName,[...toRegister.keys()],[...toDelete.keys()]);
				else await callRemoteFunction(null,'H',[...toRegister.keys()],[...toDelete.keys()]);
			else if(RpcName!=reportedName) await callRemoteFunction(null,'H',RpcName);

			isConnected=true;
			resolveWaitUntilConnected();

			// @ts-ignore
		}catch(e:Error){
			console.error("Error registering types: ",e);
			closeRpc(e);

			webSocket?.close(4000,"Error registering types");
			return;
		}
	};

	webSocket.binaryType="arraybuffer";
	webSocket.onmessage=(e:MessageEvent)=>{
		const data=e.data;
		if(typeof data=="string") console.log(data);
		else receiveRpc(new DataInput(new Uint8Array(data)));
	};
}

(async function connectLoop(){
	await Promise.resolve();//Moves from main into the event loop

	// noinspection InfiniteLoopJS
	while(true)
		await new Promise<void>(
			resolve=>connectOnce(resolve));
}());
