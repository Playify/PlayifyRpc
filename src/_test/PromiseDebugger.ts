class PromiseWithTracking<T> extends Promise<T>{
	private static promiseCounter=0;
	public promiseId:number=-1;
	public stackTrace:string="???";

	constructor(executor:(resolve:(value:T | PromiseLike<T>)=>void,reject:(reason?:any)=>void)=>void){
		// Call the superclass (Promise) constructor with the provided executor
		super((resolve,reject)=>{
			// Increment the counter for the next promise
			this.promiseId=PromiseWithTracking.promiseCounter++;

			// Capture the stack trace
			this.stackTrace=new Error().stack??"null";

			// Log the creation of the promise
			console.log(`Promise created with ID ${this.promiseId}`);
			console.log(`Stack trace: ${this.stackTrace}`);

			// Wrap the original resolve and reject functions to log when they are called
			const wrappedResolve=(value:T | PromiseLike<T>)=>{
				console.log(`Promise with ID ${this.promiseId} resolved with value:`,value);
				resolve(value);
			};
			const wrappedReject=(reason?:any)=>{
				console.log(`Promise with ID ${this.promiseId} rejected with reason:`,reason);
				reject(reason);
			};

			// Call the executor with the wrapped resolve and reject functions
			executor(wrappedResolve,wrappedReject);
		});
	}
}

globalThis.Promise=PromiseWithTracking;