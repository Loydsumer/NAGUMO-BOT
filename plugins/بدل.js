import fs from 'fs/promises';
import path from 'path';

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('✖ استخدم الصيغة: .بدل الكلمه_القديمه|الكلمه_الجديدة');

  // تفصل الكلمة القديمة والجديدة بحذر
  const parts = text.split('|').map(p => p.trim());
  if (parts.length !== 2) return m.reply('✖ تأكد من كتابة الكلمة القديمة والجديدة مفصولتين بـ |');

  const [oldWord, newWord] = parts;
  if (!oldWord || !newWord) return m.reply('✖ الكلمة القديمة أو الجديدة فارغة!');

  const folder = './plugins';
  let count = 0;

  // زخارف شائعة للكلمة القديمة (إنجليزية أو عربية)
  const fancyVariants = [
    oldWord.toUpperCase(),           // الإنجليزية كبيرة
    oldWord.split('').map(c => c + '\u0301').join(''), // زخرفة بسيطة
  ];

  const files = (await fs.readdir(folder)).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(folder, file);
    let content = await fs.readFile(filePath, 'utf8');
    let replaced = content;

    const allOlds = [oldWord, ...fancyVariants];

    for (const name of allOlds) {
      const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(escaped, 'giu'); // g: كل التطابقات, i: تجاهل الحالة, u: يدعم يونيكود
      replaced = replaced.replace(regex, newWord);
    }

    if (replaced !== content) {
      await fs.writeFile(filePath, replaced, 'utf8');
      count++;
    }
  }

  await m.reply(`✅ تم استبدال "${oldWord}" بـ "${newWord}" في ${count} ملف${count !== 1 ? 'ات' : ''}.`);
};

handler.help = ['fixname'];
handler.tags = ['tools'];
handler.command = ['تبديل', 'بدل'];
handler.owner = true; 
export default handler;