let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text, isMods, isOwner, isPrems }) => {
    let link = (m.quoted ? m.quoted.text ? m.quoted.text : text : text) || text;
    let [_, code] = link.match(linkRegex) || [];

    if (!code) throw `
*~⧼❆˹─━═┉⌯⤸◞⚠️◜⤹⌯┉═━─˼❆⧽~*
*[ ⚠️ خطأ ⚠️ ] الرابط غير صالح أو غير موجود*
*👉🏻 ضع رابط الجروب الصحيح*

*مثال:*
*.انضم https://chat.whatsapp.com/××××××××*

*[❗] ملاحظة:* لا ترد على أي رسالة قد تتسبب في تداخل، اكتب كرسالة جديدة فقط
*~⧼❆˹─━═┉⌯⤸◞⚠️◜⤹⌯┉═━─˼❆⧽~*
`.trim();

    if (isPrems || isMods || isOwner || m.fromMe) {
        let res = await conn.groupAcceptInvite(code);
        let welcomeMessage = `
*~⧼❆˹─━═┉⌯⤸◞🎉◜⤹⌯┉═━─˼❆⧽~*
*🧭┊⪼• ◈╷مرحبا بكم في المجموعة ⥏🧭⥑╵◈*  
*¦ ⌗╎يرجى الالتزام بالقوانين╎⌗ ¦*

> *✨ مرحبا @${m.sender.split("@")[0]}*  
> *✔️ تم انضمام البوت بنجاح، استمتعوا بخدماته!*

*~˼‏※⸃─┉┈┈⥏🧭⥑┈┈┉─⸂※ ˹~*
*⸂┊˼‏قوانين المجموعة:*  
1️⃣ ممنوع السب أو الإهانة للبوت وأعضاء المجموعة  
2️⃣ ممنوع طرد البوت أو تغييره بدون إذن  
3️⃣ التفاعل مع البوت بطريقة محترمة  
4️⃣ الالتزام بموضوع الجروب وقوانين المنصة

*~「⸂⥑📚 استمتعوا بالمجموعة وابقوا محترمين!」~*
*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼❆⧽~*
`;
        await m.reply(welcomeMessage, null, { mentions: [m.sender] });
    } else {
        const data = global.owner.filter(([id]) => id);
        for (let jid of data.map(([id]) => [id] + '@s.whatsapp.net').filter(v => v != conn.user.jid))
            await m.reply(`
*~⧼❆˹─━═┉⌯⤸◞❗◜⤹⌯┉═━─˼❆⧽~*
*[❗] طلب بوت جديد لمجموعة [❗]*  

*—◉ رقم مقدم الطلب:* wa.me/${m.sender.split('@')[0]}  
*—◉ رابط المجموعة:* ${link}

*~˼‏※⸃─┉┈┈⥏🧭⥑┈┈┉─⸂※ ˹~*
*بعض أسباب رفض الطلب:*  
1️⃣ البوت مشبع (مضاف في مجموعات كثيرة)  
2️⃣ تم طرد البوت سابقًا  
3️⃣ تم تغيير رابط المجموعة  
4️⃣ القرار النهائي لإضافة البوت يعود للمالك

*⏳ ضع في اعتبارك أن تقييم طلبك قد يستغرق ساعات أو أيام، تحلَّ بالصبر*
*~⧼❆˹─━═┉⌯⤸◞❗◜⤹⌯┉═━─˼❆⧽~*
`, jid);
        
        await m.reply(`
*~⧼❆˹─━═┉⌯⤸◞⚠️◜⤹⌯┉═━─˼❆⧽~*
*✅ تم إرسال طلبك للانضمام إلى المطور للتقييم*  
*⏳ سيتم الرد بعد المراجعة*
*~⧼❆˹─━═┉⌯⤸◞⚠️◜⤹⌯┉═━─˼❆⧽~*
`);
    }
};

handler.help = ['join [chat.whatsapp.com]'];
handler.tags = ['premium'];
handler.command = /^join|انضم$/i;
export default handler;