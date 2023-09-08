// noinspection ExceptionCaughtLocallyJS

import {_webSocket} from "./WebSocketConnection";
import {RpcNameOrId} from "./IdAndName";
import {DataOutput} from "../types/data/DataOutput";
import {DataInput} from "../types/data/DataInput";
import {
	getAsyncIterator,
	PendingCall,
	registerReceive,
	rejectCall,
	resolveCall,
	runReceiveMessage
} from "../types/functions/PendingCall";
import {registeredTypes} from "../internal/RegisteredTypes";
import {FunctionCallContext,runWithContext} from "../types/functions/FunctionCallContext";
import {RpcError} from "../types/RpcError";


const activeRequests=new Map<number,PendingCall>();
const currentlyExecuting=new Map<number,FunctionCallContext>();

export function disposeConnection(e: Error){
	for(let pending of activeRequests.values()) rejectCall.get(pending)?.(e);
	activeRequests.clear();

	for(let ctx of currentlyExecuting.values()) ctx.cancel();
}

export function sendRaw(buff: DataOutput){
	if(_webSocket==null) throw new Error("Not connected");
	_webSocket.send(buff.toBuffer());
}

export function sendCall(callId: number,call: PendingCall,buff: DataOutput){
	activeRequests.set(callId,call);
	try{
		sendRaw(buff);
	}catch(e){
		rejectCall.get(call)?.(e as Error);
	}
}

export enum PacketType{
	FunctionCall=0,
	FunctionSuccess=1,
	FunctionError=2,
	FunctionCancel=3,
	MessageToExecutor=4,
	MessageToCaller=5,
}

//TODO move this to RemoteError.ts?
//receiving FunctionError results in an Uncaught in promise warning, that doesn't make sense, therefore it gets blocked here
let ignoreUnhandledRejections=false;
if(globalThis.process) process.on("unhandledRejection",()=>{
	ignoreUnhandledRejections=false;
});
else window.addEventListener("unhandledrejection",e=>{
	if(ignoreUnhandledRejections&&e.reason instanceof RpcError){
		ignoreUnhandledRejections=false;
		e.preventDefault();
	}
});

export async function receiveRpc(data: DataInput){
	try{
		const packetType=data.readByte() as PacketType;

		switch(packetType){
			case PacketType.FunctionCall:{
				const callId=data.readLength();


				const already: unknown[]=[];

				let finished: boolean=false;
				let resolve: (t: unknown)=>void=null!;
				let reject: (e: Error)=>void=null!;

				const promise=new Promise((res,rej)=>{
					resolve=t=>{
						res(t);
						finished=true;

						const buff=new DataOutput();
						buff.writeByte(PacketType.FunctionSuccess);
						buff.writeLength(callId);
						buff.writeDynamic(t);
						sendRaw(buff);
						currentlyExecuting.delete(callId);
						
						//TODO foreach(var d in already.OfType<Delegate>()) RemoteFunction.UnregisterFunction(d);
					};
					reject=e=>{
						rej(e);
						finished=true;

						const buff=new DataOutput();
						buff.writeByte(PacketType.FunctionError);
						buff.writeLength(callId);
						buff.writeError(e);
						sendRaw(buff);
						currentlyExecuting.delete(callId);

						//TODO foreach(var d in already.OfType<Delegate>()) RemoteFunction.UnregisterFunction(d);
					};
				});

				try{
					const type=data.readString();

					if(type==null) throw new Error("Client can't use null as a type for function calls");
					const local=registeredTypes.get(type);
					if(!local) throw new Error(`Type "${type}" is not registered on client ${RpcNameOrId}`);

					const method=data.readString()!;

					const args=data.readArray(()=>data.readDynamic(already))??[];


					const controller=new AbortController();
					const context: FunctionCallContext={
						type,
						method,
						get finished(){
							return finished;
						},
						promise,
						sendMessage(...sending){
							if(finished) return context;
							const msg=new DataOutput();
							msg.writeByte(PacketType.MessageToCaller);
							msg.writeLength(callId);
							const list: unknown[]=[];
							msg.writeArray(sending,d=>msg.writeDynamic(d,list));
							already.push(...list);

							sendRaw(msg);
							return context;
						},
						addMessageListener(func: (...args: any[])=>void){
							registerReceive(context,func);
							return context;
						},
						cancelToken:controller.signal,
						cancel:()=>controller.abort(),
						[Symbol.asyncIterator]:()=>getAsyncIterator(context),
					};
					currentlyExecuting.set(callId,context);


					const result: Promise<any> | any=runWithContext(()=>{
						const func=local[method];
						if(func==null) throw new Error(`Method \"${method}\" not found in \"${type}\"`);
						return func.call(local,...args);
					},context);

					if(result instanceof Promise) result.then(r=>resolve(r),e=>reject(e));
					else resolve(result);
				}catch(e){
					reject(e as Error);
				}
				break;
			}
			case PacketType.FunctionSuccess:{
				const callId=data.readLength();

				const pending=activeRequests.get(callId);
				if(pending==null){
					console.log(`${RpcNameOrId} has no activeRequest with id: ${callId}`);
					break;
				}
				try{
					resolveCall.get(pending)?.(data.readDynamic());
				}catch(e){
					rejectCall.get(pending)?.(e as Error);
				}
				break;
			}
			case PacketType.FunctionError:{
				const callId=data.readLength();

				const pending=activeRequests.get(callId);
				if(pending==null){
					console.log(`${RpcNameOrId} has no activeRequest with id: ${callId}`);
					break;
				}

				try{
					ignoreUnhandledRejections=true;
					rejectCall.get(pending)?.(await data.readError());
				}catch(e){
					rejectCall.get(pending)?.(e as Error);
				}finally{
				}
				break;
			}
			case PacketType.FunctionCancel:{
				const callId=data.readLength();
				let ctx=currentlyExecuting.get(callId);
				if(!ctx){
					console.log(`${RpcNameOrId} has no CurrentlyExecuting with id: {callId}`);
					break;
				}
				ctx.cancel();
				break;
			}
			case PacketType.MessageToExecutor:{
				const callId=data.readLength();
				let ctx=currentlyExecuting.get(callId);
				if(!ctx){
					console.log(`${RpcNameOrId} has no CurrentlyExecuting with id: {callId}`);
					break;
				}
				const already: unknown[]=[];
				const args=data.readArray(()=>data.readDynamic(already))??[];
				runReceiveMessage(ctx,args);
				break;
			}
			case PacketType.MessageToCaller:{
				const callId=data.readLength();
				let pending=activeRequests.get(callId);
				if(!pending){
					console.log(`${RpcNameOrId} has no ActiveRequest with id: {callId}`);
					break;
				}
				const already: unknown[]=[];
				const args=data.readArray(()=>data.readDynamic(already))??[];

				runReceiveMessage(pending,args);
				break;
			}
		}
	}catch(e){
		console.error(e);
	}
}