import { obtenerBooleanos, urlParameters } from "./utils";

export const StreamerbotPort = urlParameters.get('portInput') || '8080';
export const StreamerbotAddress = urlParameters.get('hostInput') || '127.0.0.1';

export const showAvatar = obtenerBooleanos("mostarAvatar", true);
export const showTimestamp = obtenerBooleanos("mostrarTiempo", true);
export const showBadges = obtenerBooleanos("mostrarInsigneas", true);
export const showImages = obtenerBooleanos("mostrarImagenes", true);
export const rolUsuario = urlParameters.get("rolesId") || "4";
export const fontSize = urlParameters.get("tamañoFuente") || "20";
export const showRedeemMessages = obtenerBooleanos("mostrarCanjes", true);
export const showHighlight = urlParameters.get("mostrarDestacado", true);
export const showCheerMessages = obtenerBooleanos("mostrarMensajesBits", true);
export const showRaidMessage = obtenerBooleanos("mostrarRaids", true);
export const showGiantEmotes = obtenerBooleanos("mostrarEmotesGigantes", true);
export const excludeCommands = obtenerBooleanos("excluirComandos", true);
export const ignoredUsers = urlParameters.get("usuariosIgnorados") || "";
export const colorFondo = urlParameters.get("fondoColor") || "#000000";
export const opacity = urlParameters.get("opacidad") || 0.75;

export const minRole = 3;
export const maxMessages = 30;
export let totalMessages = 0;
export let ultimoUsuario = '';
export const avatarHashMap = new Map();