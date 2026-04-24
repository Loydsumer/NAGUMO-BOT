import fs from 'fs/promises';
import path from 'path';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const folder = './plugins';
  const oldNames = [
    '⏤͟͞ू⃪ 𝐅υׁׅ𝐫𝐢𝐧𝐚-𝐁ׅ𝗼𝐭🌸⃝𖤐',
  ]; 
  const newName = '⏤͟͞ू⃪ 𝐅υׁׅ𝐫𝐢𝐧𝐚-𝐁ׅ𝗼𝐭🌸⃝𖤐';

  let count = 0;

  const files = (await fs.readdir(folder)).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(folder, file);
    const content = await fs.readFile(filePath, 'utf8');
    let replaced = content;

    for (const name of oldNames) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape special chars
      const regex = new RegExp(escaped, 'giu'); // unicode + global + ignoreCase
      replaced = replaced.replace(regex, newName);
    }

    if (replaced !== content) {
      await fs.writeFile(filePath, replaced, 'utf8');
      count++;
    }
  }

  await m.reply(`✅ تم استبدال الأسماء في ${count} ملف${count !== 1 ? 'ات' : ''}.`);
};

handler.help = ['fixname'];
handler.tags = ['tools'];
handler.command = ['fixname', 'تغير'];

export default handler;