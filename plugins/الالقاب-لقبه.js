const handler = async function(m, { conn, text }) {
  let mentionedJid;

  if (m.quoted && m.quoted.sender) {
    // إذا كان هناك رد على رسالة
    mentionedJid = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid[0]) {
    // إذا كان هناك tag@
    mentionedJid = m.mentionedJid[0];
  } else {
    throw '֎╎يجـب توجيـه منشـن للعضـو الـذي تـريد معـرفة لقبـه أو الـرد علـى رسالتـه.';
  }

  const user = global.db.data.users[mentionedJid];
  const groupId = m.chat;

  // التحقق من وجود اللقب للمجموعة الحالية فقط
  if (!user || !user.groups || !user.groups[groupId] || !user.groups[groupId].name) {
    throw '֎╎لا يـوجد لقـب مسجـل لهـذا العضـو في هـذه المجموعـة.';
  }

  const nickname = user.groups[groupId].name;
  await conn.reply(m.chat, `֎╎لقـب العضـو هـو: \`${nickname}\``, m);
};

handler.command = /^(لقبه|nickname)$/i;

export default handler;