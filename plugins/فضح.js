import { exec } from 'child_process';
import { readFileSync as read, unlinkSync as remove, writeFileSync as create } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

let handler = async (m, { conn, command }) => {
   try {
      if (!m.quoted) return m.reply(`🚩 *قم بالرد على رسالة ViewOnce لاستخدام هذا الأمر.*`);
      await m.react('🕒');

      const type = m.quoted?.message ? Object.keys(m.quoted.message)?.[0] : m.quoted?.mimetype;

      let buffer;
      if (m.quoted?.message) {
         const q = m.quoted.message?.[type] || m.quoted;
         buffer = await conn.downloadMediaMessage(q);
      } else if (m.quoted && !m.quoted?.message) {
         buffer = await m.quoted.download();
      } else {
         return m.reply(`🚩 *لا يمكن معالجة الرسالة المحددة.*`);
      }

      if (/(image|video)/.test(type)) {
         await conn.sendFile(m.chat, buffer, '', m.quoted?.caption || '', m);
      } else if (/audio/.test(type)) {
         const tempInput = path.join(tmpdir(), `input_${Date.now()}.mp3`);
         const tempOutput = path.join(tmpdir(), `output_${Date.now()}.mp3`);
         create(tempInput, buffer);

         exec(`ffmpeg -i ${tempInput} -vn -ar 44100 -ac 2 -b:a 128k ${tempOutput}`, async (err) => {
            remove(tempInput);
            if (err) {
               console.error(err);
               return m.reply(`🚩 *فشل التحويل.*`);
            }
            const resultBuffer = read(tempOutput);
            await conn.sendFile(m.chat, resultBuffer, 'audio.mp3', '', m);
            remove(tempOutput);
         });
      } else {
         m.reply(`🚩 *هذا النوع من الرسائل غير مدعوم.*`);
      }
   } catch (e) {
      console.error(e);
      await m.reply(`⚠️ *حدث خطأ:*\n${e.message}`);
   }
};

handler.help = ['rvo'].map(v => v + ' <رد على رسالة ViewOnce>');
handler.tags = ['group'];
handler.command = /^فضح$/i;
handler.admin = true
export default handler;