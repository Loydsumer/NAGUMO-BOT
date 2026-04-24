import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import ws from 'ws';

async function handler(m, { conn, usedPrefix, command }) {
    // 📂 المجلدات المُنشأة
    const vsJB = '1.0.0(beta)';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const carpetaBase = path.resolve(__dirname, '..', 'Furina_SubBot');
    const cantidadCarpetas = fs?.readdirSync(carpetaBase, { withFileTypes: true })
        .filter(item => item?.isDirectory())
        .length || 0;

    // 🖥️ وقت تشغيل السيرفر
    let _uptime = process.uptime() * 1000;
    let uptime = convertirMs(_uptime);

    // 👥 المستخدمون المتصلون
    const users = [
        ...new Set([...global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)])
    ];

    // ✨ إعداد رسالة كل بوت فرعي
    const message = users
        .map((v, index) => {
            const botConfig = global.db.data.users[v.user.jid] || {};
            const botNumber = botConfig.privacy 
                ? '[ مخفي للخصوصية ]' 
                : `wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}تنصيب`;
            const prestarStatus = botConfig.privacy 
                ? '' 
                : botConfig.prestar 
                    ? '✅ يمكن استخدام البوت للانضمام إلى مجموعات' 
                    : '';

            return `👤 \`[${index + 1}]\` *${v.user.name || global.db.data.users[v.user.jid]?.name || 'مجهول'}*
⏱️ \`\`\`${v.uptime ? convertirMs(Date.now() - v.uptime) : 'غير معروف'}\`\`\`
🎶 ${botNumber}`;
        })
        .join('\n\n⸶⸶⸶⸶⸶⸶⸶⸶⸶⸶\n\n');

    const replyMessage = message.length === 0
        ? `*⚠️ لا يوجد بوت فرعي متاح الآن. يرجى التحقق لاحقاً.*\n🐈 wa.me/${conn.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}تنصيب`
        : message;

    const totalUsers = users.length;

    // 🌟 رسالة الاستجابة النهائية مزخرفة
    const responseMessage = `
*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼❆⧽~*  
*🧭┊⪼• ◈╷Furina ⥏🧭⥑ SubBot╵◈*  
*¦ ⌗╎بـرمـجـة الـمـطـور╎⌗ ¦*  
> *~『◈˼‏radio˹◈』~*

*~˼‏※⸃─┉┈┈⥏🧭⥑┈┈┉─⸂※ ˹~*  
*⸂┊˼‏قائمة البوتات الفرعية V${vsJB} ¦↓⸃*  
> *⌝˼‏✨ يمكنك أن تصبح بوت فرعي من خلال البوتات الأخرى!⌞*  
> *💠 عدد البوتات الفرعية المتصلة: ${totalUsers || 0}*  
> *📁 عدد الجلسات المُنشأة: ${cantidadCarpetas || 0}*  
> *💻 وقت تشغيل السيرفر: \`\`\`${uptime}\`\`\`*

${replyMessage.trim()}

*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼❆⧽~*
`.trim();

    try {
        await conn.sendMessage(
            m.chat,
            {
                image: { url: ['https://qu.ax/spUwF.jpeg', 'https://qu.ax/ZfKAD.jpeg', 'https://qu.ax/UKUqX.jpeg'].getRandom() },
                caption: responseMessage
            },
            { quoted: m }
        );
    } catch {
        await conn.sendMessage(m.chat, { text: responseMessage }, { quoted: m });
    }
}

handler.command = /^(بوتات|bots|subsbots)$/i;
export default handler;

// ⏱️ تحويل الملي ثانية إلى وقت قابل للقراءة
function convertirMs(ms) {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);
    return [d > 0 ? `${d}d` : '', `${h}h`, `${m}m`, `${s}s`].filter(Boolean).join(' ');
}