import yts from 'yt-search';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import axios from 'axios';  // سنحتاج لاستخدام axios لاختصار الرابط

const handler = async (m, { command, usedPrefix, conn, args }) => {
    const videoUrl = args[0]; // استلام الرابط من الأمر
    if (!videoUrl) return;

    try {
        const yt_play = await yts.search(videoUrl); // البحث باستخدام الرابط الذي تم تمريره
        const video = yt_play.videos[0]; // استخدام نفس الفيديو الذي تم اختياره

        // اختصار الرابط باستخدام bit.ly API
        const shortLink = await shortenUrl(video.url);

        const dataMessage = 
`📌 *نتيجة البحث:* 『 ${video.title} 』
━━━━━━━━━━━━━━━━
🎬 *العنوان:* ${video.title}
📅 *تاريخ النشر:* ${video.ago}
⏱️ *المدة:* ${secondString(video.duration.seconds)}
👁️‍🗨️ *المشاهدات:* ${MilesNumber(video.views)}
📺 *القناة:* ${video.author.name}
🔗 *الرابط المختصر:* ${shortLink}
━━━━━━━━━━━━━━━━
📥 *اختر الصيغة التي تريد تحميلها:*`;

        const thumbnail = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer });

        let buttons = [];

        if (command === "تحميل_صوت") {
            buttons = [
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 سريع', id: `${usedPrefix}صو ${shortLink}` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎶 متوسط', id: `${usedPrefix}صوت ${shortLink}` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'عالي🎼', id: `${usedPrefix}صوتوي ${shortLink}` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎙️ فويس', id: `${usedPrefix}فويس ${shortLink}` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📁 ملف', id: `${usedPrefix}ملف-صوت ${shortLink}` }) }
            ];
        } else if (command === "تحميل_فيديو") {
            buttons = [
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎬 سريع', id: `${usedPrefix}فيد ${shortLink}` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📹 HD', id: `${usedPrefix}فيديو ${shortLink}` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎞️ عالي', id: `${usedPrefix}فيديوي ${shortLink}` }) },
                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📂 ملف', id: `${usedPrefix}ملف-فيديو ${shortLink}` }) }
            ];
        }

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: dataMessage },
                        footer: { text: `© ${global.wm}`.trim() },
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: thumbnail.imageMessage,
                        },
                        nativeFlowMessage: {
                            buttons: buttons,
                            messageParamsJson: "",
                        },
                    },
                },
            },
        }, { userJid: conn.user.jid, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch {
        await conn.sendMessage(m.chat, { text: `❌ *حدث خطأ أثناء البحث.*` }, { quoted: m });
    }
};

// دالة لاختصار الرابط باستخدام bit.ly API
async function shortenUrl(longUrl) {
    const apiUrl = 'https://api-ssl.bitly.com/v4/shorten';
    const headers = {
        'Authorization': `Bearer YOUR_BITLY_API_TOKEN`,  // ضع توكن API الخاص بك هنا
        'Content-Type': 'application/json',
    };
    const data = {
        long_url: longUrl,
    };

    try {
        const response = await axios.post(apiUrl, data, { headers });
        return response.data.link;  // العودة بالرابط المختصر
    } catch (error) {
        console.error('خطأ في اختصار الرابط:', error);
        return longUrl;  // العودة بالرابط الأصلي إذا حدث خطأ
    }
}

handler.command = /^(تحميل_صوت|تحميل_فيديو)$/i;
export default handler;

function MilesNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function secondString(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + " ساعة " : ""}${m > 0 ? m + " دقيقة " : ""}${s > 0 ? s + " ثانية" : ""}`.trim();
}