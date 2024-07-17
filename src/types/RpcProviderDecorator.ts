import {registerType} from "../internal/RegisteredTypes.js";

export function RpcProvider(type?: string){
	return (target: any)=>void registerType(type??target.prototype.constructor.name,target);
}
