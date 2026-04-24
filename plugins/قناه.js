import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('الرجاء إدخال رابط القناة.');
  if (!text.includes('https://whatsapp.com/channel/')) return m.reply('رابط غير صحيح.');

  let result = text.split('https://whatsapp.com/channel/')[1];
  let channelId = result.split('/')[0];


  let res;
  try {
    res = await conn.newsletterMetadata('invite', channelId); 
  } catch (error) {
    console.error("Error fetching channel metadata:", error); 
    return m.reply('حدث خطأ أثناء جلب بيانات القناة. تأكد من صحة الرابط.');
  }


  let timestamp = new Date().getTime();
  let formattedTime = new Date(timestamp).toLocaleString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  let teks = `
╭━〔 *معلومات القناة* 〕━⬣
┃ 🆔 *ID:* ${res.id}
┃ 🧣 *الاسم:* ${res.name}
┃ 🕓 *وقت جلب المعلومات:* ${formattedTime}
┃ 👤 *عدد المشتركين:* ${res.subscribers}
┃ 🚦 *الحالة:* ${res.state}
┃ ✅ *التحقق:* ${res.verification === 'VERIFIED' ? 'مُحققة' : 'غير مُحققة'}
╰━━━━━━〔〕━━━⬣
`.trim();

  await m.reply(teks);
};

handler.help = handler.command = ['قناه'];
handler.tags = ['tools'];

export default handler;