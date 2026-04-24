import fetch from 'node-fetch';
import FormData from 'form-data';

// دالة اختصار الرابط
async function shortenLink(url) {
  let form = new FormData();
  form.append('c', url);
  let res = await fetch('https://fars.ee/u', { method: 'POST', body: form });
  let result = await res.text();
  let match = result.match(/url: (https:\/\/fars.ee\/\S+)/);
  return match ? match[1] : '🐦‍🔥 لم يتمكن من اختصار الرابط، حاول لاحقًا.';
}

// دالة إنشاء رابط من النص
async function createLink(text) {
  let form = new FormData();
  form.append('c', text);
  let res = await fetch('https://fars.ee/?u=1', { method: 'POST', body: form });
  let url = await res.text();
  return url.trim() || '🐦‍🔥 تعذر إنشاء الرابط، حاول لاحقًا.';
}

let handler = async (m, { conn, args, usedPrefix, command }) => {

  if (command === 'اختصار') {
    if (!args[0]) return m.reply(`🐦‍🔥 أين الرابط؟\n🔹 مثال: ${usedPrefix}اختصار https://google.com`);

    let url = args[0];
    if (!url.match(/^https?:\/\//)) url = 'https://' + url;

    try {
      let result = await shortenLink(url);
      await m.reply(result);
    } catch (e) {
      console.error(e);
      m.reply('🐦‍🔥 حدث خطأ، حاول لاحقًا.');
    }
  }

  if (command === 'انشاء') {
    if (!args[0]) return m.reply(`🐦‍🔥 أين النص؟\n🔹 مثال: ${usedPrefix}انشاء مرحبًا بالعالم`);

    let text = args.join(' ');

    try {
      let result = await createLink(text);
      await m.reply(result);
    } catch (e) {
      console.error(e);
      m.reply('🐦‍🔥 تعذر النشر، حاول لاحقًا.');
    }
  }
}

handler.help = ['اختصار <رابط>', 'انشاء <نص>'];
handler.command = ['اختصار', 'انشاء'];
handler.tags = ['tools'];
export default handler;