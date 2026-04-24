import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

let handler = async (m, { conn }) => {
  const mediaFolder = path.join('./media');
  const files = fs.readdirSync(mediaFolder).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
  if (!files.length) return await m.reply('⚠️ لا توجد صور في مجلد media.');

  let uploadedLinks = [];

  await m.reply(`🔄 جاري رفع ${files.length} صورة إلى Catbox... انتظر`);

  for (let file of files) {
    try {
      const imageBuffer = fs.readFileSync(path.join(mediaFolder, file));
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', imageBuffer, file);

      const uploadResponse = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders()
      });

      if (uploadResponse.data.includes('https://')) {
        uploadedLinks.push(uploadResponse.data.trim());
      } else {
        console.log(`❌ فشل رفع الصورة: ${file}`);
      }
    } catch (e) {
      console.error(`❌ خطأ أثناء رفع الصورة: ${file}`, e);
    }
  }

  if (!uploadedLinks.length) return await m.reply('❌ فشل رفع جميع الصور.');

  // حفظ الروابط في ملف نصي
  fs.writeFileSync('./media-links.txt', uploadedLinks.join('\n'));

  await m.reply(`✅ تم رفع ${uploadedLinks.length} صورة.\nتم حفظ الروابط في ملف: media-links.txt`);
};

handler.command = /^(رفع-الصور)$/i;
handler.owner = true;  // خليه بس لصحاب البوت
export default handler;