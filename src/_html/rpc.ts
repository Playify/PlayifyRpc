declare const Rpc:typeof import("../rpc.js").Rpc;
declare const RpcObjectGetMethods:typeof import("../rpc.js").RpcObjectGetMethods;
declare type RpcError=import("../rpc.js").RpcError;


const input=document.querySelector<HTMLInputElement>("input")!;
const autocomplete=document.querySelector<HTMLInputElement>("#autocomplete")!;
const result=document.querySelector<HTMLPreElement>("#result")!;
const copy=document.querySelector<HTMLElement>("#copy")!;

function setStatus(text:string,color:string,back:string,date:number){
	const dateTime=new Date(date - (new Date().getTimezoneOffset() * 1000 * 60)).toJSON();
	const status=document.querySelector<HTMLElement>("#status")!;
	status.textContent=`${text} (${dateTime.replace('T',' ').replace('Z','')})`;
	status.style.color=color;
	status.style.backgroundColor=back;
}

let curr=0;
async function runEval(func:()=>Promise<string> =()=>Rpc.evalString(input.value)){
	while(autocomplete.firstChild) autocomplete.removeChild(autocomplete.lastChild!);
	last="";
	
	const now=++curr;

	const startTime=Date.now();
	try{
		setStatus("Executing","cyan","blue",startTime);
		result.style.backgroundColor="rgba(0,0,255,10%)";
		const s=await func();
		if(now!=curr) return;
		result.textContent=s;
		result.style.backgroundColor="rgba(0,255,0,10%)";
		const endTime=Date.now();
		setStatus(`Success (${((endTime-startTime)/1000).toFixed(3)}s)`,"lime","green",Date.now());
	}catch(e){
		if(now!=curr) return;
		result.textContent=(e as RpcError).trashLocalStack()+"\n\n\nException data:"+JSON.stringify((e as RpcError).data,null,"\t");
		result.style.backgroundColor="rgba(255,0,0,10%)";
		const endTime=Date.now();
		setStatus(`Failed (${((endTime-startTime)/1000).toFixed(3)}s)`,"orangered","darkred",Date.now());
	}
}

let copyTimeout:ReturnType<typeof setTimeout> | undefined=undefined;
copy.addEventListener("click",()=>{
	const textarea = document.createElement('textarea');
	textarea.value = result.textContent!;
	textarea.style.position = 'fixed';
	textarea.style.left = '-9999px';
	document.body.appendChild(textarea);
	textarea.select();
	document.execCommand('copy');
	document.body.removeChild(textarea);
	
	
	copy.style.color="lime";
	copy.style.backgroundColor="darkgreen";
	clearTimeout(copyTimeout);
	copyTimeout=setTimeout(()=>{
		copy.style.color=null!;
		copy.style.backgroundColor=null!;
	},250);
});
document.querySelector("#execute")!.addEventListener("click",()=>runEval());

input.addEventListener("keydown",async e=>{
	let active:HTMLElement|null;
	switch(e.key){
		case "ArrowUp":
			e.preventDefault();

			active=autocomplete.querySelector<HTMLElement>(":scope>.active");
			if(active){
				active.classList.remove("active");
				(active=active.previousElementSibling as HTMLElement??active).classList.add("active");
			}else (active=autocomplete.lastElementChild as HTMLElement)?.classList.add("active");
			
			break;
		case "ArrowDown":
			e.preventDefault();
			
			active=autocomplete.querySelector<HTMLElement>(":scope>.active");
			if(active){
				active.classList.remove("active");
				(active=active.nextElementSibling as HTMLElement??active).classList.add("active");
			}else (active=autocomplete.firstElementChild as HTMLElement)?.classList.add("active");
			
			break;
		case "Tab":
			e.preventDefault();
			
			active=autocomplete.querySelector<HTMLElement>(":scope>.active,:scope>:only-child");
			active?.onclick!(null!);
			
			return;
		case "Enter":
			e.preventDefault();

			active=autocomplete.querySelector<HTMLElement>(":scope>.active");
			
			if(active) active.onclick!(null!);
			else runEval().catch(console.error);

			return;
		case "Escape":
			e.preventDefault();
			while(autocomplete.firstChild) autocomplete.removeChild(autocomplete.lastChild!);
			last="";
			return;
		case " ":
		case "Space":
			if(e.altKey||e.shiftKey||e.ctrlKey){
				updateAutoComplete();
				e.preventDefault();
			}
			return;
		default:return;
	}
});


input.addEventListener("input",updateAutoComplete);
input.addEventListener("selectionchange",updateAutoComplete);
document.addEventListener("selectionchange",updateAutoComplete);

let last:string;

async function updateAutoComplete(){
	const newState=input.parentElement!.matches(":focus-within")
		?input.selectionStart+"|"+input.selectionEnd+"|"+input.value:"";
	if(newState==last) return;
	last=newState;

	let entries=newState?await getAutoComplete():[];
	while(autocomplete.firstChild) autocomplete.removeChild(autocomplete.lastChild!);
	autocomplete.append(...entries);
}

let cachedTypes:Promise<string[]> | null=null;
let cachedTypesTimeout:ReturnType<typeof setTimeout> | undefined=undefined;
let cachedMethodsType:string | null=null;
let cachedMethods:Promise<string[]> | null=null;
let cachedMethodsTimeout:ReturnType<typeof setTimeout> | undefined=undefined;

async function getAutoComplete():Promise<HTMLElement[]>{
	let start=input.selectionStart??Infinity;
	let end=input.selectionEnd??Infinity;
	if(start>end) [start,end]=[end,start];

	const value=input.value;
	let bracket=value.indexOf("(");
	if(bracket== -1) bracket=value.length;
	else if(end>bracket) return [];

	let dot=value.lastIndexOf(".",bracket);
	if(dot== -1||end<=dot){
		cachedTypes??=Rpc.getAllTypes().finally(()=>console.log("Catching types"));
		clearTimeout(cachedTypesTimeout);
		cachedTypesTimeout=setTimeout(()=>cachedTypes=null,1000);

		let types:string[];
		try{
			types= await cachedTypes;
		}catch(e){
			const div=document.createElement("div");
			div.textContent="Error getting types: "+(e as RpcError).message;
			return [div];
		}
		const beginning=value.substring(0,start);
		if(beginning[0]!="$")types=types.filter(t=>t[0]!="$");
		
		return types
			.filter(t=>t.startsWith(beginning))
			.map(t=>{
				const div=document.createElement("div");
				const b=div.appendChild(document.createElement("i"));
				b.appendChild(document.createTextNode(beginning));
				b.appendChild(document.createElement("b")).textContent=t.substring(beginning.length);
				div.appendChild(document.createTextNode(dot!=-1?value.substring(dot):"."));
				div.onclick=()=>{
					input.focus();
					document.execCommand("selectAll",false,null!);
					document.execCommand("insertText",false,div.textContent??"");
					input.selectionStart=input.selectionEnd=t.length+1;
				};
				return div;
			});
	}else if(start>dot){
		const newMethodsType=value.substring(0,dot);
		if(cachedMethodsType!=newMethodsType){
			cachedMethodsType=newMethodsType;
			cachedMethods=null;
		}
		const type=cachedMethodsType;
		cachedMethods??=Rpc.createObject(cachedMethodsType)[RpcObjectGetMethods]().finally(()=>console.log("Catching methods for "+type));
		clearTimeout(cachedMethodsTimeout);
		cachedMethodsTimeout=setTimeout(()=>cachedMethods=null,1000);

		let methods:string[];
		try{
			methods= await cachedMethods;
		}catch(e){
			const div=document.createElement("div");
			div.textContent="Error getting methods: "+(e as RpcError).message;
			div.style.backgroundColor="rgba(255,0,0,10%)";
			return [div];
		}
		const beginning=value.substring(dot+1,start);
		return methods
			.filter(m=>m.toLowerCase().startsWith(beginning.toLowerCase()))
			.map(m=>{
				const div=document.createElement("div");
				div.appendChild(document.createTextNode(type+"."));
				const b=div.appendChild(document.createElement("i"));
				b.appendChild(document.createTextNode(m.substring(0,beginning.length)));
				b.appendChild(document.createElement("b")).textContent=m.substring(beginning.length);
				div.appendChild(document.createTextNode(value.length<=bracket?"()":value.substring(bracket)));
				div.onclick=()=>{
					input.focus();
					document.execCommand("selectAll",false,null!);
					document.execCommand("insertText",false,div.textContent??"");
					input.selectionStart=input.selectionEnd=type.length+m.length+2;
				};
				return div;
			});
	}else return [];//Strange selection
}