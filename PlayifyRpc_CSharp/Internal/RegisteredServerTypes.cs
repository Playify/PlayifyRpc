using System.Collections.Concurrent;
using PlayifyRpc.Connections;
using PlayifyRpc.Types.Functions;
using PlayifyRpc.Utils;
using PlayifyUtility.Utils.Extensions;

namespace PlayifyRpc.Internal;

internal static class RegisteredServerTypes{
	internal static readonly RpcListenerSet AllTypesListeners=[];
	private static readonly ConcurrentDictionary<string,RpcListenerSet> TypesListeners=new();
	private static readonly ConcurrentDictionary<string,ServerConnection> Types=new();
	
	

	internal static bool Register(string type,ServerConnection con){
		if(!Types.TryAdd(type,con)) return false;
		AllTypesListeners.SendAll(type,true);
		
		if(TypesListeners.TryGetValue(type,out var set))
			set.SendAll(true);
		
		return true;
	}

	internal static bool Unregister(string type,ServerConnection con){
		if(!Types.TryRemove(type,con)) return false;
		
		AllTypesListeners.SendAll(type,false);
		
		if(TypesListeners.TryGetValue(type,out var set))
			set.SendAll(false);
		
		return true;
	}

	internal static ICollection<string> GetAllTypes()=>Types.Keys;

	internal static bool TryGet(string type,out ServerConnection? handler){
		return Types.TryGetValue(type,out handler);
	}

	internal static bool Exists(string type){
		return Types.ContainsKey(type);
	}

	internal static async Task Listen(FunctionCallContext ctx,string type){
		RpcListenerSet set;
		IDisposable d;
		lock(TypesListeners){
			set=TypesListeners.GetOrAdd(type,_=>[]);
			d=set.Add(ctx);
		}

		try{
			ctx.SendMessage(Exists(type));
			await ctx.TaskRaw;
		} finally{
			lock(TypesListeners){
				d.Dispose();
				if(set.IsEmpty)
					TypesListeners.TryRemove(type,set);
			}
		}
	}
}