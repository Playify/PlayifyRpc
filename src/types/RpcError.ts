import {DataInput,DataOutput,Rpc} from "../rpc.js";
import {RpcCustomErrors} from "./errors/RpcCustomErrorDecorator.js";
import ErrorStackParser,{StackFrame} from "error-stack-parser";

function fixString(s:string){
	return s.replaceAll("\r","")
		.replaceAll(/^\n+|\n+$/g,"")
		.replaceAll(/^  +/gm,"\t");
}

function framesToString(frames:StackFrame[]):string{
	let result="";
	for(let frame of frames)
		if(frame.functionName?.includes("$RPC_MARKER_BEGIN$")) break;
		else result+="\n\tat "+frame;
	return result;
}

function causeToString(cause:unknown):string{
	if(cause===undefined) return "";
	if(cause instanceof RpcError) return "\ncaused by: "+cause.toString();
	if(cause instanceof Error)
		return "\ncaused by: "+fixString(cause.toString())
			+framesToString(ErrorStackParser.parse(cause))
			+causeToString(cause.cause);
	return "\ncaused by: "+fixString(cause?.toString()??"null");
}


//Remove RpcError inheritance from stack trace
function removeFromStackTrace(e:typeof RpcError & {__proto__:any},ownStack:StackFrame[]):boolean{
	if((e===RpcError||removeFromStackTrace(e.__proto__,ownStack))
		&&ownStack[0].functionName?.replace(/^new /,"")===e.name){
		ownStack.shift();
		return true;
	}else return false;
}

export class RpcError extends Error{
	//public get type(){return this.name}

	public readonly from:string;
	public readonly data:Record<string,any>={};
	#ownStack:StackFrame[]=[];

	public get stackTrace(){
		let result=this.#stackTrace;
		result+=framesToString(this.#ownStack);
		result+=this.#causes;
		return result.replaceAll(/^\n+/g,"");
	}

	#stackTrace:string="";
	#appendStack=false;
	#causes:string="";

	constructor(message:string);
	constructor(message:string,cause:Error | unknown);
	constructor(type:string | null,from:string | null,message:string | null,stackTrace:string | null);
	constructor(type:string | null,from:string | null,message:string | null,stackTrace:string | null,cause:Error);
	constructor(type:string | null,from:string | null,message:string | null,stackTrace:string | null,data:Record<string,any>);
	constructor(type:string | null,from:string | null,message:string | null,stackTrace:string | null,data:Record<string,any>,cause:Error | unknown);
	constructor(...args:
					[message:string] |
					[message:string,cause:Error | unknown] |
					[type:string | null,from:string | null,message:string | null,stackTrace:string | null] |
					[type:string | null,from:string | null,message:string | null,stackTrace:string | null,cause:Error] |
					[type:string | null,from:string | null,message:string | null,stackTrace:string | null,data:Record<string,any>] |
					[type:string | null,from:string | null,message:string | null,stackTrace:string | null,data:Record<string,any>,cause:Error | unknown]
	){
		let type:string | null=null;
		let from:string | null=null;
		let message:string | null=null;
		let stackTrace:string | null=null;
		let data:Record<string,any>={};
		let cause:Error | unknown | undefined=undefined;

		switch(args.length){
			case 1:
				[message]=args;
				break;
			case 2:
				[message,cause]=args;
				break;
			case 4:
				[message,from,message,stackTrace]=args;
				break;
			case 5:
				if(args[4] instanceof RpcError) [message,from,message,stackTrace,cause]=args;
				else [message,from,message,stackTrace,data]=args;
				break;
			case 6:
				[message,from,message,stackTrace,data,cause]=args;
				break;
			default:
				throw new Error("Invalid arg count");
		}

		if(cause!=null) super(message??undefined,{cause});
		else super(message??undefined);

		this.name=type??this.constructor.name;
		this.from=from??Rpc.prettyName;

		const typeTag=RpcCustomErrors[1].get(this.constructor as any);
		if(typeTag!=null) this.data["$type"]=typeTag;
		Object.assign(this.data,data??{});


		if(stackTrace==null){
			this.#appendStack=true;
			this.#ownStack=ErrorStackParser.parse(this);
			removeFromStackTrace(this.constructor as any,this.#ownStack);
		}else{
			this.#stackTrace="\n"+fixString(stackTrace);
			const causeIndex=this.#stackTrace.indexOf("\ncaused by: ");
			if(causeIndex!= -1){
				this.#causes+=this.#stackTrace.substring(causeIndex);
				this.#stackTrace=this.#stackTrace.substring(0,causeIndex);
			}
		}

		this.#causes+=causeToString(cause);

		this.stack=this.toString();
	}

	toString(){
		let s=this.name+"("+this.from+")";
		if(this.message?.trim()) s+=": "+this.message;

		const trace=this.stackTrace;
		if(trace?.trim()) s+="\n"+trace;

		return s;
	}

	write(output:DataOutput){
		output.writeString(this.name);
		output.writeString(this.from);
		output.writeString(this.message);
		output.writeString(this.stackTrace);
		output.writeString(Object.keys(this.data).length==0?null:JSON.stringify(this.data));
	}

	static read(input:DataInput){
		const type=input.readString();
		const from=input.readString()??"???";
		const message=input.readString();
		const stackTrace=input.readString()??"";

		let data;
		try{
			data=JSON.parse(input.readString()??"null");
		}catch(e){
			if(e instanceof RangeError)
				data={"$info":"JsonData was not included, due to an old PlayifyRpc version"};
			else throw e;
		}

		return RpcError.create(type,from,message,stackTrace,data);
	}

	static create(type:string | null,from:string,message:string | null,stackTrace:string,data:Record<string,any>){
		const typeTag=data?.["$type"];
		const constructor:typeof RpcError=RpcCustomErrors[0].get(typeTag)??RpcError;
		return new constructor(type,from,message,stackTrace,data);
	}


	static wrapAndFreeze(e:Error):RpcError{
		if(e instanceof RpcError){
			if(!e.#appendStack) return e;
			e.#appendStack=false;
			e.#stackTrace+=framesToString(e.#ownStack);
			e.#ownStack=[];
			e.stack=e.toString();
			return e;
		}

		return new RpcError(
			e.name,
			e instanceof RpcError?e.from:null,
			e.message,
			framesToString(ErrorStackParser.parse(e)).substring(1),
			{},
			e.cause as Error,
		);
	}

	unfreeze(stackSource:Error,skip:number){
		if(this.#appendStack) return this;
		this.#appendStack=true;
		this.#ownStack=ErrorStackParser.parse(stackSource).slice(skip);
		this.stack=this.toString();
		return this;
	}
	
	trashLocalStack(){
		this.#appendStack=false;
		this.#ownStack=[];
		this.stack=this.toString();
		return this;
	}

	append(type:string | null,method:string | null,args:any[] | null){
		if(this.#appendStack)console.warn("RpcError.append should only be used on frozen Errors");
		let clone=new (this.constructor as typeof RpcError)(this.name,this.from,this.message,this.stackTrace,this.data,this.cause);
		clone.#ownStack=this.#ownStack;
		clone.#stackTrace=this.#stackTrace+"\n\trpc "+(args==null
			?"<<callLocal>>"
			:(type??"<<null>>")+"."+(method??"<<null>>")+"("+
			args.map(a=>JSON.stringify(a)).join(",")+")");
		clone.stack=clone.toString();
		clone.#appendStack=this.#appendStack;
		clone.#causes=this.#causes;
		return clone;
	}
}