import axios from 'axios';
import baileys from '@whiskeysockets/baileys';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2mp4 } from '../lib/webp2mp4.js';

const { prepareWAMessageMedia, proto, generateWAMessageFromContent } = baileys;

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) throw `⚠️ أدخل مصطلح البحث.\n\nمثال: *${usedPrefix + command} anime | 5*`;

    // تقسيم النص لـ كلمة وعدد
    let [query, count] = text.split('|').map(v => v.trim());
    count = parseInt(count) || 3; // الافتراضي 3 صور
    if (count > 10) count = 10; // الحد الأقصى 10

    await m.react("⌛");
    conn.reply(m.chat, `> ⏳ جاري البحث عن ${count} صور لـ: ${query}...`, m);

    // جلب الصور من API
    let images = [];
    try {
        const res = await axios.get('https://dark-api-x.vercel.app/api/v1/search/pinterest', {
            params: { query }
        });
        images = res.data.pins?.map(pin => pin.image).filter(Boolean).slice(0, count);
    } catch (e) {
        console.error(e);
    }

    if (!images || images.length === 0) {
        await m.react("❌");
        return m.reply(`❌ لم يتم العثور على نتائج لـ *"${query}"*.`);
    }

    // تحويل الصور إلى ملصقات وإرسالها
    for (let imageUrl of images) {
        try {
            let stiker = await sticker(false, imageUrl, global.packname, global.author);
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
        } catch (e) {
            console.error(e);
            conn.reply(m.chat, '*❌ حدث خطأ أثناء إنشاء الملصق.*', m);
        }
    }

    await m.react("✅");
};

handler.help = ['pin <keyword> | <عدد>'];
handler.tags = ['بحث', 'sticker'];
handler.command = /^(ملصقات|بينتر)$/i;
handler.register = true;
handler.limit = 1;

export default handler;