let handler = async (m, { conn }) => {
  try {
    await global.loading(m, conn);

    const apiUrl = 'https://api.nekolabs.my.id/tools/free-proxy';
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result || data.result.length === 0) {
      return m.reply('👻 لم أستطع جلب بيانات البروكسي الآن، تحلَّ بالصبر يا صديقي...');
    }

    let proxyList = `╭───〔 👻 قائمة بروكسيات مجانية 👻 〕───╮\n\n`;
    data.result.slice(0, 10).forEach((proxy, index) => {
      proxyList += `👻 *${index + 1}.*  
🌍 *العنوان:* ${proxy.ip}:${proxy.port}  
📍 *الدولة:* ${proxy.country} (${proxy.code})  
🕵️ *النوع:* ${proxy.anonymity}  
🔍 *جوجل:* ${proxy.google}  
🔒 *HTTPS:* ${proxy.https}  
⏰ *آخر تحديث:* ${proxy.last}\n`;
      proxyList += `━━━━━━━━━━━━━━━\n`;
    });

    proxyList += `\n👻 *إجمالي ما تم إيجاده:* ${data.result.length} بروكسي  
⚠️ استخدمها بحكمة كما يليق بعائلة كورليوني 🕴️  
\n✦ ƓȺⱮį 👻 βටͲ ✦ 👻`;

    await m.reply(proxyList);
  } catch (error) {
    console.error(error);
    m.reply('👻 حصل خطأ أثناء جلب بيانات البروكسي.');
  } finally {
    await global.loading(m, conn, true);
  }
};

handler.help = ['proxy', 'بروكسي'];
handler.command = /^(proxy|بروكسي)$/i;
handler.tags = ['tool'];
handler.limit = true;
handler.register = true;

export default handler;