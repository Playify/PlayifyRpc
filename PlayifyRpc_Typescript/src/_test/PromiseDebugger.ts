class PromiseWithTracking<T> extends Promise<T>{
	private static promiseCounter=0;
	public promiseId:number;
	public stackTrace:string;

	constructor(executor:(resolve:(value:T | PromiseLike<T>)=>void,reject:(reason?:any)=>void)=>void){
		let promiseId:number=-1;
		let stackTrace:string="???";
		super((resolve,reject)=>{
			// Increment the counter for the next promise
			promiseId=PromiseWithTracking.promiseCounter++;

			// Capture the stack trace
			stackTrace=new Error().stack??"null";

			// Log the creation of the promise
			console.log(`Promise created with ID ${promiseId}`);
			console.log(`Stack trace: ${stackTrace}`);

			// Wrap the original resolve and reject functions to log when they are called
			const wrappedResolve=(value:T | PromiseLike<T>)=>{
				console.log(`Promise with ID ${promiseId} resolved with value:`,value);
				resolve(value);
			};
			const wrappedReject=(reason?:any)=>{
				console.log(`Promise with ID ${promiseId} rejected with reason:`,reason);
				reject(reason);
			};

			// Call the executor with the wrapped resolve and reject functions
			executor(wrappedResolve,wrappedReject);
		});
		this.promiseId=promiseId;
		this.stackTrace=stackTrace;
	}
}

globalThis.Promise=PromiseWithTracking;