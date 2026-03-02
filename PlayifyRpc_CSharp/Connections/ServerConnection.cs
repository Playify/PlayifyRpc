using System.Collections.Concurrent;
using System.Net;
using System.Text;
using PlayifyRpc.Internal;
using PlayifyRpc.Internal.Data;
using PlayifyRpc.Types.Exceptions;
using PlayifyRpc.Types.Invokers;
using PlayifyUtility.Loggers;
using PlayifyUtility.Streams.Data;
using PlayifyUtility.Utils;
using PlayifyUtility.Utils.Extensions;

namespace PlayifyRpc.Connections;

internal abstract class ServerConnection:AnyConnection,IAsyncDisposable{
	internal static readonly HashSet<ServerConnection> Connections=[];
	private readonly ConcurrentDictionary<int,(ServerConnection respondFrom,int respondId)> _activeExecutions=new();
	private readonly ConcurrentDictionary<int,(ServerConnection respondTo,int respondId)> _activeRequests=new();
	internal readonly HashSet<string> Types=[];
	internal static int MessageToExecutorCount;
	internal static int MessageToSenderCount;
	private readonly ServerInvoker _invoker;
	private int _nextId;

	public Logger Logger{get;private set;}

	protected ServerConnection(string? id){
		Id=id??"???";
		Logger=Rpc.Logger;
		Name=null;

		_invoker=new ServerInvoker(this);

		if(id==null) return;
		ServerConnection[] toKick;
		lock(Connections){
			toKick=Connections.Where(c=>c.Id==id).ToArray();
			Connections.Add(this);
		}

		TaskUtils.WhenAll(toKick.Select(k=>{
			k.Logger.Warning("Kicked, new client with same id joined.");
			return k.DisposeAsync();
		})).AsTask().Background();

		
		if(!RegisteredServerTypes.Register("$"+Id,this)){
			ForceUnregister();
			throw new Exception("Cannot register internal rpc-type");
		}
		Types.Add("$"+id);
	}

	//Used when the constructor fails
	protected void ForceUnregister(){
		lock(Connections) Connections.Remove(this);

		lock(Types){
			Types.RemoveWhere(s=>RegisteredServerTypes.Unregister(s,this));
			if(Types.Count==0) return;
			
			Logger.Error("Error unregistering all. Types could not be unregistered properly: "+Types.Select(t=>$"\"{t}\"").Join(","));
			Types.Clear();
		}
	}

	#region Connection
	private bool _disposed;

	public virtual async ValueTask DisposeAsync(){
		if(_disposed) return;
		_disposed=true;
		GC.SuppressFinalize(this);

		ForceUnregister();

			
		var exception=new RpcConnectionException("Connection closed by "+PrettyName);
		var task=Task.WhenAll(_activeRequests.Values.Select(t=>t.respondTo.Reject(t.respondId,exception))
		                           .Concat(_activeExecutions.Values.Select(t=>t.respondFrom.CancelRaw(t.respondId,null))));
		_activeRequests.Clear();
		_activeExecutions.Clear();
		
		await task;
	}

	protected override void RespondedToCallId(int callId){
		_activeExecutions.TryRemove(callId,out _);
	}

	protected async Task Receive(DataInputBuff data){
		var packetType=(PacketType)data.ReadByte();
		switch(packetType){
			case PacketType.FunctionCall:{
				var callId=data.ReadLength();
				var type=data.ReadString();

				ListenAllCalls.Broadcast(this,type,data);

				if(type==null) await CallServer(this,data,callId);
				else{
					if(!RegisteredServerTypes.TryGet(type,out var handler))
						handler=null;
					if(handler==null) await Reject(callId,new RpcTypeNotFoundException(type));
					else{
						var task=handler.CallFunction(type,data,this,callId,out var sentId);
						_activeExecutions.TryAdd(callId,(handler,sentId));
						await task;
					}
				}
				break;
			}
			case PacketType.FunctionSuccess:{
				var callId=data.ReadLength();
				if(!_activeRequests.Remove(callId,out var tuple)){
					Logger.Warning($"Invalid State: No ActiveRequest[{callId}] ({packetType})");
					break;
				}
				try{
					await tuple.respondTo.ResolveRaw(tuple.respondId,data);
				} catch(Exception){
					await tuple.respondTo.DisposeAsync();
				}
				break;
			}
			case PacketType.FunctionError:{
				var callId=data.ReadLength();
				if(!_activeRequests.Remove(callId,out var tuple)){
					Logger.Warning($"Invalid State: No ActiveRequest[{callId}] ({packetType})");
					break;
				}
				try{
					await tuple.respondTo.RejectRaw(tuple.respondId,data);
				} catch(Exception){
					await tuple.respondTo.DisposeAsync();
				}
				break;
			}
			case PacketType.FunctionCancel:{
				var callId=data.ReadLength();
				if(!_activeExecutions.TryGetValue(callId,out var tuple)){
					Logger.Warning($"Invalid State: No ActiveExecution[{callId}] ({packetType})");
					break;
				}
				try{
					await tuple.respondFrom.CancelRaw(tuple.respondId,data);
				} catch(Exception){
					await tuple.respondFrom.DisposeAsync();
				}
				break;
			}
			case PacketType.MessageToExecutor:{
				var callId=data.ReadLength();
				if(!_activeExecutions.TryGetValue(callId,out var tuple)){
					Logger.Warning($"Invalid State: No ActiveExecution[{callId}] ({packetType})");
					break;
				}
				Interlocked.Increment(ref MessageToExecutorCount);
				
				var buff=new DataOutputBuff();
				buff.WriteByte((byte)PacketType.MessageToExecutor);
				buff.WriteLength(tuple.respondId);
				buff.Write(data);
				try{
					await tuple.respondFrom.SendRaw(buff);
				} catch(Exception){
					await tuple.respondFrom.DisposeAsync();
				}
				break;
			}
			case PacketType.MessageToCaller:{
				var callId=data.ReadLength();
				if(!_activeRequests.TryGetValue(callId,out var tuple)){
					Logger.Warning($"Invalid State: No ActiveRequest[{callId}] ({packetType})");
					break;
				}
				Interlocked.Increment(ref MessageToSenderCount);

				var buff=new DataOutputBuff();
				buff.WriteByte((byte)PacketType.MessageToCaller);
				buff.WriteLength(tuple.respondId);
				buff.Write(data);
				try{
					await tuple.respondTo.SendRaw(buff);
				} catch(Exception){
					await tuple.respondTo.DisposeAsync();
				}
				break;
			}
			default:throw new ProtocolViolationException("Received invalid rpc-packet");
		}
	}
	#endregion


	#region Calling functions
	private Task CallFunction(string type,DataInputBuff data,ServerConnection respondTo,int respondId,out int callId){
		var buff=new DataOutputBuff();
		buff.WriteByte((byte)PacketType.FunctionCall);
		callId=Interlocked.Increment(ref _nextId);
		buff.WriteLength(callId);
		buff.WriteString(type);
		buff.Write(data);


		_activeRequests.TryAdd(callId,(respondTo,respondId));

		return SendRaw(buff);
	}

	private static async Task CallServer(ServerConnection connection,DataInputBuff data,int callId){
		try{
			var method=data.ReadString();

			var args=RpcDataPrimitive.ReadArray(data);

			try{
				var result=await Invoker.RunAndAwait(ctx=>connection._invoker.Invoke(null!,method,args,ctx),null!,null,method,args);
				await connection.Resolve(callId,result);
			} catch(Exception e){
				await connection.Reject(callId,e);
			}
		} catch(Exception e){
			await connection.Reject(callId,new RpcDataException($"Error reading binary stream ({nameof(CallServer)})",e));
		}
	}
	#endregion


	#region Local
	public readonly string Id;
	private string? _name;
	public string? Name{
		get=>_name;
		internal set{
			_name=value;
			Logger=Rpc.Logger.WithName("Connection: "+PrettyName);
		}
	}
	public string PrettyName=>Name is{} name?$"{name} ({Id})":Id;


	public override string ToString(){
		var str=new StringBuilder(GetType().Name);
		str.Append('(').Append(GetHashCode().ToString("x8"));
		str.Append(':').Append(PrettyName);
		str.Append(')');
		return str.ToString();
	}

	internal void Register(string[] types,bool log){
		if(types.Length==0) return;
		List<string>? failed=null;
		lock(Types)
			foreach(var type in types)
				if(!RegisteredServerTypes.Register(type,this)) (failed??=[]).Add(type);
				else Types.Add(type);

		if(failed!=null){
			if(log)
				Logger.Warning(types.Length==1
					               ?$"Tried registering Type \"{types[0]}\""
					               :$"Tried registering Types \"{types.Join("\",\"")}\"");
			throw new RpcException(failed.Count==1
				                       ?$"Type \"{failed[0]}\" was already registered"
				                       :$"Types \"{failed.Join("\",\"")}\" were already registered");
		}
		if(log)
			Logger.Info(types.Length==1
				            ?$"Registered Type \"{types[0]}\""
				            :$"Registered Types \"{types.Join("\",\"")}\"");
	}

	internal void Unregister(string[] types,bool log){
		if(types.Length==0) return;
		List<string>? failed=null;

		lock(Types)
			foreach(var type in types)
				if(!Types.Remove(type)||!RegisteredServerTypes.Unregister(type,this))
					(failed??=[]).Add(type);

		if(failed!=null){
			if(log)
				Logger.Warning(types.Length==1
					               ?$"Tried unregistering Type \"{types[0]}\""
					               :$"Tried unregistering Types \"{types.Join("\",\"")}\"");
			throw new RpcException(failed.Count==1
				                       ?$"Type \"{failed[0]}\" was not registered"
				                       :$"Types \"{failed.Join("\",\"")}\" were not registered");
		}
		if(log)
			Logger.Info(types.Length==1
				            ?$"Unregistered Type \"{types[0]}\""
				            :$"Unregistered Types \"{types.Join("\",\"")}\"");
	}
	#endregion

	public string GetCaller(int callId)
		=>_activeRequests.TryGetValue(callId,out var tuple)
			  ?tuple.respondTo.PrettyName
			  :throw new RpcException("Error finding caller");

	internal void Statistics(Action<string,int> values,Action<ServerConnection> referenced){
		values("connections",1);
		values("referenced",0);//for better sorting, will be filled out afterwards
		values("activeRequests",_activeRequests.Count);
		values("activeExecutions",_activeExecutions.Count);
		lock(Types) values("types",Types.Count);
		values("callId_"+PrettyName,_nextId);
		foreach(var (_,(con,_)) in _activeRequests) referenced(con);
		foreach(var (_,(con,_)) in _activeExecutions) referenced(con);
	}
}