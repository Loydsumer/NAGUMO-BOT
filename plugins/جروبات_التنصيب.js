let handler = async (m, { conn, usedPrefix, text }) => {
  try {
    // لو تستخدم نظام multi-bot، يكون عندك conn.botList أو global.conns
    const botList = global.conns && global.conns.length > 0 ? global.conns : [conn];

    if (!botList.length) return m.reply('⚠️ لا يوجد بوتات فرعية نشطة حالياً.');

    let finalText = '📊 *قائمة الجروبات التي فيها البوتات مشرفين:*\n\n';
    let totalGroups = 0;

    for (let bot of botList) {
      const botNumber = bot.user?.jid?.split('@')[0] || 'غير معروف';
      const groups = Object.values(await bot.groupFetchAllParticipating());

      let count = 0;
      let botText = `🤖 *البوت ${botNumber}:*\n`;

      for (let [jid, group] of Object.entries(groups)) {
        const participants = group.participants || [];
        const self = participants.find(p => p.id === bot.user.jid);
        const isAdmin = self?.admin === 'admin' || self?.admin === 'superadmin';

        if (isAdmin) {
          count++;
          totalGroups++;
          let invite = '❌ لا يمكن جلب الرابط.';
          try {
            const code = await bot.groupInviteCode(jid);
            invite = `https://chat.whatsapp.com/${code}`;
          } catch {}

          botText += `\n📍 *${group.subject}*\n👥 الأعضاء: ${group.participants.length}\n🔗 الرابط: ${invite}\n`;
        }
      }

      if (count === 0) botText += `\n⚠️ هذا البوت ليس مشرفاً في أي جروب.\n`;
      botText += '\n━━━━━━━━━━━━━━\n';
      finalText += botText;
    }

    finalText = `📋 *إجمالي الجروبات التي البوتات فيها مشرفين:* ${totalGroups}\n\n` + finalText;

    await m.reply(finalText);

  } catch (e) {
    console.error(e);
    m.reply('❌ حدث خطأ أثناء جلب الجروبات من البوتات الفرعية.');
  }
};

handler.help = ['جروبات_البوتات'];
handler.tags = ['owner'];
handler.command = /^(جروباتالبوتات|جروبات_التنصيب|botgroups)$/i;
handler.owner = true;

export default handler;