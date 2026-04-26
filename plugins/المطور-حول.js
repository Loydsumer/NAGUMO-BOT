const handler = async (m, { conn, isOwner, text }) => {
  if (!isOwner) {
    return conn.sendMessage(m.chat, { text: "❪🚫❫⇇ *الأمر مخصص للمطور فقط* ⇇❪🚫❫" }, { quoted: m });
  }

  const allGroups = Object.keys(conn.chats).filter(id => id.endsWith('@g.us'));

  if (allGroups.length === 0) {
    return conn.sendMessage(m.chat, { text: "❪ℹ️❫⇇ *البوت ليس في أي جروب حالياً* ⇇❪ℹ️❫" }, { quoted: m });
  }

  if (!text && !m.quoted) {
    return conn.sendMessage(m.chat, { text: "❪❓❫⇇ *استخدم:*\n`.حول <النص>` أو بالرد على رسالة" }, { quoted: m });
  }

  // رياكشن أولي (بحث)
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  for (let group of allGroups) {
    try {
      const metadata = await conn.groupMetadata(group);
      const participants = metadata.participants.map(p => p.id);

      if (m.quoted) {
        // نسخ الرسالة بالكامل (سواء نص أو ميديا)
        await conn.copyNForward(group, m.quoted, true, {
          mentions: participants
        });
      } else if (text) {
        // إرسال نص مخصص
        const caption = `❪📢❫⇇ *رسالة عامة من المطور* ⇇❪📢❫
⧈═━━━━━✦📢✦━━━━━═⧈
${text}
⧈═━━━━━✦📢✦━━━━━═⧈`;

        await conn.sendMessage(group, {
          text: caption,
          mentions: participants
        });
      }
    } catch (e) {
      console.error(`فشل الإرسال إلى ${group}:`, e);
    }
  }

  // رياكشن عند الانتهاء (صح ✅)
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  await conn.sendMessage(m.chat, { text: `❪✅❫⇇ *تم إرسال الرسالة إلى ${allGroups.length} جروب* ⇇❪✅❫` }, { quoted: m });
};

handler.command = /^حول$/i;
handler.owner = true;
export default handler;