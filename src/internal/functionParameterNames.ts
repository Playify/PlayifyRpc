export function getFunctionParameterNames(func:Function):string[]{
	let code=func.toString();
	code=code.substring(code.indexOf('(')+1);

	const args:string[]=[];
	while(true){
		const s=identifier(code);
		args.push(s.replaceAll('\0','').trim());
		code=code.substring(s.length);
		while(code[0]=='/') code=code.substring(identifier(code).length);
		if(code[0]=='=') code=code.substring(identifier(code.substring(1)).length+1);
		while(code[0]=='/') code=code.substring(identifier(code).length);
		if(code[0]==')') break;
		if(code[0]==',') code=code.substring(1);
		else throw new Error("Invalid args");
	}

	return args;
}

export function identifier(s:string):string{
	if(s[0]=='/'){
		if(s[1]=='/'){
			const end=s.indexOf("\n");
			if(end==-1)return s;
			else return s.substring(0,end+1);
		}
		if(s[1]=='*'){
			const end=s.indexOf("*/",2);
			if(end==-1)return s;
			else return s.substring(0,end+2);
		}
	}
	if(s[0]=='['){
		let result="[";
		while(true){
			result+=identifier(s.substring(result.length));
			if(s[result.length]==']') return result+"]";
			else if(s[result.length]==',') result+=",";
			else if(s[result.length]=='/') continue;//identifier skips comments
			else if(s[result.length]=='=') result+="\0".repeat(identifier(s.substring(result.length+1)).length+1);
			else throw new Error("Invalid array destructuring");
		}
	}
	if(s[0]=='{'){
		let result="{";
		while(true){
			result+=identifier(s.substring(result.length));
			if(s[result.length]=='}') return result+"}";
			else if(s[result.length]==':') result+=":";
			else if(s[result.length]==',') result+=",";
			else if(s[result.length]=='/') continue;//identifier skips comments
			else if(s[result.length]=='=') result+="\0".repeat(identifier(s.substring(result.length+1)).length+1);
			else throw new Error("Invalid object destructuring");
		}
	}
	if(s[0]=='"'||s[0]=="'"||s[0]=='`'){
		for(let i=1; i<s.length; i++)
			if(s[i]==s[0]) return s.substring(0,i+1);
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
		throw new Error("Missing end of string");
	}

	for(let i=0; i<s.length; i++)
		if(s[i]==','||s[i]==']'||s[i]=='}'||s[i]==')'||s[i]=='=')
			return s.substring(0,i);
	return s;
}