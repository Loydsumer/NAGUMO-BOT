import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { fileTypeFromBuffer } from 'file-type';

let handler = async (m, { conn, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '📌', key: m.key }});

  try {
    const q = m.quoted || m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
      return m.reply(`🤖 *طريقة استخدام الأمر:* ${command}\n\n📌 *الشرح:* قم بالرد على صورة مع كتابة الأمر.\n\n✍️ *مثال:* \n.${command} (رد على الصورة)\n\n🅾🅶🅰🅼🅸 🅱🅾🆃`);
    }

    const media = await q.download();
    if (!media) return m.reply('🤖 *تعذر تحميل الصورة، حاول إعادة إرسالها.*\n\n🅾🅶🅰🅼🅸 🅱🅾🆃');

    const url = await uploadPinterestStyle(media);
    if (!url) throw '🤖 *فشل رفع الصورة، حاول مرة أخرى لاحقًا.*\n\n🅾🅶🅰🅼🅸 🅱🅾🆃';

    await conn.sendMessage(m.chat, {
      text: `🤖 *تم رفع صورتك بنجاح!* 🤖\n\n📌 *الملف:* pinterest.jpg\n🔗 *الرابط:* ${url}\n\n🅾🅶🅰🅼🅸 🅱🅾🆃`,
      contextInfo: {
        externalAdReply: {
          title: '📌 رفع صور احترافي',
          body: '🤖 تم رفع صورتك بنجاح',
          thumbnailUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: url
        }
      }
    }, { quoted: m });

  } catch (e) {
    await m.reply(typeof e === 'string' ? e : '🤖 *حدث خطأ أثناء رفع الصورة.*\n\n🅾🅶🅰🅼🅸 🅱🅾🆃');
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '🌸', key: m.key }});
  }
};

handler.command = [
  'pinjpg', 'pinimg', 'imgp',
  'بين-رفع', 'رفع-بين'
];

handler.tags = ['tools'];
handler.register = true;

export default handler;

async function uploadPinterestStyle(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {};
  if (!ext || !mime) return null;

  const tempPath = join('./tmp', `pinterest.${ext}`);
  await writeFile(tempPath, buffer);
  const fileData = await readFile(tempPath);

  const form = new FormData();
  form.append('file', new File([fileData], `pinterest.jpg`, { type: mime }));

  try {
    const res = await fetch('https://cloudkuimages.guru/upload.php', {
      method: 'POST',
      body: form
    });
    const json = await res.json();
    await unlink(tempPath).catch(() => null);

    if (json?.status !== 'success' || !json?.data?.url)
      return null;

    return json.data.url;
  } catch (err) {
    console.error('🤖 خطأ في رفع الصورة:', err);
    await unlink(tempPath).catch(() => null);
    return null;
  }
}