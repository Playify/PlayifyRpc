
export const isNodeJs=globalThis?.process?.versions?.node!=null;

//RpcId
export let RpcId: string;
if(isNodeJs){
	RpcId="node@"+(await import("os")).hostname()+"@"+process.pid;
}else if("document" in globalThis) RpcId="web@"+globalThis.document.location+"@"+Date.now().toString(36)+"X"+Math.random().toString(36).substring(2);
else throw new Error("Unknown Platform");
