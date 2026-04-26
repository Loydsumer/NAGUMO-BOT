import { toAudio } from '../lib/converter.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || '';

    if (!/video|audio/.test(mime)) throw `🧞‍♀️ *عذرًا، يجب عليك الرد على فيديو أو صوت لتحويله إلى MP3!*`;

    await conn.sendPresenceUpdate('recording', m.chat);
    let media = await q.download?.();

    if (!media && !/video/.test(mime)) throw `🧞‍♀️ *تعذر تحميل الملف، تأكد أنك ترد على فيديو أو صوت!*`;
    if (!media && !/audio/.test(mime)) throw `🧞‍♀️ *تعذر تحميل الملف، تأكد أنك ترد على فيديو أو صوت!*`;

    let audio = await toAudio(media, 'mp4');

    if (!audio.data && !/audio/.test(mime)) throw `🧞‍♀️ *تعذر تحويل الملف، جرب ملفًا آخر!*`;
    if (!audio.data && !/video/.test(mime)) throw `🧞‍♀️ *تعذر تحويل الملف، جرب ملفًا آخر!*`;

    conn.sendFile(m.chat, audio.data, 'converted.mp3', '', m, null, { mimetype: 'audio/mp4' });

    // تخصيص رسالة التوضيح حسب الأمر
    let usageMessage = `🧞‍♀️ *طريقة الاستخدام:*  
1️⃣ *أرسل فيديو أو صوتًا في المحادثة.*  
2️⃣ *قم بالرد على الفيديو أو الصوت وأرسل الأمر:*  
   📌 *${usedPrefix}${command}*  
📌 *أو استخدم أحد الأوامر البديلة.*  
ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`;

    m.reply(usageMessage);
};

handler.help = ['لصوت', 'tomp3', 'toaudio'];  
handler.tags = ['audio'];  
handler.command = /^(لصوت|tomp3|toaudio)$/i;  

export default handler;