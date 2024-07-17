// noinspection ExceptionCaughtLocallyJS

import {_webSocket} from "./WebSocketConnection.js";
import {DataOutput} from "../types/data/DataOutput.js";
import {DataInput} from "../types/data/DataInput.js";
import {
	getAsyncIterator,
	PendingCall,
	registerReceive,
	rejectCall,
	resolveCall,
	runReceiveMessage,
} from "../types/functions/PendingCall.js";
import {invoke,registeredTypes} from "../internal/RegisteredTypes.js";
import {FunctionCallContext,invokeForPromise} from "../types/functions/FunctionCallContext.js";
import {freeDynamic} from "../types/data/DynamicData.js";
import {RpcConnectionError,RpcDataError,RpcError,RpcTypeNotFoundError} from "../rpc.js";


const activeRequests=new Map<number,PendingCall>();
const currentlyExecuting=new Map<number,FunctionCallContext>();

export function disposeConnection(e:Error){
	for(let pending of activeRequests.values()) rejectCall.get(pending)?.(e);
	activeRequests.clear();

	for(let ctx of currentlyExecuting.values()) ctx.cancelSelf();
}

export function sendRaw(buff:DataOutput){
	if(_webSocket==null) throw RpcConnectionError.new("Not connected");
	_webSocket.send(buff.toBuffer());
}

export function sendCall(callId:number,call:PendingCall,buff:DataOutput){
	activeRequests.set(callId,call);
	try{
		sendRaw(buff);
	}catch(e){
		rejectCall.get(call)?.(e);
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

export async function receiveRpc(data:DataInput){
	const packetType=data.readByte() as PacketType;

	switch(packetType){
		case PacketType.FunctionCall:{
			const callId=data.readLength();


			const already:unknown[]=[];

			let finished:boolean=false;
			let resolve:(t:unknown)=>void=null!;
			let reject:(e:Error)=>void=null!;

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

					freeDynamic(already);
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

					freeDynamic(already);
				};
			});
			promise.catch(()=>{});//Prevent uncaught error warning


			try{
				const type=data.readString();

				if(type==null)
					throw RpcTypeNotFoundError.new(null);
				const local=registeredTypes.get(type);
				if(!local)
					throw RpcTypeNotFoundError.new(type);

				const method=data.readString();

				const args=data.readArray(()=>data.readDynamic(already))??[];


				const controller=new AbortController();
				const context:FunctionCallContext={
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
						const list:unknown[]=[];
						msg.writeArray(sending,d=>msg.writeDynamic(d,list));
						already.push(...list);

						sendRaw(msg);
						return context;
					},
					addMessageListener(func:(...args:any[])=>void){
						registerReceive(context,func);
						return context;
					},
					cancelToken:controller.signal,
					cancelSelf:()=>controller.abort(),
					[Symbol.asyncIterator]:()=>getAsyncIterator(context),
				};
				currentlyExecuting.set(callId,context);


				await invokeForPromise(invoke.bind(null,local,type,method,...args),context,resolve,reject,type,method,args);
			}catch(e){
				if(!(e instanceof RpcError))
					e=RpcDataError.new(`Error reading binary stream (${PacketType[packetType]})`,e as Error);
				reject(e as Error);
			}
			break;
		}
		case PacketType.FunctionSuccess:{
			const callId=data.readLength();

			const pending=activeRequests.get(callId);
			if(pending==null){
				console.warn(`[Rpc] No activeRequest[${callId}] (${PacketType[packetType]})`);
				break;
			}
			try{
				resolveCall.get(pending)?.(data.readDynamic());
			}catch(e){
				rejectCall.get(pending)?.(RpcDataError.new(`Error reading binary stream (${PacketType[packetType]})`,e as Error));
			}finally{
				activeRequests.delete(callId);
			}
			break;
		}
		case PacketType.FunctionError:{
			const callId=data.readLength();

			const pending=activeRequests.get(callId);
			if(pending==null){
				console.warn(`[Rpc] No activeRequest[${callId}] (${PacketType[packetType]})`);
				break;
			}

			try{
				let err:Error;
				try{
					err=data.readError();
				}catch(e){
					err=RpcDataError.new(`Error reading binary stream (${PacketType[packetType]})`,e as Error)
				}
				throw err;
			}catch(e){
				rejectCall.get(pending)?.(e);
			}finally{
				activeRequests.delete(callId);
			}
			break;
		}
		case PacketType.FunctionCancel:{
			const callId=data.readLength();
			let ctx=currentlyExecuting.get(callId);
			if(!ctx){
				console.warn(`[Rpc] No currentlyExecuting[${callId}] (${PacketType[packetType]})`);
				break;
			}
			ctx.cancelSelf();
			break;
		}
		case PacketType.MessageToExecutor:{
			const callId=data.readLength();
			let ctx=currentlyExecuting.get(callId);
			if(!ctx){
				console.warn(`[Rpc] No currentlyExecuting[${callId}] (${PacketType[packetType]})`);
				break;
			}
			const already:unknown[]=[];
			const args=data.readArray(()=>data.readDynamic(already))??[];
			runReceiveMessage(ctx,args);
			break;
		}
		case PacketType.MessageToCaller:{
			const callId=data.readLength();
			let pending=activeRequests.get(callId);
			if(!pending){
				console.warn(`[Rpc] No activeRequest[${callId}] (${PacketType[packetType]})`);
				break;
			}
			const already:unknown[]=[];
			const args=data.readArray(()=>data.readDynamic(already))??[];
			runReceiveMessage(pending,args);
			break;
		}
	}
}