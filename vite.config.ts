// noinspection JSUnusedGlobalSymbols

import {defineConfig,PluginOption} from 'vite';
import {fileURLToPath} from 'url';
import fs from 'fs';
import {promisify} from 'util';

const exists=promisify(fs.exists);

const appendDotHtml=(defaultPath: string): PluginOption=>({
	name:"middleware",
	apply:"serve",
	configureServer(viteDevServer){
		// @ts-ignore
		viteDevServer.middlewares.use(async(req,res,next)=>{
			const url=new URL(req.originalUrl!,"http://localhost");
			if(url.pathname=="/")
				req.url=defaultPath+url.search;
			else if(!url.pathname.match(/[.@]/))
				if(await exists("./src"+url.pathname+".html"))
					req.url=url.pathname+".html"+url.search;

			next();
		});
	}
});

const dist="dist/";

export default defineConfig({
	plugins:[
		appendDotHtml("/index.html"),
	],

	root:"src",
	publicDir:"public",
	build:{
		lib:{
			name:"rpc",
			entry:fileURLToPath(new URL("./src/rpc.ts",import.meta.url)),
			fileName:"rpc",
		},
		target:'esnext',
		outDir:dist+"raw_web",
		emptyOutDir:true,
		modulePreload:{
			polyfill:false
		},
		rollupOptions:{
			external:["os","ws"],
			output:[
				{
					dir:dist,
					format:"es",
					entryFileNames:"[name].js",
					chunkFileNames:"rpc/[hash].js",
					assetFileNames:"rpc/[name].[ext]",
					sourcemap:true,
				},
			],
		}
	},
	server:{
		port:3000,
		proxy:{
			"^/rpc$":{
				target:"http://127.2.4.8:4590",
				prependPath:true,
				changeOrigin:true,
				secure:false,
				ws:true,
				headers:{
					"Cookie":"RPC_TOKEN="+process.env.RPC_TOKEN
				}
			}
		}
	},
});