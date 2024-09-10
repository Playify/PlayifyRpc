declare const Rpc:typeof import("../rpc.js").Rpc;
declare const RpcObjectGetMethods:typeof import("../rpc.js").RpcObjectGetMethods;
declare type RpcError=import("../rpc.js").RpcError;


const input=document.querySelector<HTMLInputElement>("input")!;
const autocomplete=document.querySelector<HTMLInputElement>(".autocomplete")!;
const result=document.querySelector<HTMLPreElement>(".result")!;

function setStatus(text:string,color:string,back:string,date:number){
	const dateTime=new Date(date-(new Date().getTimezoneOffset()*1000*60)).toJSON();
	const status=document.querySelector<HTMLElement>(".status")!;
	status.textContent=`${text} (${dateTime.replace('T',' ').replace('Z','')})`;
	status.style.color=color;
	status.style.backgroundColor=back;
}

let curr=0;

async function runEval(func:()=>Promise<string>=()=>Rpc.evalString(input.value)){
	while(autocomplete.firstChild) autocomplete.removeChild(autocomplete.lastChild!);
	last="";

	const now=++curr;

	const startTime=Date.now();
	try{
		setStatus("Executing","cyan","blue",startTime);
		result.style.backgroundColor="rgba(0,0,255,10%)";
		result.style.setProperty("scrollbar-color","rgb(0,0,128) transparent");
		const s=await func();
		if(now!=curr) return;
		result.textContent=s;
		result.style.backgroundColor="rgba(0,255,0,10%)";
		result.style.setProperty("scrollbar-color","rgb(0,128,0) transparent");
		const endTime=Date.now();
		setStatus(`Success (${((endTime-startTime)/1000).toFixed(3)}s)`,"lime","green",Date.now());
	}catch(e){
		if(now!=curr) return;
		result.textContent=(e as RpcError).trashLocalStack()+"\n\n\nException data:"+JSON.stringify((e as RpcError).data,null,"\t");
		result.style.backgroundColor="rgba(255,0,0,10%)";
		result.style.setProperty("scrollbar-color","rgb(128,0,0) transparent");
		const endTime=Date.now();
		setStatus(`Failed (${((endTime-startTime)/1000).toFixed(3)}s)`,"orangered","darkred",Date.now());
	}
}

const copy=document.querySelector<HTMLElement>(".copy")!;
let copyTimeout:ReturnType<typeof setTimeout> | undefined=undefined;
copy.addEventListener("click",()=>{
	const textarea=document.createElement('textarea');
	textarea.value=result.textContent!;
	textarea.style.position='fixed';
	textarea.style.left='-9999px';
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


let parseTimeout:ReturnType<typeof setTimeout> | undefined=undefined;
let parseJson=document.querySelector<HTMLElement>(".parseJson")!;
parseJson.addEventListener("click",()=>{
	let success=false;
	try{
		const s=result.textContent??"";
		if(s.startsWith('"')){
			result.textContent=JSON.parse(s);
			success=true;
		}
		result.textContent=JSON.stringify(JSON.parse(result.textContent??""),null,"\t");
		success=true;
	}catch(e){
		console.warn("Error parsing JSON: ",e);
	}
	parseJson.style.color=success?"lime":"red";
	parseJson.style.backgroundColor=success?"darkgreen":"darkred";
	clearTimeout(parseTimeout);
	parseTimeout=setTimeout(()=>{
		parseJson.style.color=null!;
		parseJson.style.backgroundColor=null!;
	},250);
});


document.querySelector(".execute")!.addEventListener("click",()=>runEval());

input.setSelectionRange(input.value.length,input.value.length);
input.addEventListener("keydown",async e=>{
	let active:HTMLElement | null;
	switch(e.key){
		case "ArrowUp":
			e.preventDefault();

			active=autocomplete.querySelector<HTMLElement>(":scope>.active");
		{
			const selectables=[...autocomplete.querySelectorAll(":scope>.selectable")];
			const index=selectables.indexOf(active!);
			if(index== -1) selectables[selectables.length-1]?.classList.add("active");
			else{
				active?.classList.remove("active");
				(selectables[index-1]??active)?.classList.add("active");
			}
		}
			break;
		case "ArrowDown":
			e.preventDefault();

			active=autocomplete.querySelector<HTMLElement>(":scope>.active");
		{
			const selectables=[...autocomplete.querySelectorAll(":scope>.selectable")];
			const index=selectables.indexOf(active!);
			if(index== -1) selectables[0]?.classList.add("active");
			else{
				active?.classList.remove("active");
				(selectables[index+1]??active)?.classList.add("active");
			}
		}
			break;
		case "Tab":
			e.preventDefault();

			active=autocomplete.querySelector<HTMLElement>(":scope>.active.selectable")
				??autocomplete.querySelector<HTMLElement>(":scope>.selectable");
			active?.onclick!(null!);

			return;
		case "Enter":
			e.preventDefault();

			active=autocomplete.querySelector<HTMLElement>(":scope>.active");

			if(active) active.onclick?.(null!);
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
				e.preventDefault();
				return updateAutoComplete();
			}
			return;
		default:
			return;
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


async function getAutoComplete():Promise<HTMLElement[]>{
	let start=input.selectionStart??Infinity;
	let end=input.selectionEnd??Infinity;
	if(start>end) [start,end]=[end,start];

	const value=input.value;
	let bracket=value.indexOf("(");

	if(bracket== -1) bracket=value.length;
	else if(end>bracket){
		if(start<=bracket) return [];
		if(value.endsWith(")")&&end==value.length) return [];
		return await getAutoCompleteParameters(value,bracket+1,value.endsWith(")")?value.length-1:value.length,start,end);
	}

	let dot=value.lastIndexOf(".",bracket);
	if(dot== -1||end<=dot){
		return await getAutoCompleteTypes(value,dot,start);
	}else if(start>dot){
		return await getAutoCompleteMethods(value,dot,bracket,start);
	}else return [];//Strange selection
}


let cachedTypes:Promise<string[]> | null=null;
let cachedTypesTimeout:ReturnType<typeof setTimeout> | undefined=undefined;

async function getAutoCompleteTypes(value:string,to:number,selection:number){
	cachedTypes??=Rpc.getAllTypes().finally(()=>console.log("Catching types"));
	clearTimeout(cachedTypesTimeout);
	cachedTypesTimeout=setTimeout(()=>cachedTypes=null,1000);

	let types:string[];
	try{
		types= await cachedTypes;
	}catch(e){
		const div=document.createElement("div");
		div.textContent="Error getting types: "+(e as RpcError).message;
		div.style.backgroundColor="rgba(255,0,0,10%)";
		return [div];
	}
	const beginning=value.substring(0,selection);
	if(beginning[0]!="$") types=types.filter(t=>t[0]!="$");

	return types
		.filter(t=>t.startsWith(beginning))
		.map(t=>{
			const div=document.createElement("div");
			const b=div.appendChild(document.createElement("i"));
			b.appendChild(document.createTextNode(beginning));
			b.appendChild(document.createElement("b")).textContent=t.substring(beginning.length);
			div.appendChild(document.createTextNode(to!= -1?value.substring(to):"."));
			div.onclick=()=>{
				input.focus();
				document.execCommand("selectAll",false,null!);
				document.execCommand("insertText",false,div.textContent??"");
				input.selectionStart=input.selectionEnd=t.length+1;
			};
			div.classList.add("selectable");
			return div;
		});
}


let cachedMethodsType:string | null=null;
let cachedMethods:Promise<string[]> | null=null;
let cachedMethodsTimeout:ReturnType<typeof setTimeout> | undefined=undefined;

async function getAutoCompleteMethods(value:string,from:number,to:number,selection:number){
	const type=value.substring(0,from);
	if(cachedMethodsType!=type){
		cachedMethodsType=type;
		cachedMethods=null;
	}
	cachedMethods??=Rpc.createObject(type)[RpcObjectGetMethods]().finally(()=>console.log("Catching methods for "+type));
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
	const beginning=value.substring(from+1,selection);
	return methods
		.filter(m=>m.toLowerCase().startsWith(beginning.toLowerCase()))
		.map(m=>{
			const div=document.createElement("div");
			div.appendChild(document.createTextNode(type+"."));
			const b=div.appendChild(document.createElement("i"));
			b.appendChild(document.createTextNode(m.substring(0,beginning.length)));
			b.appendChild(document.createElement("b")).textContent=m.substring(beginning.length);
			div.appendChild(document.createTextNode(value.length<=to?"(...)":value.substring(to)));
			div.onclick=()=>{
				input.focus();
				document.execCommand("selectAll",false,null!);
				document.execCommand("insertText",false,type+"."+m+(value.length<=to?"()":value.substring(to)));
				input.selectionStart=input.selectionEnd=type.length+m.length+2;
			};
			div.classList.add("selectable");
			return div;
		});
}


let cachedSignaturesMethod:string | null=null;
let cachedSignatures:Promise<[parameters:string[],returns:string][]> | null=null;
let cachedSignaturesTimeout:ReturnType<typeof setTimeout> | undefined=undefined;

async function getAutoCompleteParameters(value:string,from:number,to:number,start:number,end:number){
	const callSignature=value.substring(0,from-1);
	if(cachedSignaturesMethod!=callSignature){
		cachedSignaturesMethod=callSignature;
		cachedSignatures=null;
	}
	const i=callSignature.lastIndexOf('.');
	if(i== -1){
		const div=document.createElement("div");
		div.textContent=`Error getting signatures: "${callSignature}" is not in the form of type.method`;
		div.style.backgroundColor="rgba(255,0,0,10%)";
		return [div];
	}

	cachedSignatures??=Rpc.createFunction(callSignature.substring(0,i),callSignature.substring(i+1)).getMethodSignatures().finally(()=>console.log("Catching signatures for "+callSignature));
	clearTimeout(cachedSignaturesTimeout);
	cachedSignaturesTimeout=setTimeout(()=>cachedSignatures=null,1000);

	let signatures:[parameters:string[],returns:string][];
	try{
		signatures= await cachedSignatures;
	}catch(e){
		const div=document.createElement("div");
		div.textContent="Error getting signatures: "+(e as RpcError).message;
		div.style.backgroundColor="rgba(255,0,0,10%)";
		return [div];
	}

	const splitArgs=splitArguments(value.substring(from,to));
	for(let [subStart,subEnd,subIndex] of splitArgs)
		if(start>=subStart+from&&end<=subEnd+from){/*
			signatures=signatures.filter(([parameters])=>{
				if(subIndex<parameters.length) return true;
				if(!parameters.length)return subIndex==0&&sub=="";
				return (parameters.length&&(parameters[parameters.length-1].startsWith("params ")
					||parameters[parameters.length-1].startsWith("...")));
			});*/
			return signatures.map(([parameters,returns])=>{
				const div=document.createElement("div");
				const content=checkArgs(splitArgs,parameters)?div.appendChild(document.createElement("b")):div;
				content.appendChild(document.createTextNode(value.substring(0,from)));
				let index=0;
				for(let parameter of parameters){
					if(index!=0) content.appendChild(document.createTextNode(","));
					if(subIndex==index
						||(subIndex>=parameters.length&&(
							parameters[parameters.length-1].startsWith("params ")
							||parameters[parameters.length-1].startsWith("...")))){
						const element=content.appendChild(document.createElement("i"));
						element.textContent=parameter;
					}else content.appendChild(document.createTextNode(parameter));
					index++;
				}
				content.appendChild(document.createTextNode(") ⇒ "));
				content.appendChild(document.createTextNode(returns));
				return div;
			});
		}
	return [];
}

function splitArguments(s:string){
	let brackets=0;
	let results:[start:number,end:number,index:number][]=[];
	let start=0;
	let i=0;
	for(; i<s.length; i++){
		const char=s[i];
		if("({[".includes(char)) brackets++;
		else if(")]}".includes(char)) brackets--;
		else if(char==','&&brackets==0) results.push([start,i,results.length]);
		else if(char=='"')
			for(i++; i<s.length; i++)
				if(s[i]=='"') break;
				else if(s[i]=='\\')
					switch(s[i+1]){
						case 'u':
							i+=5;
							break;
						case 'x':
							i+=3;
							break;
						default:
							i+=1;
							break;
					}
	}
	if(i>s.length) i=s.length;
	results.push([start,i,results.length]);
	return results;

	/*//JSON based solution, not viable, due to invalid JSON counting as single argument, no matter where the error is
	let args:[s:string,start:number,end:number,index:number][]=[];
	let lastComma=0;
	let searchComma=0;
	let index=0;
	while(true){
		const newComma=s.indexOf(',',searchComma);
		if(newComma== -1){
			args.push([s.substring(lastComma),lastComma,s.length,index++]);
			return args;
		}
		const newItem=s.substring(lastComma,newComma);
		try{
			JSON.parse(newItem);
		}catch{
			searchComma=newComma+1;
			continue;
		}
		args.push([newItem,lastComma,newComma,index++]);
		lastComma=searchComma=newComma+1;
	}*/
}

function checkArgs(splitArgs:ReturnType<typeof splitArguments>,parameters:string[]){
	const splitLength=splitArgs.length==1&&splitArgs[0][0]===splitArgs[0][1]?0:splitArgs.length;

	if(splitLength==parameters.length) return true;
	if(parameters.length==0) return false;

	const last=parameters[parameters.length-1];
	if(last.startsWith("params ")||last.startsWith("...")){
		if(splitLength>=parameters.length-1)
			return true;
	}


	return false;
}