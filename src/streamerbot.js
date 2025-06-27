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

	ws.onconnect = () => {
		
	}
}