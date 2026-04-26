import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

let user = a => '@' + a.split('@')[0];

const handler = async (m, { groupMetadata, command, conn, text, usedPrefix }) => {
    // لو كتب فقط "توب" أو "top" → يظهر الأزرار + الصورة
    if (!text) {
        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😎 وسيمين', id: `${usedPrefix}${command} وسيمين` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😡 مزعجين', id: `${usedPrefix}${command} مزعجين` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧠 أذكياء', id: `${usedPrefix}${command} أذكياء` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '😂 مضحكين', id: `${usedPrefix}${command} مضحكين` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💰 أغنياء', id: `${usedPrefix}${command} أغنياء` }) }
        ];

        const dataMessage = `
🤖 *اختر نوع التوب الذي تريده* 🤖

📌 أمثلة:
> • *.${command} وسيمين*
> • *.${command} أذكياء*
> • *.${command} مضحكين*

🅾🅶🅰🅼🅸 🅱🅾🆃
        `.trim();

        // تجهيز الصورة
        const thumbnail = await prepareWAMessageMedia({ image: { url: 'https://files.catbox.moe/qdvu10.jpg' } }, { upload: conn.waUploadToServer });

        // إنشاء الرسالة التفاعلية مع الأزرار
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: dataMessage },
                        footer: { text: `🅾🅶🅰🅼🅸 🅱🅾🆃` }, // يظهر مرة واحدة فقط
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: thumbnail.imageMessage
                        },
                        nativeFlowMessage: {
                            buttons: buttons,
                            messageParamsJson: "",
                        },
                    },
                },
            },
        }, { userJid: conn.user.jid, quoted: m });

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    // إذا اختار المستخدم زر أو كتب التصنيف مباشرة → تنفيذ التوب
    let ps = groupMetadata.participants.map(v => v.id);
    let [a, b, c, d, e, f, g, h, i, j] = Array.from({ length: 10 }, () => ps[Math.floor(Math.random() * ps.length)]);

    let emoji = pickRandom(['💦','🍑','🔥','😩','🥵','😈','😳','👅','🍷','🫦','🫣','👀','💃','🤤','🤖','🙄','🤑']);
    let intro = pickRandom([
        `🤖 أفضل 10 في *${text}* حسب البوت 🤖`,
        `🤖 ها هم أفضل 10 أشخاص في *${text}* 🔥`,
        `🤖 الترتيب العشوائي لأفضل 10 في *${text}* 😈`,
        `🤖 هذه القائمة تضم أقوى 10 في *${text}*`,
        `🤖 البوت اختار لك أفضل 10 في *${text}* 🫦`
    ]);

    // تكوين رسالة التوب النهائية مع توقيع البوت مرة واحدة فقط
    let top = `*${emoji} ${intro} ${emoji}*\n\n` +
        `🤖 *1.* ${user(a)}\n` +
        `🤖 *2.* ${user(b)}\n` +
        `🤖 *3.* ${user(c)}\n` +
        `🤖 *4.* ${user(d)}\n` +
        `🤖 *5.* ${user(e)}\n` +
        `🤖 *6.* ${user(f)}\n` +
        `🤖 *7.* ${user(g)}\n` +
        `🤖 *8.* ${user(h)}\n` +
        `🤖 *9.* ${user(i)}\n` +
        `🤖 *10.* ${user(j)}\n\n` +
        `🅾🅶🅰🅼🅸 🅱🅾🆃`; // يظهر مرة واحدة فقط

    conn.reply(m.chat, top, m, { mentions: [a, b, c, d, e, f, g, h, i, j] });
};

handler.help = ['top *<النص>*', 'توب *<النص>*'];
handler.command = ['top', 'توب'];
handler.tags = ['group'];
handler.group = true;
handler.register = false;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}