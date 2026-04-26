import fs from 'fs';
import path from 'path';

const allowedNumbers = [
  '201115546207@s.whatsapp.net',
  '963969829657@s.whatsapp.net'
];

const handler2 = async (m, { conn, text }) => {
  const emoji = '👻';
  const signature = 'ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻';

  if (!allowedNumbers.includes(m.sender)) {
    await conn.sendMessage(m.chat, { text: `${emoji} ❌ غير مسموح لك باستخدام هذا الأمر.\n\n${signature}` }, { quoted: m });
    return;
  }

  if (!text || !text.includes('|')) {
    await conn.sendMessage(m.chat, { 
      text: `${emoji} ⚠️ يرجى كتابة الأمر بالشكل التالي:\n\n*.بدل2 اسم_الملف.js|الكلمة_القديمة|الكلمة_الجديدة*\n\n${signature}` 
    }, { quoted: m });
    return;
  }

  // تقسيم النص: [الملف, الكلمة القديمة, الكلمة الجديدة]
  const [fileName, oldWord, newWord] = text.split('|').map(s => s.trim());

  if (!fileName || !oldWord || !newWord) {
    await conn.sendMessage(m.chat, { 
      text: `${emoji} ⚠️ تأكد من إدخال البيانات بشكل صحيح:\n\n*.بدل2 اسم_الملف.js|الكلمة_القديمة|الكلمة_الجديدة*\n\n${signature}` 
    }, { quoted: m });
    return;
  }

  const filePath = path.join('plugins', fileName);

  try {
    if (!fs.existsSync(filePath)) {
      await conn.sendMessage(m.chat, { text: `${emoji} ❌ الملف غير موجود: ${fileName}` }, { quoted: m });
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(oldWord)) {
      const newContent = content.split(oldWord).join(newWord);
      fs.writeFileSync(filePath, newContent, 'utf-8');
      await conn.sendMessage(m.chat, { 
        text: `${emoji} ✅ تم استبدال "${oldWord}" بـ "${newWord}" في الملف: ${fileName}` 
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { text: `${emoji} ⚠️ الكلمة "${oldWord}" غير موجودة في الملف: ${fileName}` }, { quoted: m });
    }
  } catch (err) {
    await conn.sendMessage(m.chat, { 
      text: `${emoji} ❌ حدث خطأ أثناء تبديل الملف: ${fileName}\nالسبب: ${err.message}` 
    }, { quoted: m });
  }
};

handler2.command = /^بدل2$/i; 
handler2.owner = true;
handler2.tags = ['owner'];
handler2.help = ['بدل2 *<اسم_ملف.js>|<قديم>|<جديد>*'];

export default handler2;