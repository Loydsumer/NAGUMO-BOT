import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
    await m.react(' 🔰');

    // تحديد هوية المرسل أو المستخدم المُشار إليه
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let name = await conn.getName(who);
    let edtr = `@${m.sender.split`@`[0]}`;
    let username = conn.getName(m.sender);

    // روابط الصوتيات (يجب أن تكون صالحة)
    const voiceNotes = [
        'https://qu.ax/OBmdj.mp3',
        // أضف المزيد من الروابط الصوتية هنا إن أردت
    ];

    // تصفية الروابط الفارغة (احتياطاً)
    const validVoiceNotes = voiceNotes.filter(url => url);

    // إرسال الصوت العشوائي إن وُجد
    if (validVoiceNotes.length > 0) {
        const randomAudioUrl = validVoiceNotes[Math.floor(Math.random() * validVoiceNotes.length)];

        await conn.sendMessage(m.chat, {
            audio: { url: randomAudioUrl },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: m });
    } else {
        await m.reply('❌ لا توجد ملفات صوتية متاحة حالياً.');
        return;
    }

    // تأخير بسيط قبل إرسال جهة الاتصال والإعلان
    setTimeout(async () => {
        // إعداد جهة الاتصال (vCard)
        let list = [{
            displayName: "｢Gito 🔰",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Gito 🔰
TEL;type=CELL;waid=201115546207:+201115546207
EMAIL;type=INTERNET:taib3a@gmail.com
ADR;type=WORK:;;اليمن-صنعاء;;;;
URL:https://www.instagram.com/dy3_alexander?igsh=YzljYTk1ODg3Zg==
END:VCARD`
        }];

        await conn.sendMessage(m.chat, {
            contacts: {
                displayName: `${list.length} جهة اتصال`,
                contacts: list
            },
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: ' 🔰غيتو مطور بوتات محترف',
                    body: 'اذا كنت تريد شراء بوت او سيرفر تواصل معه',
                    thumbnailUrl: 'https://files.catbox.moe/s92dua.jpg',
                    sourceUrl: null,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        // إرسال رسالة نصية مع زر تفاعل
        let txt = `
*مرحباً ${username}* 👋

أنا *Gito*، مطور بوتات واتساب محترف ✨

✅ *الخدمات التي أقدمها:*
- منصه استضافه بوتات باسعار رخيصه جدا وموثوقه
- صنع بوتات واتساب بمواصفات خاصة
- بوتات الدردشة الذكية
- بوتات الإدارة المتكاملة
- بوتات الألعاب والتسلية
- وأنظمة مخصصة حسب طلبك

📲 *للطلب أو الاستفسار:*
+201115546207`;

        await conn.sendMessage(m.chat, {
            text: txt,
            footer: '｢Gito 🔰',
            buttons: [
                {
                    buttonId: ".الاوامر",
                    buttonText: {
                        displayText: 'العودة الى القاىمة'
                    },
                    type: 1
                }
            ],
            viewOnce: true,
            headerType: 1
        }, { quoted: m });

    }, 1000); // تأخير لمدة ثانية واحدة
};

handler.help = ['مطور', 'برمجة', 'طلب-بوت'];
handler.tags = ['services'];
handler.command = /^(مطور|مبرمج|صنع-بوت|المطور|برمجة|غيتو|الغيتو|owner)$/i;

export default handler;