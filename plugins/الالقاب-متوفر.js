const handler = async function(m, { conn, text }) {
  const groupId = m.chat;
  const name = text.trim();

  if (!name) throw '֎╎ادخل لقـب بشكـل صحيـح.';

  for (let key in global.db.data.users) {
    const user = global.db.data.users[key];
    // التحقق من أن اللقب مستخدم ضمن بيانات المجموعة الحالية
    if (user.groups && user.groups[groupId] && user.groups[groupId].name && 
        typeof user.groups[groupId].name === 'string' && 
        user.groups[groupId].name.toLowerCase() === name.toLowerCase()) {
      throw `֎╎لقـب \`${name}\` غيـر متـاح.`;
    }
  }

  await conn.reply(m.chat, `֎╎لقـب \`${name}\` مـتاح .`, m);
};

handler.admin = true;
handler.command = /^(متوفر|available)$/i;

export default handler;