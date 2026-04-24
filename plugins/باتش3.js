import cp, {exec as _exec} from 'child_process';
import {promisify} from 'util';
import fs from 'fs';
import path from 'path';

const exec = promisify(_exec).bind(cp);

const handler = async (m, {conn, isROwner, usedPrefix, command, text}) => {
  if (!text) return m.reply('╭──────────────────╮\n│ الرجاء إدخال كلمة للبحث عنها.\n╰──────────────────╯');

  const pluginDir = './plugins'; // مسار ملفات الإضافات
  const files = fs.readdirSync(pluginDir).filter((file) => file.endsWith('.js'));
  const matchedFiles = [];

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(pluginDir, file), 'utf8');
    if (content.includes(text)) {
      matchedFiles.push(file.replace('.js', ''));
    }
  });

  if (matchedFiles.length === 0) {
    return m.reply(`╭──────────────────╮\n│ لا توجد ملفات تحتوي على "${text}".\n╰──────────────────╯`);
  }

  let message = `╭──────────────────╮\n│ الملفات التي تحتوي على "${text}":\n╰──────────────────╯\n\n`;
  message += matchedFiles.map((file, index) => `│ [${index + 1}] ${file}`).join('\n');
  message += '\n╰──────────────────╯';

  return m.reply(message);
};

handler.help = ['باتش3'].map((v) => v + ' *<كلمة>*');
handler.tags = ['owner'];
handler.command = /^(باتش3)$/i;
handler.owner = true;

export default handler;