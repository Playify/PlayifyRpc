import {DataInput,DataOutput,Rpc} from "../rpc.js";
import {RpcCustomErrors} from "./errors/RpcCustomErrorDecorator.js";
import ErrorStackParser,{StackFrame} from "error-stack-parser";

function fixString(s:string){
	return s.replaceAll('\r','')
		.replaceAll(/^\n+|\n+$/g,"")
		.replaceAll(/^  +/gm,'\t')
}

const rpcBeginMarker="$RPC_MARKER_BEGIN$";

export function rpcMarkInternal<T>(func:<T>()=>Promise<T>):Promise<T>{
	return Object.defineProperty(func,"name",{value:rpcBeginMarker})();
}

function framesToString(frames:StackFrame[]):string{
	let result="";
	for(let frame of frames)
		if(frame.functionName?.includes(rpcBeginMarker)) break;
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


export class RpcError extends Error{
	//public get type(){return this.name}

	public readonly from:string;
	public readonly data:Record<string,any>={};
	private _ownStack:StackFrame[]=[];

	public get stackTrace(){
		let result=this._stackTrace;
		result+=framesToString(this._ownStack);
		result+=this._causes;
		return result.replaceAll(/^\n+/g,"");
	}

	private _stackTrace:string="";
	private _appendStack=false;
	private readonly _causes:string="";

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
			this._appendStack=true;
			this._ownStack=ErrorStackParser.parse(this);
		}else{
			this._stackTrace="\n"+fixString(stackTrace);
			const causeIndex=this._stackTrace.indexOf("\ncaused by: ");
			if(causeIndex!= -1){
				this._causes+=this._stackTrace.substring(causeIndex);
				this._stackTrace=this._stackTrace.substring(0,causeIndex);
			}
		}

		this._causes=causeToString(cause);
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
			if(!e._appendStack) return e;
			e._appendStack=false;
			e._stackTrace+=framesToString(e._ownStack);
			e._ownStack=[];
			return e;
		}

		return new RpcError(
			e.name,
			e instanceof RpcError?e.from:null,
			e.message,
			framesToString(ErrorStackParser.parse(e)).substring(1),
			{},
			e.cause as Error
		);
	}

	unfreeze(stackSource:Error,skip:number){
		if(this._appendStack) return this;
		this._appendStack=true;
		this._ownStack=ErrorStackParser.parse(stackSource).slice(skip);
		return this;
	}

	append(type:string | null,method:string | null,args:any[] | null){
		this._stackTrace+="\n\trpc "+(args==null
			?"<<callLocal>>"
			:(type??"<<null>>")+"."+(method??"<<null>>")+"("+
			args.map(a=>JSON.stringify(a)).join(",")+")");
		return this;
	}
}