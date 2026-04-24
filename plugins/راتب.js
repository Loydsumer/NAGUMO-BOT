let handler = async (m, { isPrems, conn }) => {
    let time = global.db.data.users[m.sender].lastcofre + 86400000; // 86400000: 24 ساعة
    if (new Date - global.db.data.users[m.sender].lastcofre < 86400000) {
        throw `[❗تحذير❗] لقد اخذت مرتبك اليومي بالفعل\nامامك من الوقت *${msToTime(time - new Date())}* انتظر حتى يمر الوقت يا نصاب🙂`;
    }
    
    let img = 'https://img.freepik.com/vector-gratis/cofre-monedas-oro-piedras-preciosas-cristales-trofeo_107791-7769.jpg?w=2000';
    let dia = Math.floor(Math.random() * 30);
    let tok = Math.floor(Math.random() * 10);
    let mystic = Math.floor(Math.random() * 4000);
    let expp = Math.floor(Math.random() * 5000);

    // تحديث البيانات في البنك
    global.db.data.users[m.sender].limit += dia; // الماس
    global.db.data.users[m.sender].money += mystic; // العملات
    global.db.data.users[m.sender].joincount += tok; // نقاط الانضمام
    global.db.data.users[m.sender].exp += expp; // XP

    let texto = `
╔══💎═💵═💰══⬣
║-----{هديتك}-----
║┈┈┈┈┈┈┈┈┈┈┈┈┈
║➢ *${dia} الألماس* 💎
║➢ *${tok} العملات* 🪙
║➢ *${mystic} نقاط*🎀 
║➢ *${expp} اكسبي*🥇 
╚═════════════════⬣`;

    const fkontak = {
        "key": {
            "participants": "0@s.whatsapp.net",
            "remoteJid": "status@broadcast",
            "fromMe": false,
            "id": "Halo"
        },
        "message": {
            "contactMessage": {
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        "participant": "0@s.whatsapp.net"
    };

    await conn.sendFile(m.chat, img, 'mystic.jpg', texto, fkontak);

    // تحديث آخر وقت أخذ المرتب
    global.db.data.users[m.sender].lastcofre = new Date * 1;
}

handler.help = ['daily'];
handler.tags = ['xp'];
handler.command = ['راتب', 'هديه', 'abrircofre', 'cofreabrir']; 
handler.level = 0;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " ساعات " + minutes + " دقائق";
}