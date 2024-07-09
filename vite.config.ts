// noinspection JSUnusedGlobalSymbols

import {defineConfig,PluginOption} from "vite";
import {fileURLToPath} from "url";
import fs from "fs";
import {promisify} from "util";

const exists=promisify(fs.exists);

const appendDotHtml=(defaultPath: string): PluginOption=>({
	name:"middleware",
	apply:"serve",
	configureServer(viteDevServer){
		// @ts-ignore
		viteDevServer.middlewares.use(async(req,_,next)=>{
			const url=new URL(req.originalUrl!,"http://localhost");
			if(url.pathname=="/")
				req.url=defaultPath+url.search;
			else if(!/[.@]/.test(url.pathname))
				if(await exists("./src"+url.pathname+".html"))
					req.url=url.pathname+".html"+url.search;

			next();
		});
	},
});

export default defineConfig({
	plugins:[
		appendDotHtml("/index.html")
	],

	root:"src",
	publicDir:"public",
	build:{
		lib:{
			name:"rpc",
			entry:[fileURLToPath(new URL("./src/rpc.ts",import.meta.url))],
			fileName:"rpc",
		},
		target:'esnext',
		outDir:"dist",
		emptyOutDir:false,
		modulePreload:{
			polyfill:false,
		},
		rollupOptions:{
			input:[
				"./src/rpc.ts",
				"./src/vite.ts",
			],
			external:["os","ws"],
			output:[
				{
					dir:".",
					format:"esm",
					entryFileNames:c=>c.name=="vite"?"dist_dev/[name].js":"dist/[name].js",
					chunkFileNames:"dist/rpc/[hash].js",
					assetFileNames:"dist/rpc/[name].[ext]",
				},
				{
					dir:".",
					format:"cjs",
					entryFileNames:c=>c.name=="vite"?"dist_dev/[name].cjs":"dist_cjs/[name].cjs",
					chunkFileNames:"dist_cjs/rpc/[hash].js",
					assetFileNames:"dist_cjs/rpc/[name].[ext]",
				},
			],
		},
		sourcemap:true,
	},
	server:{
		port:3000,
		host:"0.0.0.0",
		proxy:{
			"^/rpc([/?].*)$":{
				target:"http://127.2.4.8:4590",
				prependPath:true,
				changeOrigin:true,
				secure:false,
				ws:true,
				headers:{
					"Cookie":"RPC_TOKEN="+process.env.RPC_TOKEN,
				},
			},
		},
	},
	esbuild:{
		keepNames:true,
	}
});