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
    return conn.sendMessage(m.chat, { text: "❪❓❫⇇ *منشن العضو أو رد على رسالته لإعطائه إنذار* ⇇❪❓❫" }, { quoted: m });
  }

  // قاعدة بيانات المستخدمين
  let user = global.db.data.users[target];
  if (!user) global.db.data.users[target] = { warn: 0 };

  // إضافة إنذار
  global.db.data.users[target].warn = (global.db.data.users[target].warn || 0) + 1;

  // تجهيز الرسالة
  const warns = global.db.data.users[target].warn;
  const caption = `❪🚨❫⇇ *تم إعطاء إنذار* ⇇❪🚨❫
⧈═━━━━━✦🚨✦━━━━━═⧈ 
❪👤❫⇇ *المستخدم* ⇇❪@${target.split`@`[0]}❫
❪⚠️❫⇇ *عدد الإنذارات* ⇇❪${warns}/3❫
⧈═━━━━━✦🚨✦━━━━━═⧈`;

  // رياكشن
  await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });

  // إرسال الإنذار
  await conn.sendMessage(
    m.chat,
    { text: caption, mentions: [target] },
    { quoted: m }
  );

  // إذا وصل 3 إنذارات يتم طرده
  if (warns >= 3) {
    await conn.sendMessage(m.chat, { text: `❪⛔❫⇇ *تم طرد العضو لتجاوزه 3 إنذارات* ⇇❪⛔❫`, mentions: [target] }, { quoted: m });
    await conn.groupParticipantsUpdate(m.chat, [target], "remove");
    global.db.data.users[target].warn = 0; // تصفير الإنذارات بعد الطرد
  }
};

handler.command = /^انذار$/i;
handler.group = true;
handler.admin = true;
export default handler;