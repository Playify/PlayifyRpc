import {registerType} from "../internal/RegisteredTypes.js";

export function RpcProvider(type?: string){
	return function(target: any){
		registerType(type??target.prototype.constructor.name,target).catch(console.error);
	};
}
