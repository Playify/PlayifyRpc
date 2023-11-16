
export const isNodeJs=globalThis?.process?.versions?.node!=null;



//RpcId
export let RpcId: string;
if(isNodeJs){
	try{
		//RpcId="node@"+(await import("os")).hostname()+"@"+process.pid;
		//@ts-ignore
		RpcId="node@"+process.binding("os").getHostname()+"@"+process.pid;//Needed to not use top level await
	}catch{
		RpcId="node@"+process.platform+":"+process.arch+"@"+process.pid;
	}
}else if("document" in globalThis) RpcId="web@"+globalThis.document.location+"@"+Date.now().toString(36)+"X"+Math.random().toString(36).substring(2);
else throw new Error("Unknown Platform");
