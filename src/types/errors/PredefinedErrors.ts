import {RpcError} from "../RpcError.js";
import {RpcCustomError} from "./RpcCustomErrorDecorator.js";

const quoted=(s:string | null)=>s==null?"null":'"'+s+'"';

export abstract class RpcCallError extends RpcError{
}

@RpcCustomError("$type")
export class RpcTypeNotFoundError extends RpcCallError{
	static new=(type:string | null)=>new RpcTypeNotFoundError(null,null,
		`Type ${quoted(type)} does not exist`,"",{type});
}

@RpcCustomError("$method")
export class RpcMethodNotFoundError extends RpcCallError{
	static new=(type:string | null,method:string | null)=>new RpcMethodNotFoundError(null,null,
		`Method ${quoted(method)} does not exist on type ${quoted(type)}`,"",{type,method});
}

@RpcCustomError("$method-meta")
export class RpcMetaMethodNotFoundError extends RpcMethodNotFoundError{
	static new=(type:string | null,meta:string | null)=>new RpcMetaMethodNotFoundError(null,null,
		`Meta-Method ${quoted(meta)} does not exist on type ${quoted(type)}`,"",{type,method:null,meta});
}

@RpcCustomError("$connection")
export class RpcConnectionError extends RpcCallError{
	static new=(message:string | null)=>new RpcConnectionError(null,null,message,"");
}

@RpcCustomError("$eval")
export class RpcEvalError extends RpcCallError{
}