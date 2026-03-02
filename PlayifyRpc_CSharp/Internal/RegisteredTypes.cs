using System.Collections.Concurrent;
using System.Reflection;
using System.Runtime.CompilerServices;
using PlayifyRpc.Types;
using PlayifyRpc.Types.Invokers;
using PlayifyUtility.Utils.Extensions;

namespace PlayifyRpc.Internal;

internal static class RegisteredTypes{
	internal static readonly ConcurrentDictionary<string,Invoker> Registered=new();

	internal static string? Name;

	static RegisteredTypes(){
		AppDomain.CurrentDomain.AssemblyLoad+=(_,args)=>RegisterAssembly(args.LoadedAssembly);
		foreach(var assembly in AppDomain.CurrentDomain.GetAssemblies()) RegisterAssembly(assembly);

		typeof(RpcFunction).RunClassConstructor();//Let RpcFunction register its internal type
	}

	private static void RegisterAssembly(Assembly assembly){
		// ReSharper disable once ConditionalAccessQualifierIsNonNullableAccordingToAPIContract
		if(assembly.FullName?.StartsWith("System.")??false) return;//Skip System assemblies
		
		try{
			foreach(var type in assembly.GetTypes())
				if(type.GetCustomAttribute<RpcProviderAttribute>() is{} provider)
					if(typeof(Invoker).IsAssignableFrom(type)){
						RuntimeHelpers.RunClassConstructor(type.TypeHandle);
						_=Register(provider.Type??type.Name,(Invoker)Activator.CreateInstance(type)!);
					} else _=Register(provider.Type??type.Name,new TypeInvoker(type));
		} catch(Exception e){
			Rpc.Logger.Critical("Error registering assembly \""+assembly+"\": "+e);
		}
	}

	internal static async Task Register(string type,Invoker invoker){
		if(!Registered.TryAdd(type,invoker))return;
		
		try{
			if(Rpc.IsConnected) await Invoker.CallFunction(null,"+",type);
		} catch(Exception e){
			Rpc.Logger.Error($"Error registering type \"{type}\": {e}");
			Registered.TryRemove(type,invoker);
		}
	}

	internal static async Task Unregister(string type){
		if(!Registered.ContainsKey(type)) return;
		try{
			if(Rpc.IsConnected) await Invoker.CallFunction(null,"-",type);
		} catch(Exception e){
			Rpc.Logger.Error($"Error unregistering type \"{type}\": {e}");

			//Also delete locally, as it won't be listened to, and on the server it probably is already unregistered
		} finally{
			Registered.Remove(type, out _);
		}
	}

	internal static async Task SetName(string? name){
		Name=name;
		try{
			if(Rpc.IsConnected) await Invoker.CallFunction(null,"N",name);
		} catch(Exception e){
			Rpc.Logger.Error($"Error changing name to \"{name}\": {e}");
		}
	}
}