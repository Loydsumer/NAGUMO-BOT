import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import baileys from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';

const { generateWAMessageFromContent } = baileys;

const handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime) throw `*❲ 💡 ❳ يرجى تحديد الملف الذي تود تحويله لرابط.*\n> مثال: ${usedPrefix + command} الملف`;

    // تنزيل الملف
    const media = await q.download();
    const { ext, mime: fileMime } = await fileTypeFromBuffer(media);
    const fileType = fileMime.split('/')[0];
    const fileSize = (media.length / 1024).toFixed(2) + ' KB';

    // رفع الملف على Catbox
    let link;
    try {
        link = await uploadToCatbox(media, ext);
    } catch (e) {
        console.error(e);
        return m.reply('💎❌ حدث خطأ أثناء رفع الملف إلى Catbox.');
    }

    // إعداد الصورة المصغرة (اختياري)
    let thumbnailBuffer = null;
    const linksFile = './media-links.txt';
    const links = fs.existsSync(linksFile)
        ? fs.readFileSync(linksFile, 'utf-8').split('\n').filter(Boolean)
        : [];
    if (links.length) {
        try {
            const resp = await axios.get(links[Math.floor(Math.random() * links.length)], { responseType: 'arraybuffer' });
            thumbnailBuffer = Buffer.from(resp.data, 'binary');
        } catch {}
    }

    // إعداد externalAdReply
    const adReply = {
        title: `📂 ${q.filename || `file.${ext}`}`,
        body: `🔖 النوع: ${fileType}\n📌 الامتداد: .${ext}\n💾 الحجم: ${fileSize}`,
        mediaType: 2, // 2 = صورة/فيديو
        mediaUrl: link,
        thumbnailUrl: link,
        sourceUrl: link
    };

    // إنشاء الرسالة المزخرفة
    const msg = generateWAMessageFromContent(m.chat, {
        extendedTextMessage: {
            text: `╭─❖ *رفع الملف بنجاح!* ❖─╮\n` +
                  `│ 📜 الاسم: ${q.filename || `file.${ext}`}\n` +
                  `│ 🔖 النوع: ${fileType}\n` +
                  `│ 📌 الامتداد: .${ext}\n` +
                  `│ 💾 الحجم: ${fileSize}\n` +
                  `│ 🔗 الرابط: ${link}\n` +
                  `╰───────────────╯\n` +
                  `> ⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐`,
            contextInfo: { externalAdReply: adReply }
        }
    }, { quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

// رفع إلى Catbox
const uploadToCatbox = async (buffer, ext) => {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, `file.${ext}`);

    const res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form
    });

    const url = await res.text();
    if (!url.startsWith('http')) throw new Error('فشل في رفع الملف إلى Catbox');
    return url;
};

handler.help = ['لرابط <رد على ملف>'];
handler.tags = ['ملف'];
handler.command = ['كات-بوكس'];
export default handler;