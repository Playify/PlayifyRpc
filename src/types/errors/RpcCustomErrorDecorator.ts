import {RpcError} from "../RpcError.js";

export const RpcCustomErrors:[
	Map<string,typeof RpcError>,
	Map<typeof RpcError,string>
]=[new Map,new Map];
export function RpcCustomError(typeTag: string){
	return function(target: typeof RpcError){
		const [tagToError,errorToTag]=RpcCustomErrors;
		tagToError.set(typeTag,target);
		errorToTag.set(target,typeTag);
	};
}