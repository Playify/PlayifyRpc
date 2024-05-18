// noinspection JSUnusedGlobalSymbols
import {isNodeJs} from "../connection/RpcId.js";
import {Rpc,RpcConnectionError,RpcError,RpcMethodNotFoundError,RpcProvider} from "../rpc.js";

@RpcProvider(isNodeJs?"bun":"chrome" in globalThis?"chrome":"firefox")
export class TestType{


	static Test0() {
		throw new Error("T0");
	}

	static Test1() {
		throw new RpcError("T1");
	}

	static Test2() {
		const ex = new Error("TEST");
		throw new RpcError("T2", ex);
	}

	static Test3() {
		const ex = new RpcMethodNotFoundError("TEST");
		throw new RpcError("T3", ex);
	}

	static Test4() {
		throw RpcConnectionError.new("T4");
	}

	static Test5() {
		try {
			TestType.Test0();
		} catch (e) {
			throw new RpcError("T5", e);
		}
	}

	static Test6() {
		try {
			TestType.Test0();
		} catch (e) {
			throw new RpcError("T6", e);
		}
	}

	static Test8() {
		try {
			TestType.Test0();
		} catch (e) {
			throw new Error("T8", {cause:e});
		}
	}

	static Test9() {
		try {
			TestType.Test0();
		} catch (e) {
			throw new RpcError("T9", e);
		}
	}

	static async Test10() {
		try {
			await Rpc.callLocal(TestType.Test0);
		} catch (e) {
			throw new RpcError("T10", e);
		}
	}

	static async TestA0() {
		await Promise.resolve();
		throw new Error("T0");
	}

	static async TestA1() {
		await Promise.resolve();
		throw new RpcError("TA1");
	}

	static async TestA2() {
		await Promise.resolve();
		const ex = new Error("TEST");
		throw new RpcError("TA2", ex);
	}

	static async TestA3() {
		await Promise.resolve();
		const ex = new RpcError("TEST");
		throw new RpcError("TA3", ex);
	}

	static async TestA4() {
		await Promise.resolve();
		throw RpcConnectionError.new("TA4");
	}

	static async TestA5() {
		try {
			await TestType.TestA0();
		} catch (e) {
			throw new RpcError("TA5", e);
		}
	}

	static async TestA6() {
		try {
			await TestType.TestA0();
		} catch (e) {
			throw new RpcError("TA6", e);
		}
	}

	static async TestA8() {
		try {
			await TestType.TestA0();
		} catch (e) {
			throw new Error("TA8", {cause:e});
		}
	}

	static async TestA9() {
		try {
			await TestType.TestA0();
		} catch (e) {
			throw new RpcError("TA9", e);
		}
	}

	static async TestA10() {
		try {
			await Rpc.callLocal(TestType.TestA0);
		} catch (e) {
			throw new RpcError("TA10", e);
		}
	}

	static async TestA11() {
		try {
			await TestType.CallTest1();
		} catch (e) {
			throw new RpcError("TA11", e);
		}
	}

	static async CallTest1() {
		await Rpc.callFunction("TestType", "TestA0");
	}

	static async CallTest2() {
		await Rpc.callLocal(TestType.TestA0);
	}

	static async CallTest3() {
		await Rpc.callLocal(TestType.CallTest2);
	}

	static async CallTest4() {
		await Rpc.callLocal(TestType.CallTest3);
	}

	static async clock() {
		const ctx = Rpc.getContext();
		while (!ctx.cancelToken.aborted) {
			ctx.sendMessage(new Date());
			await new Promise<void>(resolve => setTimeout(resolve, 1000));
		}
	}
}