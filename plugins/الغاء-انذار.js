const handler = async (m, { conn, isOwner, isAdmin }) => {
  // التأكد أن اللي نفذ الأمر مشرف أو مطور
  if (!isOwner && !isAdmin) {
    return conn.sendMessage(m.chat, { text: "❪🚫❫⇇ *الأمر مخصص للمشرفين فقط* ⇇❪🚫❫" }, { quoted: m });
  }

  // تحديد العضو (منشن أو رد)
  let target;
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    target = m.mentionedJid[0];
  } else if (m.quoted) {
    target = m.quoted.sender;
  } else {
    return conn.sendMessage(m.chat, { text: "❪❓❫⇇ *منشن العضو أو رد على رسالته لإلغاء إنذار* ⇇❪❓❫" }, { quoted: m });
  }

  // قاعدة بيانات المستخدمين
  let user = global.db.data.users[target];
  if (!user) global.db.data.users[target] = { warn: 0 };

  // تقليل الإنذار
  if ((global.db.data.users[target].warn || 0) > 0) {
    global.db.data.users[target].warn -= 1;
  } else {
    return conn.sendMessage(m.chat, { text: `❪ℹ️❫⇇ *@${target.split`@`[0]} لا يملك أي إنذارات لإلغائها* ⇇❪ℹ️❫`, mentions: [target] }, { quoted: m });
  }

  // تجهيز الرسالة
  const warns = global.db.data.users[target].warn;
  const caption = `❪✅❫⇇ *تم إلغاء إنذار* ⇇❪✅❫
⧈═━━━━━✦✅✦━━━━━═⧈ 
❪👤❫⇇ *المستخدم* ⇇❪@${target.split`@`[0]}❫
❪⚠️❫⇇ *عدد الإنذارات المتبقية* ⇇❪${warns}/3❫
⧈═━━━━━✦✅✦━━━━━═⧈`;

  // رياكشن
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  // إرسال النتيجة
  await conn.sendMessage(
    m.chat,
    { text: caption, mentions: [target] },
    { quoted: m }
  );
};

handler.command = /^الغاء-انذار$/i;
handler.group = true;
handler.admin = true;
export default handler;