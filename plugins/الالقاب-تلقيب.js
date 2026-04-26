import { createHash } from 'crypto';

const Reg = /(?:@([^\s]+))\s*(.*)/i;

const handler = async function(m, { conn, text, usedPrefix, command }) {
  let mentionedJid;
  let name;

  if (m.quoted && m.quoted.sender) {
    // إذا كان هناك رد على رسالة
    mentionedJid = m.quoted.sender;
    name = text.trim();
  } else if (Reg.test(text)) {
    // إذا كان هناك tag@
    mentionedJid = text.match(Reg)[1] + '@s.whatsapp.net';
    name = text.match(Reg)[2].trim();
  } else {
    throw `֎╎الاستخـدام الصحيـح.☁️\n\n${usedPrefix + command} @منشـن العضـو لقـب أو الـرد علـى رسالـة العضـو مـع كتـابة لقـب.`;
  }

  if (!mentionedJid) throw '֎╎يجـب توجيـه منشـن للعضـو الـذي تـريد تسجيلـه أو الـرد علـى رسالتـه.';

  let user = global.db.data.users[mentionedJid] || {};
  const groupId = m.chat;

  if (!name) throw '֎╎أدخـل لقـب بشكـل صحيـح.';

  if (user.groups && user.groups[groupId] && user.groups[groupId].name) {
    throw '֎╎هـاذا العضـو مسجـل بلفعـل.';
  }

  // تحقق من عدم تكرار اللقب في نفس المجموعة
  for (let key in global.db.data.users) {
    if (global.db.data.users[key].groups && global.db.data.users[key].groups[groupId] &&
        global.db.data.users[key].groups[groupId].name &&
        global.db.data.users[key].groups[groupId].name.toLowerCase() === name.toLowerCase()) {
      throw '֎╎هـاذا لقـب تـم استخدامـه بلفعـل في هـذه المجموعـة.';
    }
  }

  // إعداد بيانات المستخدم في المجموعة
  if (!user.groups) user.groups = {};
  user.groups[groupId] = { name, regTime: +new Date(), registered: true };

  // حفظ التغييرات في قاعدة البيانات
  global.db.data.users[mentionedJid] = user;

  // إنشاء رقم تسلسلي فريد باستخدام MD5
  const sn = createHash('md5').update(m.sender).digest('hex');
  const caption = `֎╎تـم تسجيـل لقـب : \`${name}\``;
  
  await conn.reply(m.chat, caption, m);
};

handler.admin = true;
handler.group = true;
handler.botAdmin = true;
handler.command = /^(تلقيب|register)$/i;

export default handler;