// noinspection JSUnusedGlobalSymbols

import {Alias,AliasOptions,PluginOption,TransformResult} from "vite";


export const playifyRpcPlugin=(devRpcServer: string="http://127.0.0.1:4590/",rpcToken:string|undefined=process.env.RPC_TOKEN): PluginOption=>({
	name:"playify-rpc",

	transform(code,_,cfg): TransformResult | undefined{
		if(!cfg?.ssr) return;
		const importStatement='import "/rpc.js"';
		if(!code.includes(importStatement)) return;
		return {
			code:code.replaceAll(importStatement,""),
			map:null,
		};
	},
	config(config,cfg){
		//Rollup external
		const rollupOptions=(config.build??={}).rollupOptions??={};
		let external=rollupOptions.external;
		if(Array.isArray(external))external.push("/rpc.js");
		else if(typeof external==="function"){
			const old=external;
			external=(s,...rest)=>s=="/rpc.js"||old(s,...rest);
		}else if(external!=null) external=[external,"/rpc.js"];
		else external=["/rpc.js"];
		rollupOptions.external=external;
		rollupOptions.makeAbsoluteExternalsRelative=false;

		//Prevent from being included as code
		((config.ssr??={}).external??=[]).push("playify-rpc","/rpc.js");
		((config.optimizeDeps??={}).exclude??=[]).push("playify-rpc","/rpc.js");

		//Proxy
		((config.server??={}).proxy??={})["/rpc"]={
			target:devRpcServer,
			changeOrigin:true,
			ws:true,
			prependPath:true,
			headers:rpcToken==null?undefined:{
				"Cookie":"RPC_TOKEN="+rpcToken,
			}
		};
		
		//Resolve for server side
		if(cfg.ssrBuild){
			const alias: AliasOptions=(config.resolve??={}).alias??={};
			if(Array.isArray(alias))
				(alias as Alias[]).push({
					find:"playify-rpc",
					replacement:"/rpc.js",
				});
			else (alias as Record<string,string>)["playify-rpc"]="/rpc.js";
		}
	},
});
export default playifyRpcPlugin;