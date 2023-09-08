export class RpcError extends Error{
	public name: string;
	public from: string;
	public stackTrace: string;

	constructor(type: string|null,from: string,message: string|null,stackTrace: string|Error|null|undefined){
		if(typeof stackTrace=="string"){
			super(message!);
			this.stackTrace=stackTrace;
		}
		else if(stackTrace){
			// @ts-ignore
			super(message,{cause:stackTrace});
			this.stackTrace=this.stack!.substring(this.stack!.indexOf('\n')+1)+"\ncaused by: "+stackTrace.stack;
		}
		else{
			// @ts-ignore
			super(message);
			this.stackTrace=this.stack!.substring(this.stack!.indexOf('\n')+1);
		}
		this.name=type??"UnknownRemoteError";
		this.from=from;
		this.stack=this.name+"("+from+")";
		if(message!=null) this.stack+=": "+message;
		if(stackTrace==null) return;
		this.stack+="\n";

		this.stackTrace=this.stackTrace.replaceAll(/^  +/gm,"\t");
		this.stack+=this.stackTrace;
	}
}