export const isNodeJs=globalThis?.process?.versions?.node!=null;

const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const randomId=()=>Date.now().toString(36)+Array(10)
	.fill(undefined)
	.map(()=>chars[Math.floor(Math.random()*chars.length)])
	.join("");


//RpcId
export let RpcId:string;
if(isNodeJs)
	try{
		if(process?.versions.bun)
			RpcId="bun@"+require("os").hostname()+"@"+process.pid;
		else if(process?.versions.deno)
			 // @ts-ignore
			RpcId="deno@"+Deno.hostname()+"@"+process.pid;
		else
			//@ts-ignore
			// noinspection JSUnresolvedReference
			RpcId="node@"+process.binding("os").getHostname()+"@"+process.pid;//Needed to not use top level await
	}catch{
		RpcId="node-alternative@"+process.platform+":"+process.arch+"@"+process.pid;
	}
else if("document" in globalThis) RpcId="web@"+document.location+"#"+randomId();
else//Unknown Platform
	RpcId="js@"+randomId();