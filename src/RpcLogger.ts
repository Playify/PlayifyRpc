import {callRemoteFunction} from "./types/functions/FunctionCallContext";

export enum LogLevel{
	Log,
	Special,
	Debug,
	Info,
	Warning,
	Error,
	Critical,
}

export class RpcLogger{
	public static logLevel(level:LogLevel,...args:any[]){
		callRemoteFunction(null,"L",level,...args).catch(()=>{
			const tag="RpcLogger(Fallback)";
			switch(level){
				case LogLevel.Log:
					console.log(`[${tag}]`,...args);
					break;
				case LogLevel.Special:
					console.log(`[Special|${tag}]`,...args);
					break;
				case LogLevel.Debug:
					console.debug(`[Debug|${tag}]`,...args);
					break;
				case LogLevel.Info:
					console.info(`[Info|${tag}]`,...args);
					break;
				case LogLevel.Warning:
					console.warn(`[Warning|${tag}]`,...args);
					break;
				case LogLevel.Error:
					console.error(`[Error|${tag}]`,...args);
					break;
				case LogLevel.Critical:
					console.error(`[Critical|${tag}]`,...args);
					break;
			}
		});
	}
	public static log=(...args:any[])=>RpcLogger.logLevel(LogLevel.Log,...args);
	public static special=(...args:any[])=>RpcLogger.logLevel(LogLevel.Special,...args);
	public static debug=(...args:any[])=>RpcLogger.logLevel(LogLevel.Debug,...args);
	public static info=(...args:any[])=>RpcLogger.logLevel(LogLevel.Info,...args);
	public static warn=(...args:any[])=>RpcLogger.logLevel(LogLevel.Warning,...args);
	public static warning=(...args:any[])=>RpcLogger.logLevel(LogLevel.Warning,...args);
	public static error=(...args:any[])=>RpcLogger.logLevel(LogLevel.Error,...args);
	public static critical=(...args:any[])=>RpcLogger.logLevel(LogLevel.Critical,...args);
}