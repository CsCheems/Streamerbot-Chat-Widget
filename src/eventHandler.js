import { obtenerAvatar, agregarEmotes } from "./utils";

import { showAvatar, showTimestamp, showBadges, showImages, 
    rolUsuario, fontSize, showRedeemMessages, showHighlight, 
    showCheerMessages, showRaidMessage, showGiantEmotes, excludeCommands,
    ignoredUsers} from "./constantes";



//MENSAJE DE CHAT (TWITCH)//
export async function ChatMessage(data){
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

    console.log("ROLE: ", role);
    console.log("ROLE ID: ", rolUsuario);

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
    if(ultimoUsuario !== usuario){
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
                    <span id="user-message" style="font-size: ${fontSize}px">${message}</span>
                </div>
            </div>
        `;
    }else{
        element = `
            <div data-sender="${uid}" data-msgid="${msgId}" class="message-row animated" id="msg-${totalMessages}">
                <div id="message-box">
                    <span id="user-message" style="font-size: ${fontSize}px">${message}</span>
                </div>
            </div>
        `
    }

    $('.main-container').prepend(element);

    if(destacado && showHighlight == true){
        let msgDestacado = document.querySelector(`#msg-${totalMessages}`);
        msgDestacado.classList.add("destacado");
    }

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

//REWARD REDEMPTIONS//
export async function RewardRedemption(data) {
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
                    <span class="redeem-message" style="font-size: ${fontSize}px">${avatarImageUrl}<br>${usuario} ha canjeado ${recompensa}</span>
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
export function TimeoutUser(data){
    const sender = data.user_id;
    $(`.message-row[data-sender=${sender}]`).remove();
}

//BANNED USER//
export function BannedUser(data){
    const sender = data.user_id;
    $(`.message-row[data-sender=${sender}]`).remove();
}