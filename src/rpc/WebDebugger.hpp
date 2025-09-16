#pragma once

#include <map>

#include "Arduino.h"

#if ESP32

#include "WiFi.h"
#include "esp_task_wdt.h"

#elif ESP8266

#include "ESP8266WiFi.h"

#endif


namespace WebDebugger{
	bool _locked;
	bool _connected;
	uint16_t _port;
	WiFiServer server(0);
	String _lastSerialCommand;
	String _currSerialCommand="";
	std::map<String,std::function<String()>> getters;
	std::map<String,std::function<String(String)>> setters;

#define REGISTER_PIN(pin) WebDebugger::registerPin(#pin,pin)
#define REGISTER_PINS(...) WebDebugger::registerPins( (const char*[]){#__VA_ARGS__}, (int[]){__VA_ARGS__}, sizeof((int[]){__VA_ARGS__})/sizeof(int) )


	inline void registerPin(const String& name,uint8_t pin){
		getters[name]=[name,pin]{
#if SOC_TOUCH_SENSOR_NUM>0
			if(name[0]=='T')return name+" ("+pin+"):"+touchRead(pin)+" (touch)";
#endif
			if(name[0]=='A')return name+" ("+pin+"):"+analogRead(pin)+" (analog)";
			return name+" ("+pin+"): "+digitalRead(pin);
		};
		setters[name]=[name,pin](String value){
#if SOC_DAC_PERIPH_NUM>0
			if(name.startsWith("DAC")){
				if(!value.length()){
					dacDisable(DAC1);
					return name+" ("+pin+") set to disabled (analog)";
				}
				dacWrite(DAC1,value.toInt());
				return name+" ("+pin+") set to "+value.toInt()+" (analog)";
			}
#endif
			if(value==""||value=="!"||value=="T"||value=="TOGGLE"){
				const bool toggle=!digitalRead(pin);
				pinMode(pin,OUTPUT);
				digitalWrite(pin,toggle);
				return name+" ("+pin+") toggled to "+toggle;
			}
			if(value=="1"||value=="H"||value=="HIGH"){
				pinMode(pin,OUTPUT);
				digitalWrite(pin,HIGH);
				return name+" ("+pin+") set to 1";
			}
			if(value=="0"||value=="L"||value=="LOW"){
				pinMode(pin,OUTPUT);
				digitalWrite(pin,LOW);
				return name+" ("+pin+") set to 0";
			}
			if(value=="I"||value=="IN"||value=="INPUT"){
				pinMode(pin,INPUT);
				return name+" ("+pin+") configured to INPUT";
			}
			if(value=="O"||value=="OUT"||value=="OUTPUT"){
				pinMode(pin,OUTPUT);
				return name+" ("+pin+") configured to OUTPUT";
			}
			if(value=="PULLUP"){
				pinMode(pin,INPUT_PULLUP);
				return name+" ("+pin+") configured to INPUT_PULLUP";
			}
#ifdef INPUT_PULLDOWN
			if(value=="PULLDOWN"){
				pinMode(pin,INPUT_PULLDOWN);
				return name+" ("+pin+") configured to INPUT_PULLDOWN";
			}
#endif
#ifdef INPUT_PULLDOWN_16
			if(value=="PULLDOWN"){
				pinMode(pin,INPUT_PULLDOWN_16);
				return name+" ("+pin+") configured to INPUT_PULLDOWN";
			}
#endif
			if(value[0]=='A'){
				const auto v=value.substring(1).toInt();
				pinMode(pin,OUTPUT);
				analogWrite(pin,v);
				return name+" ("+pin+") set to analog "+v;
			}

			return "Unknown Value: "+value;
		};
	}

	inline void registerPins(const char* names[], const int values[], size_t count) {
		for (size_t i = 0; i < count; ++i) {
			registerPin(names[i], values[i]);
		}
	}
	
	inline int _tryParseInt(const String& s){
		if(s.isEmpty())return -1;
		for(const char i:s)
			if(!isDigit(i))
				return -1;
		return s.toInt();
	}


	

	inline String runCommand(String cmd){
		cmd.toUpperCase();
		const auto index=cmd.indexOf('=');
		if(index==-1){
			const auto it=getters.find(cmd);
			if(it!=getters.end())
				return it->second();
			auto pin=_tryParseInt(cmd);
			if(pin!=-1){
				registerPin(cmd,pin);
				return runCommand(cmd);
			}
		} else{
			const auto name = cmd.substring(0,index);
			const auto it=setters.find(name);
			if(it!=setters.end())
				return it->second(cmd.substring(index+1));
			auto pin=_tryParseInt(name);
			if(pin!=-1){
				registerPin(name,pin);
				return runCommand(cmd);
			}
		}
		return "Unknown command: "+cmd;
	}


	inline void setup(const uint16_t port=80){
		server.begin(_port=port);

#ifdef LED_BUILTIN
		registerPin("L",LED_BUILTIN);
		registerPin("LED",LED_BUILTIN);
		registerPin("LED_BUILTIN",LED_BUILTIN);
#endif

		//ESP32 only
#if ESP32
#if SOC_TOUCH_SENSOR_NUM
		REGISTER_PINS(T0,T1,T2,T3,T4,T5,T6,T7,T8,T9);
#endif
#if NUM_ANALOG_INPUTS==18
		REGISTER_PINS(A0,A3,A4,A5,A6,A7,A10,A11,A12,A13,A14,A15,A16,A17,A18,A19);
#elif NUM_ANALOG_INPUTS==6
		REGISTER_PINS(A0,A1,A2,A3,A4,A5);
#endif
#if SOC_DAC_PERIPH_NUM>0
		REGISTER_PINS(DAC1,DAC2);
#endif
#endif
		
		//ESP8266 only
#if ESP8266
		REGISTER_PINS(D0,D1,D2,D3,D4,D5,D6,D7,D8,D9,D10);
		REGISTER_PIN(A0);
#endif
		

		getters["LOCK"]=getters["PAUSE"]=[]{
			_locked=true;
			return "Program paused, use 'unpause' to continue";
		};
		getters["UNLOCK"]=getters["UNPAUSE"]=getters["RESUME"]=[]{
			_locked=false;
			return "Program unpaused";
		};
		getters["IP"]=[]{ return "IP: "+WiFi.localIP().toString(); };
		getters["GATEWAY"]=[]{ return "Gateway: "+WiFi.gatewayIP().toString(); };
		getters["SUBNET"]=[]{ return "Subnet: "+WiFi.subnetMask().toString(); };
		getters["MAC"]=[]{ return "MAC: "+WiFi.macAddress(); };
		getters["RSSI"]=[]{ return "RSSI: "+String(WiFi.RSSI()); };
		getters["SSID"]=[]{ return "SSID: "+WiFi.SSID(); };
		getters["WIFI"]=[]{
			const auto status=WiFi.status();
			static const char* statuses[]{
				"WL_IDLE_STATUS",
				"WL_NO_SSID_AVAIL",
				"WL_SCAN_COMPLETED",
				"WL_CONNECTED",
				"WL_CONNECT_FAILED",
				"WL_CONNECTION_LOST",
				"WL_WRONG_PASSWORD",
				"WL_DISCONNECTED",
				"???"
			};
			return "Wifi status: "+String(statuses[status<=7?status:8])+"="+status;
		};
		getters["UPTIME"]=[]{ return "Uptime: "+String(millis())+" (ms)"; };
		getters["RESTART"]=[]{
			ESP.restart();
			return "Restarting";
		};
		getters["REASON"]=[]{
#if ESP32
			const auto reason=esp_reset_reason();
			static const char* reasons[]{
				"ESP_RST_UNKNOWN",  //!< Reset reason can not be determined
				"ESP_RST_POWERON",  //!< Reset due to power-on event
				"ESP_RST_EXT",  //!< Reset by external pin (not applicable for ESP32)
				"ESP_RST_SW",  //!< Software reset via esp_restart
				"ESP_RST_PANIC",  //!< Software reset due to exception/panic
				"ESP_RST_INT_WDT",  //!< Reset (software or hardware) due to interrupt watchdog
				"ESP_RST_TASK_WDT",  //!< Reset due to task watchdog
				"ESP_RST_WDT",  //!< Reset due to other watchdogs
				"ESP_RST_DEEPSLEEP",  //!< Reset after exiting deep sleep mode
				"ESP_RST_BROWNOUT",  //!< Brownout reset (software or hardware)
				"ESP_RST_SDIO",  //!< Reset over SDIO
			};
			return "Reason: "+String(reasons[reason])+" ("+reason+")";
#elif ESP8266
			return "Reason: "+ESP.getResetReason();
#endif
		};

#if ESP8266
		setters["AFREQ"]=[](const String& value){
			analogWriteFreq(value.toInt());
			return String("analogWriteFreq(")+value.toInt()+")";
		};
		setters["ARANGE"]=[](const String& value){
			analogWriteRange(value.toInt());
			return String("analogWriteRange(")+value.toInt()+")";
		};
#endif
		setters["ARES"]=[](const String& value){
			analogWriteResolution(value.toInt());
			return String("analogWriteResolution(")+value.toInt()+")";
		};
	}

	inline void loop(bool serial=true){
		do{
			while(serial&&Serial.available()){
				const auto c=char(Serial.read());
				if(c=='\b')_currSerialCommand=_currSerialCommand.substring(0,_currSerialCommand.length()-1);
				else if(c!='\n')_currSerialCommand+=c;
				else{
					_currSerialCommand.trim();
					if(_currSerialCommand.length())_lastSerialCommand=_currSerialCommand;
					else _currSerialCommand=_lastSerialCommand;
					Serial.print("[WebDebugger] ");
					if(_locked)Serial.println("(Paused) ");
					Serial.println(runCommand(_currSerialCommand));

					_currSerialCommand="";
				}
			}


			if(_connected!=WiFi.isConnected()){
				_connected=!_connected;
				if(_connected){
					Serial.print("[WebDebugger] available at http://");
					Serial.print(WiFi.localIP());
					if(_port==80)Serial.println();
					else{
						Serial.print(":");
						Serial.println(_port);
					}
				}
			}

			if(auto client=server.accept()){
				const String request=client.readStringUntil('\n');
				const String cmd=request.substring(request.indexOf(' ')+2,
												   request.lastIndexOf(' '));//get url, without starting slash

				while(client.connected()){//Skip headers
					String header=client.readStringUntil('\n');
					header.trim();
					if(!header.length())break;
				}
				if(client.connected()){
					client.println("HTTP/1.1 200 OK");
					client.println("Content-Type: text/plain");
					client.println();
					if(_locked)client.print("(Paused) ");
					client.println(runCommand(cmd));
					client.stop();
				}
			}

			if(_locked){
				yield();
#if ESP32
				esp_task_wdt_reset();
#endif
			}
			// ReSharper disable once CppDFALoopConditionNotUpdated
		} while(_locked);
	}
}
