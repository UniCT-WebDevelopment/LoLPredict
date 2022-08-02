process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const LCUConnector = require("lcu-connector");
const WebSocket = require('ws');

const MESSAGE_TYPES = {
    WELCOME: 0,
    PREFIX: 1,
    CALL: 2,
    CALLRESULT: 3,
    CALLERROR: 4,
    SUBSCRIBE: 5,
    UNSUBSCRIBE: 6,
    PUBLISH: 7,
    EVENT: 8
};

let lolData;

class RiotWSProtocol extends WebSocket {

    constructor(url) {
        super(url, 'wamp');

        this.session = null;
        this.on('message', this._onMessage.bind(this));
    }

    close() {
        super.close();
        this.session = null;
    }

    terminate() {
        super.terminate();
        this.session = null;
    }

    subscribe(topic, callback) {
        super.addListener(topic, callback);
        this.send(MESSAGE_TYPES.SUBSCRIBE, topic);
    }

    unsubscribe(topic, callback) {
        super.removeListener(topic, callback);
        this.send(MESSAGE_TYPES.UNSUBSCRIBE, topic);
    }

    send(type, message) {
        super.send(JSON.stringify([type, message]));
    }

    _onMessage(message) {
        const [type, ...data] = JSON.parse(message);
        lolData = data;
        
        console.log("DATI PRESI DA NOI" + lolData)
        switch (type) {
            case MESSAGE_TYPES.WELCOME:
                this.session = data[0];
                // this.protocolVersion = data[1];
                // this.details = data[2];
                break;
            case MESSAGE_TYPES.CALLRESULT:
                console.log('Unknown call, if you see this file an issue at https://discord.gg/hPtrMcx with the following data:', data);
                break;
            case MESSAGE_TYPES.TYPE_ID_CALLERROR:
                console.log('Unknown call error, if you see this file an issue at https://discord.gg/hPtrMcx with the following data:', data);
                break;
            case MESSAGE_TYPES.EVENT:
                const [topic, payload] = data;
                this.emit(topic, payload);
                break;
            default:
                console.log('Unknown type, if you see this file an issue with at https://discord.gg/hPtrMcx with the following data:', [type, data]);
                break;
        }
    }
}

/** HOW TO USE */


const connector = new LCUConnector();

connector.on('connect', data => {
    console.log('League Client has started', data);
    const ws = new RiotWSProtocol('wss://riot:'+data.password+'@localhost:'+data.port+'/');

    ws.on('open', () => {
        ws.subscribe('OnJsonApiEvent', console.log);
    });
});

connector.on('disconnect', () => {
    console.log('League Client has been closed');
});

// Start listening for the LCU client
connector.start();
console.log('Listening for League Client');


// const WebSocket = require('ws');
// const UUID = require("uuid");

// const wss = new WebSocket.Server({host:"0.0.0.0", port: 9998});


// const posistion = {
//   command:"position",
//   data: {
//     X:0,
//     Y:0,
//     Angle:0
//   }
// }

// const battery = {
//   command:"battery",
//   data: {
//     percent:100
//   }
// }

// const times = {};
// const clients = {}

// wss.on('connection', function connection(ws) {
//   var X = 0
//   var Y = 0
//   var Angle = 0
//   const interval = setInterval(() => {
//     ws.send(JSON.stringify({command:"position", data: {"X":X, "Y":Y, "Angle":Angle}}))
//     X+=1
//     Y+=1
//     Angle+=1

//     if(X >= 2500) X = 0
//     if(Y >= 1900) Y = 0
//   }, 20)

//   ws["uuid"] = UUID.v4();
//   clients[ws["uuid"]] = ws;
//   clients[ws["uuid"]]["timeInterval"] = null;
//   clients[ws["uuid"]]["mc"] = 0;
//   console.log("CONNECTED", clients[ws["uuid"]]["uuid"])

//   clients[ws["uuid"]].on("close", () => {
//     clearInterval(interval)
//     console.log("DISCONNECTED", clients[ws["uuid"]]["uuid"])
//     if(clients[ws["uuid"]].hasOwnProperty("timeInterval")){ 
//       clearInterval(clients[ws["uuid"]]["timeInterval"]);
//     }
//     delete clients[ws["uuid"]]
//   })
  

//   clients[ws["uuid"]].on('message', function incoming(message) {
//     console.log('received: %s', message);

//     if(message == "newgame"){
      
//       clients[ws["uuid"]]["mc"] = 0;
//       if(clients[ws["uuid"]].hasOwnProperty("timeInterval")){ 
//         clearInterval(clients[ws["uuid"]]["timeInterval"]);
//       }
//       clients[ws["uuid"]]["startTime"] = Date.now() / 1000;

//       console.log(clients[ws["uuid"]]["uuid"], "starts new game", clients[ws["uuid"]]["startTime"])
//       clients[ws["uuid"]]["timeInterval"] = setInterval(() => {
//         console.log("Sending new Money Crate to", ws["uuid"])
//         ws.send("mc");
//         clients[ws["uuid"]]["mc"] = clients[ws["uuid"]]["mc"] +1;
//       }, 10000);

//     }
//     else if(message.toString().split(":")[0] == "gm"){
//       if(clients[ws["uuid"]].hasOwnProperty("timeInterval")){ 
//         clearInterval(clients[ws["uuid"]]["timeInterval"]);
//       }
//       const timeEnd = Date.now() / 1000 ;
//       const money = parseInt(message.toString().split(":")[1]);
//       const time = parseInt(message.toString().split(":")[2]);
//       const points = parseInt(message.toString().split(":")[3]);
//       const totalTime =  timeEnd - clients[ws["uuid"]]["startTime"] + 5;
//       const LEGIT = totalTime >= time && money <= clients[ws["uuid"]]["mc"] * 3 &&  points <= ((clients[ws["uuid"]]["mc"] * 3 * 5) +  totalTime)
//       console.log(money, time, points)
//       console.log(clients[ws["uuid"]]["mc"] * 3, totalTime, ((clients[ws["uuid"]]["mc"] * 3 * 5) +  totalTime))
//       console.log(totalTime >= time, money <= clients[ws["uuid"]]["mc"] * 3,  points <= ((clients[ws["uuid"]]["mc"] * 3 * 5) +  totalTime))
//       console.log(LEGIT)
//       if(!LEGIT){
//         ws.send("nope");
//       }
//     }

//   });

 

// });
