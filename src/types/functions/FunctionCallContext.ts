import {registeredTypes} from "../../internal/RegisteredTypes";
import {getAsyncIterator,PendingCall,registerReceive,rejectCall,resolveCall,runReceiveMessage} from "./PendingCall";
import {DataOutput} from "../data/DataOutput";
import {PacketType,sendCall,sendRaw} from "../../connection/Connection";
import {_webSocket,isConnected} from "../../connection/WebSocketConnection";
import {freeDynamic} from "../data/DynamicData";


let currentContext: FunctionCallContext | null=null;

export function runWithContext<T>(func: ()=>T,context: FunctionCallContext): T{
	const previous: FunctionCallContext | null=currentContext;
	currentContext=context;
	try{
		return func();
	}finally{
		currentContext=previous;
	}
}

export function getFunctionContext(): FunctionCallContext{
	if(currentContext==null) throw new Error("FunctionCallContext not available");
	return currentContext;
}


let nextId=0;

export function callRemoteFunction<T=unknown>(type: string | null,method: string,...args: any[]): PendingCall<T>{
	if(type!=null){
		const local=registeredTypes.get(type);
		if(local) return callLocalFunction(type,method,()=>local[method](...args));
	}

	const call=new PendingCall<T>();

	const already: unknown[]=[];
	call.finally(()=>freeDynamic(already));

	const buff=new DataOutput();
	const callId=nextId++;
	try{
		buff.writeByte(PacketType.FunctionCall);
		buff.writeLength(callId);
		buff.writeString(type);
		buff.writeString(method);
		buff.writeArray(args,d=>buff.writeDynamic(d,already));
	}catch(e){
		rejectCall.get(call)?.(e as Error);
		return call;
	}

	if(!(isConnected||(type==null&&_webSocket!=null))){
		rejectCall.get(call)?.(new Error("Not connected"));
		return call;
	}
	call.sendMessage=(...msgArgs)=>{
		if(call.finished) return call;
		const msg=new DataOutput();
		msg.writeByte(PacketType.MessageToExecutor);
		msg.writeLength(callId);
		const list: unknown[]=[];
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


export function callLocal<T>(func:()=>(Promise<T>|T)): PendingCall<T>{
	return callLocalFunction(null,null,func);
}

function callLocalFunction<T>(type: string|null,method: string|null,func:()=>(Promise<T>|T)){
	const call=new PendingCall<T>();

	const controller=new AbortController();
	const context: FunctionCallContext={
		type,
		method,
		sendMessage:(...sending)=>{
			call.finished||runReceiveMessage(call,sending);
			return context;
		},
		get finished(){return call.finished},
		promise:call,
		addMessageListener:(func: (...args: any[])=>void)=>{
			registerReceive(context,func);
			return context;
		},
		cancelToken:controller.signal,
		cancel:()=>controller.abort(),
		[Symbol.asyncIterator]:()=>getAsyncIterator(context),
	};
	call.sendMessage=(...received)=>{
		call.finished||runReceiveMessage(context,received);
		return call;
	};
	call.cancel=()=>call.finished||context.cancel();

	try{
		const promise: Promise<T> | T=runWithContext(func,context);

		if(promise instanceof Promise) promise.then(t=>resolveCall.get(call)?.(t),e=>rejectCall.get(call)?.(e));
		else resolveCall.get(call)?.(promise);
	}catch(e){
		rejectCall.get(call)?.(e as Error);
	}
	return call;
}

export interface FunctionCallContext{
	readonly type: string|null
	readonly method: string|null
	readonly finished: boolean
	readonly promise: Promise<unknown>

	sendMessage(...args: any[]): FunctionCallContext

	addMessageListener(func: (...args: any[])=>void): FunctionCallContext

	cancelToken: AbortSignal

	cancel(): void

	[Symbol.asyncIterator](): AsyncIterator<any[]>;
}