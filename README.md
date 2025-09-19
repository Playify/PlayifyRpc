# PlayifyRpc

This library can be used for remote function calling.

A server is needed to run a backend, where all clients can connect. The server program is only available in c#. More info on that can be found in the [PlayifyRpc_CSharp](PlayifyRpc_CSharp) folder.


There can be multiple clients, that can interact with each other. For each type of client, there is a different implementation.

### C#

For desktop apps, or applications running on a server (e.g. running Linux), the C# version can be used. It can be installed using Nuget
by calling `dotnet add package PlayifyRpc`

[NuGet Page](https://www.nuget.org/packages/PlayifyRpc)

### TypeScript

Anything with web/nodejs can use the PlayifyRpc_Typescript package, that can be installed using `npm install playify-rpc`.
Most of the functionallity can be accessed by the `Rpc` object exported by this library.

[NPM Page](https://www.npmjs.com/package/playify-rpc)

### PlatformIO

Microcontrollers like ESP32 or ESP8266 (e.g. NodeMCU), can be programmed using PlatformIO, which allows installing the library using 
`pio pkg install --library "playify/playify-rpc@^1.9.0"` taking into account the current version.

[PlatformIO Page](https://registry.platformio.org/libraries/playify/playify-rpc)

### Webhooks

For anything else, the server also exposes the ability to call functions directly using web requests. e.g. 
`http://127.0.0.1:4590/rpc/Rpc.getRegistrations()`, more on that can be found in the [PlayifyRpc_CSharp](PlayifyRpc_CSharp) folder.

This allows calling functions from everywhere, so that anything trigger an action, inside the RPC-Network