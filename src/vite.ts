import {Alias,AliasOptions,PluginOption,TransformResult} from "vite";


export const rpcPlugin=(devRpcServer: string="http://127.0.0.1:4590/",rpcToken:string|undefined=process.env.RPC_TOKEN): PluginOption=>({
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
	configResolved(config){
		let external=config.build.rollupOptions.external;
		if(Array.isArray(external))external.push("/rpc.js");
		else if(typeof external==="function"){
			const old=external;
			external=(s,...rest)=>s=="/rpc.js"||old(s,...rest);
		}else if(external!=null) external=[external,"/rpc.js"];
		else external=["/rpc.js"];
		config.build.rollupOptions.external=external;
		config.build.rollupOptions.makeAbsoluteExternalsRelative=false;
		
		(config.ssr.external??=[]).push("playify-rpc","/rpc.js");
		(config.optimizeDeps.exclude??=[]).push("playify-rpc","/rpc.js");
		(config.server.proxy??={})["/rpc"]={
			target:devRpcServer,
			changeOrigin:true,
			ws:true,
			prependPath:true,
			headers:rpcToken==null?undefined:{
				"Cookie":"RPC_TOKEN="+rpcToken,
			}
		};
	},
	config(config,cfg){
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