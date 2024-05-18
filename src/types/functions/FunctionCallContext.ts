import {invoke,registeredTypes} from "../../internal/RegisteredTypes.js";
import {getAsyncIterator,PendingCall,registerReceive,rejectCall,resolveCall,runReceiveMessage} from "./PendingCall.js";
import {DataOutput} from "../data/DataOutput.js";
import {PacketType,sendCall,sendRaw} from "../../connection/Connection.js";
import {_webSocket,isConnected} from "../../connection/WebSocketConnection.js";
import {RpcError} from "../RpcError.js";
import {RpcConnectionError} from "../errors/PredefinedErrors.js";


let currentContext:FunctionCallContext | null=null;

export function runWithContext<T>(func:()=>T,context:FunctionCallContext):T{
	const previous:FunctionCallContext | null=currentContext;
	currentContext=context;
	try{
		return func();
	}finally{
		currentContext=previous;
	}
}

export function getFunctionContext():FunctionCallContext{
	if(currentContext==null) throw new Error("FunctionCallContext not available");
	return currentContext;
}


let nextId=0;

export function callRemoteFunction<T=unknown>(type:string | null,method:string | null,...args:any[]):PendingCall<T>{
	if(type!=null){
		const local=registeredTypes.get(type);
		if(local) return callLocalFunction<T>(invoke.bind(null,local,type,method,...args),type,method,args,3);
	}

	const already:unknown[]=[];
	const call=new PendingCall<T>(2,already);

	const buff=new DataOutput();
	const callId=nextId++;
	try{
		buff.writeByte(PacketType.FunctionCall);
		buff.writeLength(callId);
		buff.writeString(type);
		buff.writeString(method);
		buff.writeArray(args,d=>buff.writeDynamic(d,already));
	}catch(e){
		rejectCall.get(call)?.(e);
		return call;
	}

	if(!(isConnected||(type==null&&_webSocket!=null))){
		rejectCall.get(call)?.(RpcConnectionError.new("Not connected"));
		return call;
	}
	call.sendMessage=(...msgArgs)=>{
		if(call.finished) return call;
		const msg=new DataOutput();
		msg.writeByte(PacketType.MessageToExecutor);
		msg.writeLength(callId);
		const list:unknown[]=[];
		msg.writeArray(msgArgs,d=>msg.writeDynamic(d,list));
		already.push(...list);

		sendRaw(msg);
		return call;
	};
	call.cancel=()=>{
		if(call.finished) return;
		const msg=new DataOutput();
		msg.writeByte(PacketType.FunctionCancel);
		msg.writeLength(callId);

		sendRaw(msg);
	};

	sendCall(callId,call,buff);

	return call;
}


export function callLocal<T>(func:()=>(Promise<T> | T)):PendingCall<T>{
	return callLocalFunction(func,null,null,null,3);
}

function callLocalFunction<T>(func:()=>(Promise<T> | T),type:string | null,method:string | null,args:any[] | null,skip:number){
	const pending=new PendingCall<T>(skip,[]);

	const controller=new AbortController();
	const context:FunctionCallContext={
		type,
		method,
		sendMessage:(...sending)=>{
			pending.finished||runReceiveMessage(pending,sending);
			return context;
		},
		get finished(){
			return pending.finished
		},
		promise:pending,
		addMessageListener:(func:(...args:any[])=>void)=>registerReceive(context,func),
		cancelToken:controller.signal,
		cancelSelf:()=>controller.abort(),
		[Symbol.asyncIterator]:()=>getAsyncIterator(context),
	};
	pending.sendMessage=(...received)=>{
		pending.finished||runReceiveMessage(context,received);
		return pending;
	};
	pending.cancel=()=>pending.finished||context.cancelSelf();

	// noinspection JSIgnoredPromiseFromCall
	invokeForPromise(func,context,resolveCall.get(pending),rejectCall.get(pending),type,method,args);

	return pending;
}

export async function invokeForPromise<T>(func:()=>T,context:FunctionCallContext,resolve:((t:T)=>void) | undefined,reject:((e:RpcError)=>void) | undefined,
										  type:string | null,method:string | null,args:any[] | null){
	try{
		let result:Promise<T>;
		const previous:FunctionCallContext | null=currentContext;
		currentContext=context;
		try{
			result=await (({
				async $RPC_MARKER_BEGIN$(){
					return await func() as any;
				}
			})["$RPC_MARKER_BEGIN$"])();
		}finally{
			currentContext=previous;
		}
		resolve?.(await result);
	}catch(e){
		reject?.(RpcError
			.wrapAndFreeze(e as Error)
			.append(type,method,args));
	}
}

export interface FunctionCallContext{
	readonly type:string | null
	readonly method:string | null
	readonly finished:boolean
	readonly promise:Promise<unknown>

	sendMessage(...args:any[]):FunctionCallContext

	addMessageListener(func:(...args:any[])=>void):FunctionCallContext

	cancelToken:AbortSignal

	cancelSelf():void

	[Symbol.asyncIterator]():AsyncIterator<any[]>;
}