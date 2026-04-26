const handler = async function(m, { conn }) {
  const groupId = m.chat;
  const user = global.db.data.users[m.sender];

  // التحقق من تسجيل العضو في المجموعة الحالية
  if (!user || !user.groups || !user.groups[groupId] || !user.groups[groupId].name) {
    throw '֎╎أنـت غيـر مسجـل في هـذه المجموعـة.';
  }

  // استرجاع اللقب من بيانات المجموعة المحددة
  const nickname = user.groups[groupId].name;
  
  await conn.reply(m.chat, `֎╎لقبـك هـو : \`${nickname}\``, m);
};

handler.command = /^(لقبي|mynickname)$/i;

export default handler;