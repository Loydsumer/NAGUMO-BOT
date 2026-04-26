import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function uploadVideo(filePath) {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const response = await axios.post('https://videy.co/api/upload', formData, {
            headers: { ...formData.getHeaders() }
        });

        return response.data;
    } catch (error) {
        throw new Error('فشل في رفع الفيديو.');
    }
}

const handler = async (m, { conn }) => {
    try {
        await m.react('⌛');

        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!mime.startsWith('video/')) {
            throw 'يرجى إرسال فيديو مع تعليق *فيديو-اب* أو الرد على فيديو!';
        }

        let media = await q.download();
        if (!media) throw 'فشل في تنزيل الفيديو.';

        const filePath = './temp_video.mp4';
        await fs.promises.writeFile(filePath, media);

        let result = await uploadVideo(filePath);
        await fs.promises.unlink(filePath);

        await m.react('✅');
        await conn.reply(m.chat, `*تم رفع الفيديو بنجاح*\n\n*Video ID:* ${result.id}\n\n *رابط الفيديو:* https://videy.co/v?id=${result.id}`, m);

    } catch (error) {
        await m.react('❌');
        await conn.reply(m.chat, `*خطأ:* ${error.message || error}`, m);
    }
};

handler.help = ['فيديو-اب', 'رفع'];
handler.tags = ['أدوات'];
handler.command = /^(فيديو-اب|رفع|لرابط11)$/i;

handler.description = `لرفع الفيديوهات إلى خدمة "Videy" بكل سهولة.`;

handler.example = `
- استخدم الأمر *فيديو-اب* أو *رفع* لإرسال فيديو مع التعليق أو الرد على فيديو.
- مثال: أرسل فيديو مع تعليق "فيديو-اب" أو رد على فيديو مع الأمر "فيديو-اب".

🧞‍♀️ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`;

export default handler;