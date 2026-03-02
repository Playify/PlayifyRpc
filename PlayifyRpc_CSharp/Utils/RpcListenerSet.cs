using System.Collections;
using System.Collections.Concurrent;
using JetBrains.Annotations;
using PlayifyRpc.Internal.Data;
using PlayifyRpc.Types.Functions;
using PlayifyUtility.HelperClasses;
using PlayifyUtility.HelperClasses.Dispose;

namespace PlayifyRpc.Utils;

[PublicAPI]
public class RpcListenerSet:IEnumerable<FunctionCallContext>{
	private readonly ConcurrentDictionary<FunctionCallContext,VoidType> _set=[];
	private readonly Queue<Action> _disposeActions=[];//can't be concurrent, as it depends on _set.IsEmpty

	private RpcDataPrimitive.Already Already=>new(a=>{
		lock(_disposeActions)
			_disposeActions.Enqueue(a);
	});

	public RpcDataPrimitive[]? LastMessage{get;private set;}


	public void SendAllRaw(params RpcDataPrimitive[] args){
		LastMessage=args;
		foreach(var pair in _set)
			pair.Key.SendMessageRaw(args);
	}

	public void SendAll(params object?[] args)=>SendAllRaw(RpcDataPrimitive.FromArray(args,Already));

	public void SendLazySingle(Func<object?> generate)=>SendLazyRaw(()=>[RpcDataPrimitive.From(generate(),Already)]);

	public void SendLazy(Func<object?[]> generate)=>SendLazyRaw(()=>RpcDataPrimitive.FromArray(generate(),Already));

	public void SendLazyRaw(Func<RpcDataPrimitive> generate)=>SendLazyRaw(()=>[generate()]);

	public void SendLazyRaw(Func<RpcDataPrimitive[]> generate){
		if(_set.IsEmpty) return;

		var args=generate();
		SendAllRaw(args);
	}


	[MustDisposeResource]
	public IDisposable Add(FunctionCallContext ctx){
		_set.TryAdd(ctx,default);
		return new CallbackAsDisposable(()=>Remove(ctx));
	}

	public void Remove(FunctionCallContext ctx){
		if(!_set.TryRemove(ctx,out _)) return;
		lock(_disposeActions)
			if(_set.IsEmpty)
				while(_disposeActions.Count!=0)
					_disposeActions.Dequeue()();
	}

	public void Clear(){
		lock(_disposeActions){
			_set.Clear();
			while(_disposeActions.Count!=0)
				_disposeActions.Dequeue()();
		}
	}

	public bool Contains(FunctionCallContext ctx)=>_set.ContainsKey(ctx);
	
	public bool IsEmpty=>_set.IsEmpty;
	public int Count=>_set.Count;


	[MustDisposeResource]
	public IEnumerator<FunctionCallContext> GetEnumerator()=>_set.Keys.GetEnumerator();

	[MustDisposeResource]
	IEnumerator IEnumerable.GetEnumerator()=>((IEnumerable<FunctionCallContext>)this).GetEnumerator();
}