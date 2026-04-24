import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const handler = async (m, { conn }) => {
  const pluginDir = './plugins';
  const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));

  if (files.length === 0) return m.reply('🧞 لا يوجد أي بلوجنات للتنفيذ.');

  m.reply(`🧞 جاري تحميل وتشغيل ${files.length} بلوجن...\n`);

  for (const file of files) {
    const fullPath = path.join(pluginDir, file);
    try {
      const plugin = await import(path.resolve(fullPath));
      
      if (plugin?.default?.handler) {
        // شغل handler لو موجود وفيه تنفيذ فعلي (تقدر تخصصه أكثر)
        await plugin.default.handler(m, { conn, text: '', usedPrefix: '', command: '' });
        m.reply(`✅ تم تنفيذ البلوجن: ${file}`);
      } else {
        console.log(chalk.yellow(`⚠️ لا يوجد handler في ${file}`));
      }
    } catch (e) {
      m.reply(`❌ خطأ في تشغيل البلوجن ${file}:\n${e.message}`);
    }
  }

  m.reply('🧞 انتهى تنفيذ جميع البلوجنز.');
};

handler.help = ['تشغيل_الكل'];
handler.command = ['فحص'];
handler.tags = ['tools'];

export default handler;