//src/utils.js

const querystring = window.location.search;
export const urlParameters = new URLSearchParams(querystring);

//HELPERS
export function agregarEmotes(message){
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

export async function obtenerAvatar(username){
    let response = await fetch('https://decapi.me/twitch/avatar/'+username);
    let data = await response.text();
    return data;
}

export function obtenerBooleanos(parametro, valor){
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