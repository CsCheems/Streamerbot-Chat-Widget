//PARAMETROS//
const querystring = window.location.search;
const urlParameters = new URLSearchParams(querystring);
const StreamerbotPort = urlParameters.get('portInput') || '8080';
const StreamerbotAddress = urlParameters.get('hostInput') || '127.0.0.1';
const minRole = 3;
const maxMessages = 30;
let totalMessages = 0;
let ultimoUsuario = '';
const avatarHashMap = new Map();

//CLIENTE//
const client = new StreamerbotClient({
    host: StreamerbotAddress,
    port: StreamerbotPort,
    onConnect: (data) =>{
        console.log(data);
        setConnectionStatus(true);
    },
    onDisconnect: () =>{
        setConnectionStatus(false);
    }
});

//VALIDADORES//
const showAvatar = obtenerBooleanos("mostarAvatar", true);
const showTimestamp = obtenerBooleanos("mostrarTiempo", true);
const showBadges = obtenerBooleanos("mostrarInsigneas", true);
const showImages = obtenerBooleanos("mostrarImagenes", true);
const rolUsuario = urlParameters.get("rolesId") || "4";
const fontSize = urlParameters.get("tamañoFuente") || "20";
const showRedeemMessages = obtenerBooleanos("mostrarCanjes", false);
const showHighlight = obtenerBooleanos("mostrarDestacado", false);
const showCheerMessages = obtenerBooleanos("mostrarMensajesBits", false);
const showRaidMessage = obtenerBooleanos("mostrarRaids", false);
const showGiantEmotes = obtenerBooleanos("mostrarEmotesGigantes", false);
const excludeCommands = obtenerBooleanos("excluirComandos", true);
const ignoredUsers = urlParameters.get("usuariosIgnorados") || "DesempleadoCheems";
const colorFondo = urlParameters.get("fondoColor") || "#000000";
const opacity = urlParameters.get("opacidad") || 0.75;
const fuenteLetra = urlParameters.get("fuenteLetra" || "Arial");
let tiempoMs = urlParameters.get("tiempoMs") || 0;
const agruparMensajesConsecutivos = obtenerBooleanos("mensajesAgrupados", true); 

tiempoMs *= 1000; 

const body = document.body;
const hexToRgb = (hex) => {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const { r, g, b } = hexToRgb(colorFondo);
body.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;;


//EVENTOS//
client.on('Twitch.ChatMessage', (response) => {
    ChatMessage(response.data);
})

client.on('Twitch.Cheer', (response) => {
    if(showCheerMessages){
        Cheer(response.data);
    }
})

client.on('Twitch.Raid', (response) => {
    if(showRaidMessage){
        Raid(response.data);
    }
})

client.on('Twitch.RewardRedemption', (response)=> {
    if(showRedeemMessages){
        RewardRedemption(response.data);
    }
})

client.on('Twitch.AutomaticRewardRedemption', (response) =>{
    if(showGiantEmotes){
        AutomaticReward(response.data);
    }
})

client.on('Twitch.UserTimeOut', (response)=> {
    TimeoutUser(response.data);
})

client.on('Twitch.UserBanned', (response)=> {
    BannedUser(response.data);
})

//MENSAJE DE CHAT (TWITCH)//
async function ChatMessage(data){
    console.log(data);
    //ASIGNACION DE VALORES OBTENIDOS DEL DATA//
    const usuario = data.user.name;
    const uid = data.message.userId;
    const role = data.user.role;
    const color = data.user.color;
    const msgId = data.messageId;
    let message = data;
    console.log('Mensaje: ', message.text);
    let badges = '';
    let avatarImageUrl = '';
    let timestamp= '';
    const destacado = data.message.isHighlighted;
    
    //VERIFICAMOS SI LOS COMANDOS SON EXCLUIDOS//
    if(data.message.message.startsWith("!") && excludeCommands){
        return;
    }

    //VERIFICAMOS SI EL USUARIO ES IGNORADO//
    if(ignoredUsers.includes(usuario)){
        return;
    }

    //ASIGNAR AVATAR//
    if(!avatarHashMap.has(usuario)){
        try{
            const avatarUrl = await obtenerAvatar(usuario);
            avatarHashMap.set(usuario, avatarUrl);
        }catch(e){
            avatarHashMap.set(usuario, "default-avatar-url.png");
        }
    }
    const avatarUrl = avatarHashMap.get(usuario);

    if(showAvatar){
        avatarImageUrl = `<img src="${avatarUrl}" id="avatar"/>`;
    }else{
        avatarImageUrl = `<img src="${avatarUrl}" id="avatar" style="display: none"/>`;
    }

    //OBTENCION DE INSIGNIAS//
    for(i in data.message.badges){
        const badge = new Image();
        badge.src = data.message.badges[i].imageUrl;
        badge.classList.add("badge");
        if(showBadges){
            badges += `<img src="${badge.src}" id="badge"/>`;
        }else{
            badges += `<img src="${badge.src}" id="badge" style="display: none"/>`;
        }
        
    }

    //OBTENCION DE EMOTES//
    message = agregarEmotes(message);
    //REGEX PARA IMAGENES//
    const imgRegex = /^https:\/\/.*\.(gif|png|jpg|jpeg|webp)$/;
    const imgMatch = message.match(imgRegex);
        //true && 1 >= 0 && 0 != 0 && true
    if (imgMatch && role >= rolUsuario && rolUsuario != 0 && showImages) {
            const imgSrc = imgMatch[0];
            const imgTag = `<img src="${imgSrc}" alt="Image" id="imgur-image" />`;
            message = message.replace(imgMatch[0], imgTag);
    } else {
        console.log("No cuenta con el permiso necesario o no es imagen");
    }

    //TIMESTAMP//
    const now = new Date();
    const horas = String(now.getHours()).padStart(2, '0');
    const minutos = String(now.getMinutes()).padStart(2, '0');
    const time = `${horas}:${minutos}`;
    if(showTimestamp){
        timestamp = `<span id="time">${time}</span>`;
    }else{
        timestamp = `<span id="time" style="display: none">${time}</span>`;
    }
    
    totalMessages += 1;

    //MENSAJE ARMADO//
    if(ultimoUsuario !== usuario || !agruparMensajesConsecutivos){
        ultimoUsuario = usuario;
        element = `
            <div data-sender="${uid}" data-msgid="${msgId}" class="message-row animated" id="msg-${totalMessages}">
                <div id="message-box">
                    ${avatarImageUrl}
                    <div id="user-info">
                        ${timestamp}
                        ${badges}
                        <span id="usuario">${usuario}:</span>
                    </div>
                    <span id="user-message" style="font-size: ${fontSize}px; font-family: ${fuenteLetra}">${message}</span>
                </div>
            </div>
        `;
    }else{
        element = `
            <div data-sender="${uid}" data-msgid="${msgId}" class="message-row animated" id="msg-${totalMessages}">
                <div id="message-box">
                    <span id="user-message" style="font-size: ${fontSize}px; font-family: ${fuenteLetra}">${message}</span>
                </div>
            </div>
        `
    }

    $('.main-container').prepend(element);

    if(destacado && showHighlight === true){
        let msgDestacado = document.querySelector(`#msg-${totalMessages}`);
        msgDestacado.classList.add("destacado");
    }

    gsap.fromTo(`#msg-${totalMessages}`,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.inOut" }
    );
    
    const allMessages = document.querySelectorAll('.main-container .message-row');

    gsap.to(allMessages, {
        y: -20, 
        stagger: 1, 
        duration: 1,
        ease: "power2.inOut"
    });

    document.querySelectorAll(".main-container .message-row").forEach((el, i) => {
        if (i >= maxMessages) {
          gsap.timeline().to(el, { opacity: 0 }).add(() => {
            el.remove();
          });
        }else{
            if(tiempoMs > 0){
                setTimeout(() =>{
                    gsap.to(el, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => el.remove()
                    });
                }, tiempoMs);
            }
        }
    });
}



//REWARD REDEMPTIONS//
async function RewardRedemption(data) {
    console.log(data);
    //ASIGNACION DE VALORES OBTENIDOS DEL DATA//
    const usuario = data.user_name;
    const recompensa = data.reward.title;
    const costo = data.reward.cost;
    let avatarImageUrl = '';
    ultimoUsuario = "";

    if(!avatarHashMap.has(usuario)){
        try{
            const avatarUrl = await obtenerAvatar(usuario);
            avatarHashMap.set(usuario, avatarUrl);
        }catch(e){
            avatarHashMap.set(usuario, "default-avatar-url.png");
        }
    }
    const avatarUrl = avatarHashMap.get(usuario);
    avatarImageUrl = `<img src="${avatarUrl}" id="avatar"/>`;

    totalMessages += 1;

    const element = `
        <div class="redeem-row animated" id="msg-${totalMessages}">
                <div class="redeem .received">
                    <span class="redeem-message" style="font-size: ${fontSize}px ; font-family: ${fuenteLetra}">${avatarImageUrl}<br>${usuario} ha canjeado ${recompensa}</span>
                </div>
        </div>
    `;

    $('.main-container').prepend(element);

    gsap.fromTo(`#msg-${totalMessages}`,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );
    
    const allMessages = document.querySelectorAll('.main-container .message-row');

    gsap.to(allMessages, {
        y: -20, 
        stagger: 1, 
        duration: 1,
        ease: "power2.out"
    });

    document.querySelectorAll(".main-container .message-row").forEach((el, i) => {
        if (i >= maxMessages) {
          gsap.timeline().to(el, { opacity: 0 }).add(() => {
            el.remove();
          });
        }
    });
}

//AUTOMATIC REWARDS//
async function AutomaticReward(data){
    console.log(data);
    //ASIGNACION DE VARIABLES DEL DATA//
    const message = data;
    let text = data.message_text;
    let emotes = data.message_emotes;

    if(data.reward_type !== 'gigantify_an_emote'){
        return;
    }

    text = text.replace(/([^\s]*)/gi, 
        function (m, key){
            let result = emotes.filter(emote => {
                return emote.name === key
            });
            if(typeof result[0] !== "undefined"){
                let url = result[0]['imageUrl'];
                return `<img alt="" src="${url}" id="gigant-emote"/>`;
            }else return key;
        }
    );

    console.log(text);

    totalMessages += 1;

    const element = `
        <div class="message-row animated" id="msg-${totalMessages}">
            <div id="message-box centered-box">
                <div id="message-box" style="align-items:center">
                    ${text}
                </div>
            </div>
        </div>
    `;

    $('.main-container').prepend(element);

    gsap.fromTo(`#msg-${totalMessages}`,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );
    
    const allMessages = document.querySelectorAll('.main-container .message-row');

    gsap.to(allMessages, {
        y: -20, 
        stagger: 1, 
        duration: 1,
        ease: "power2.out"
    });

    document.querySelectorAll(".main-container .message-row").forEach((el, i) => {
        if (i >= maxMessages) {
          gsap.timeline().to(el, { opacity: 0 }).add(() => {
            el.remove();
          });
        }
    });

}

//TIMEOUT USER//
async function TimeoutUser(data){
    const sender = data.user_id;
    $(`.message-row[data-sender=${sender}]`).remove();
}

//BANNED USER//
async function BannedUser(data){
    const sender = data.user_id;
    $(`.message-row[data-sender=${sender}]`).remove();
}

//HELPERS//
function agregarEmotes(message){
    let text = html_encode(message.text);
    let emotes = message.emotes;

    text = text.replace(/([^\s]*)/gi, 
        function (m, key){
            let result = emotes.filter(emote => {
                return emote.name === key
            });
            if(typeof result[0] !== "undefined"){
                let url = result[0]['imageUrl'];
                return `<img alt="" src="${url}" id="emotes"/>`;
            }else return key;
        }
    );
    return text;
}

function html_encode(e) {
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

async function obtenerAvatar(username){
    let response = await fetch('https://decapi.me/twitch/avatar/'+username);
    let data = await response.text();
    return data;
}

function obtenerBooleanos(parametro, valor){
    const urlParams = new URLSearchParams(window.location.search);

    console.log(urlParams);

    const valorParametro = urlParams.get(parametro);

    if(valorParametro === null){
        return valor;
    }

    if(valorParametro === 'true'){
        return true;
    }else if(valorParametro === 'false'){
        return false;
    }else{
        return valor;
    }
}

//ESTADO DE CONEXION A STREAMERBOT//
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



