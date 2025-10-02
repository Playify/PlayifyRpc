using System.Globalization;
using System.Numerics;
using System.Text;
using System.Text.RegularExpressions;
using PlayifyUtility.Jsons;

namespace PlayifyRpc.Internal.Data;

public readonly partial struct RpcDataPrimitive{

	public static RpcDataPrimitive? Parse(string s)=>Parser.ParseFromString(s);

	private static class Parser{
		public static RpcDataPrimitive? ParseFromString(string s){
			var reader=new StringReader(s);
			if(Parse(reader) is not{} found) return null;
			if(NextPeek(reader)!=-1) return null;
			return found;
		}

		private static RpcDataPrimitive? Parse(TextReader r)
			=>NextPeek(r) switch{
				'{'=>ParseObject(r),
				'['=>ParseArray(r),
				'"'=>JsonString.UnescapeOrNull(r,'"',true) is{} s?new RpcDataPrimitive(s):null,
				'\''=>JsonString.UnescapeOrNull(r,'\'',true) is{} s?new RpcDataPrimitive(s):null,
				'n'=>ParseLiteral(r,"null")?new RpcDataPrimitive():null,
				't'=>ParseLiteral(r,"true")?new RpcDataPrimitive(true):null,
				'f'=>ParseLiteral(r,"false")?new RpcDataPrimitive(false):null,
				'N'=>ParseLiteral(r,"NaN")?new RpcDataPrimitive(double.NaN):null,
				'I'=>ParseLiteral(r,"Infinity")?new RpcDataPrimitive(double.PositiveInfinity):null,
				>='0' and <='9' or '+' or '-' or '.'=>ParseNumber(r),
				'/'=>ParseRegex(r),
				_=>null,
			};

		private static bool ParseLiteral(TextReader r,string s)=>s.All(c=>r.Read()==c);

		private static RpcDataPrimitive? ParseArray(TextReader r){
			if(NextRead(r)!='[') return null;
			var o=new List<RpcDataPrimitive>();

			var c=NextPeek(r);
			switch(c){
				case ',':
					r.Read();
					return NextRead(r)==']'?new RpcDataPrimitive(o):null;
				case ']':{
					r.Read();
					return new RpcDataPrimitive(o);
				}
			}
			while(true){
				if(Parse(r) is not{} child) return null;
				o.Add(child);
				c=NextRead(r);
				if(c==']') return new RpcDataPrimitive(o);
				if(c!=',') return null;
				c=NextPeek(r);
				if(c!=']') continue;
				r.Read();
				return new RpcDataPrimitive(o);
			}
		}

		private static RpcDataPrimitive? ParseObject(TextReader r){
			if(NextRead(r)!='{') return null;
			var o=new List<(string key,RpcDataPrimitive value)>();
			var c=NextPeek(r);
			switch(c){
				case ',':
					r.Read();
					return NextRead(r)=='}'?new RpcDataPrimitive(()=>o):null;
				case '}':{
					r.Read();
					return new RpcDataPrimitive(()=>o);
				}
			}
			while(true){
				if(ParseString(r) is not{} key) return null;
				if(NextRead(r)!=':') return null;
				if(Parse(r) is not{} child) return null;
				o.Add((key,child));
				c=NextRead(r);
				if(c=='}') return new RpcDataPrimitive(()=>o);
				if(c!=',') return null;
				c=NextPeek(r);
				if(c!='}') continue;
				r.Read();
				return new RpcDataPrimitive(()=>o);
			}
		}


		private static RpcDataPrimitive? ParseNumber(TextReader r){
			var builder=new StringBuilder();
			var c=NextPeek(r);

			var allowDot=true;
			var allowE=true;
			var allowSign=true;
			var hasDigits=false;
			var radix=10;
			while(true){
				switch(c){
					case '0' or '1':
					case >='0' and <='9' when radix>=10:
					case >='a' and <='f' when radix>=16:
					case >='A' and <='F' when radix>=16:
						hasDigits=true;
						builder.Append((char)c);
						break;
					case '_'://Allow as spacers
						break;
					case '.' when allowDot:
						builder.Append('.');
						allowDot=false;
						break;
					case 'e' or 'E' when allowE&&hasDigits:
						builder.Append((char)c);
						allowE=false;
						allowSign=true;
						allowDot=false;

						r.Read();//remove peeked value from stream
						c=r.Peek();
						continue;//Can't use break, as that would set allowSign to false again.
					case '+' when allowSign:
						//Don't add + to builder
						break;
					case '-' when allowSign:
						builder.Append((char)c);
						break;
					case 'N' when builder.ToString() is "" or "-":
						return ReadLiteral(r,"NaN")?new RpcDataPrimitive(double.NaN):null;
					case 'I' when builder.ToString() is "" or "-":
						return ReadLiteral(r,"Infinity")?new RpcDataPrimitive(builder.Length!=0?double.NegativeInfinity:double.PositiveInfinity):null;
					case 'b' when builder.ToString() is "0" or "-0" or "+0":
						builder.Length--;
						radix=2;
						allowDot=false;
						allowE=false;
						break;
					case 'x' when builder.ToString() is "0" or "-0" or "+0":
						builder.Length--;
						radix=16;
						allowDot=false;
						allowE=false;
						break;
					case 'n':{
						if(ParseNumber(builder.ToString(),radix) is not{} big) return null;
						r.Read();//remove peeked value from stream
						return new RpcDataPrimitive(big);
					}
					default:{
						if(!hasDigits) return null;
						switch(radix){
							case 10:{
								if(double.TryParse(builder.ToString(),NumberStyles.Any,CultureInfo.InvariantCulture,out var dbl))
									return new RpcDataPrimitive(dbl);
								return null;
							}
							default:{
								if(ParseNumber(builder.ToString(),radix) is{} big)
									return new RpcDataPrimitive((double)big);
								return null;
							}
						}
					}
				}
				r.Read();//remove peeked value from stream
				allowSign=false;
				c=r.Peek();
			}
		}

		private static BigInteger? ParseNumber(string s,int radix){
			switch(radix){
				case 2:{
					var negative=s.Length!=0&&s[0]=='-';
					if(negative) s=s.Substring(1);

					var val=BigInteger.Zero;
					foreach(var cc in s){
						val<<=1;
						if(cc=='1') val|=1;
						else if(cc!='0') return null;
					}
					
					if(negative) val=-val;
					return val;
				}
				case 16:{
					var negative=s.Length!=0&&s[0]=='-';
					if(negative) s=s.Substring(1);
					
					if(!BigInteger.TryParse("0"+s,NumberStyles.HexNumber,CultureInfo.InvariantCulture,out var big)) return null;

					if(negative) big=-big;
					return big;
				}
				default:{
					if(!BigInteger.TryParse(s,NumberStyles.Any,CultureInfo.InvariantCulture,out var big)) return null;
					return big;
				}
			}
		}

		private static readonly Dictionary<int,RegexOptions> RegexOptionsMap=new(){
			{'i',RegexOptions.IgnoreCase},
			{'m',RegexOptions.Multiline},
		};

		private static RpcDataPrimitive? ParseRegex(TextReader r){
			var pattern=JsonString.UnescapeOrNull(r,'/',false);
			if(pattern==null) return null;

			RegexOptions options=default;

			while(true){
				var peek=r.Peek();
				if(
					!RegexOptionsMap.TryGetValue(peek,out var newFlag)
					||(options&newFlag)!=0//Already added that
				) return From(new Regex(pattern,options));
				options|=newFlag;
				r.Read();
			}
		}


		private static string? ParseString(TextReader r)=>NextPeek(r) switch{
			'"'=>JsonString.UnescapeOrNull(r,'"',true),
			'\''=>JsonString.UnescapeOrNull(r,'\'',true),
			_=>null,
		};


		#region Reading
		private static bool ReadLiteral(TextReader r,string s){
			foreach(var c in s){
				if(r.Peek()!=c) return false;
				r.Read();
			}
			return true;
		}

		private static int NextRead(TextReader r){
			while(true){
				var c=r.Read();
				if(c=='/')
					if(!SkipComment(r)) return -1;//Error
					else continue;
				if(!IsWhitespace(c)) return c;
			}
		}

		private static int NextPeek(TextReader r){
			while(true){
				var c=r.Peek();
				if(c=='/'){
					r.Read();
					if(!SkipComment(r)) return -1;//Error
					continue;
				}
				if(!IsWhitespace(c)) return c;
				r.Read();
			}
		}

		private static bool SkipComment(TextReader r){
			var read=r.Read();
			switch(read){
				case '*':
					var c=r.Read();
					while(true)
						if(c==-1) return false;
						else if(c=='*'){
							c=r.Read();
							if(c=='/') return true;
						} else c=r.Read();
				case '/':
					while(true){
						switch(r.Read()){
							case '\r':
							case '\n':
								return true;
							case -1:
								return false;
						}
					}
				default:return false;
			}
		}

		private static bool IsWhitespace(int c)=>c is ' ' or '\r' or '\n' or '\t';
		#endregion

	}
}