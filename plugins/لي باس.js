const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`✳️ الاستخدام:\n${usedPrefix + command} النص`);

  try {
    const base64 = Buffer.from(text, 'utf-8').toString('base64');
    return m.reply(`${base64}`);
  } catch (e) {
    return m.reply(`❌ خطا اثناء التحويل الي باس: ${e.message}`);
  }
};

handler.help = ['tobase64']
handler.tags = ['tools']
handler.command = ['لي باس']
handler.register = true
handler.limit = 1

export default handler