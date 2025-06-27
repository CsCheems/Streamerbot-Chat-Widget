import { ChatMessage, RewardRedemption, BannedUser, TimeoutUser } from "./eventHandler";
import { StreamerbotPort, StreamerbotAddress } from "./constantes";

let ws = null;

let sbDebugMode = true;

export function conectarWs() {
    if (!("WebSocket" in window)) return;

	ws = new WebSocket(`ws://${StreamerbotAddress}:${StreamerbotPort}/`);

	ws.onclose = () => {
		setConnectionStatus(false);
		setTimeout(conectarWs, 5000);
	};

	ws.onopen = () => {
		setConnectionStatus(true);
		const subsPayload = {
			request: "Subscribe",
			id: "subscribe-all-events",
			events:{
				twitch: [
					"ChatMessage",
					"RewardRedemption",
					"UserTimeOut",
					"UserBanned"
				]
			}
		};
	ws.send(JSON.stringify(subsPayload));
	};

	ws.onmessage = (event) => {
		const wsdata = JSON.parse(event.data);
		if(!wsdata?.event?.type) return;
		if (sbDebugMode) {
			console.log("🟡 Evento recibido:", wsdata.event.source, wsdata.event.type, wsdata.data);
		}
		const {source, type} = wsdata.event;

		const data = wsdata.data;

		switch (source) {
			case 'Twitch':
				switch (type){
					case 'ChatMessage': ChatMessage; break;
					case 'RewardRedemption': RewardRedemption; break;
					case 'UserTimeOut': TimeoutUser; break;
					case 'UserBanned': BannedUser; break; 
				}
		}
	};
}

//ESTADO DE CONEXION A STREAMERBOT
function setConnectionStatus(connected){
    let statusContainer = document.getElementById('status-container');
    if(connected){
        statusContainer.style.background = "#2FB774";
        statusContainer.innerText = "CONECTADO!";
        statusContainer.style.opacity = 1;
        setTimeout(() => {
            statusContainer.style.transition = "all 2s ease";
            statusContainer.style.opacity = 0;
        }, 1000);
    }else{
        statusContainer.style.background = "FF0000";
        statusContainer.innerText = "CONECTANDO...";
        statusContainer.style.transition = "";
        statusContainer.style.opacity = 1;
    }
}