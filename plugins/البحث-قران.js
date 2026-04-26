/*
YouTube Quran Player 🕋
تشغيل سور القرآن الكريم
*/

import yts from 'yt-search';
import axios from 'axios';

var handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `🕋 ❎ يرجى كتابة اسم السورة!\n\n📌 مثال:\n*${usedPrefix + command} سورة الكهف*`;

  await m.react('🔍');

  let res = await yts(`سورة ${text} بصوت جميل`);
  let vid = res.videos[0];

  try {
    const data = (await axios.get(`https://rayhanzuck-yt.hf.space/?url=${vid.url}&format=mp3&quality=128`)).data;
    if (!data.media) throw '🕋 ❎ حدث خطأ في API.';

    await conn.sendMessage(m.chat, {
      audio: { url: data.media },
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: vid.title,
          body: 'تلاوة مباركة من القرآن الكريم',
          mediaType: 2,
          mediaUrl: vid.url,
          thumbnailUrl: vid.thumbnail,
          sourceUrl: vid.url,
          containsAutoReply: true,
          renderLargerThumbnail: true,
          showAdAttribution: false,
        }
      }
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    await m.react('❌');
    throw `🕋 ❎ تعذر التحميل، حاول مرة أخرى.\nالخطأ: ${e.message}`;
  }
};

handler.before = async (m, { command, usedPrefix }) => {
  if (!m.text) {
    let example = `${usedPrefix + command} الكهف`;
    let msg = `🕋 طريقة الاستخدام:\nاكتب اسم السورة بعد الأمر لتشغيلها.\n\n📌 مثال:\n*${example}*\n\n📖 يتم التشغيل من اليوتيوب بصوت عذب.`;
    throw msg;
  }
};

handler.help = ['قران', 'القران', 'سورة', 'سوره'];
handler.command = /^قران|القران|سورة|سوره$/i;
handler.tags = ['religion'];
handler.limit = true;
export default handler;