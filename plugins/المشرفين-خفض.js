// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👻 أمر خفض/تنزيل المشرف 👻
// ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) 
    return conn.reply(m.chat, '👻 *هذا الأمر يعمل فقط داخل المجموعات!*', m);

  // 🧩 جلب بيانات المجموعة
  const groupMetadata = await conn.groupMetadata(m.chat);
  const sender = groupMetadata.participants.find(p => p.id === m.sender);

  // 🧩 تحقق من أن المستخدم أدمين أو المالك
  const isUserAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin' || m.sender === groupMetadata.owner;
  if (!isUserAdmin) 
    return conn.reply(m.chat, '👻 *لا يحق لك سحب السلطة، إلا إن كنت من العائلة الكبيرة.*', m);

  // 🧩 تحقق من أن البوت أدمين
  const bot = groupMetadata.participants.find(p => p.id === conn.user.jid);
  const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';
  if (!isBotAdmin) 
    return conn.reply(m.chat, '👻 *البوت ليس أدمين، لا أستطيع سحب السلطة هكذا.*', m);

  // 🧩 تحديد العضو المُراد خفضه
  let user;
  if (m.quoted) {
    user = m.quoted.sender;
  } else if (m.mentionedJid?.length) {
    user = m.mentionedJid[0];
  }

  // 📝 رسالة التوضيح
  if (!user) {
    const usageMsg = `
╭─⊰ 👻 *دليل استخدام الأمر* ⊱─
│
│ 📜 *الاستخدام الصحيح:*
│
│ 👻 *بالرد على رسالة العضو:*
│    ${usedPrefix}${command}
│
│ 🔫 *أو عبر المنشن:*
│    ${usedPrefix}${command} @رقم
│
│ ⚡ *الخفض يعني سحب صلاحيات الأدمين*
╰─⊰ ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻 ⊱─`;
    return conn.reply(m.chat, usageMsg, m);
  }

  // 🧩 محاولة تنفيذ الخفض
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'demote');

    const successMsg = `
╭─⊰ 👻 *تم خفض الرتبة بنجاح* ⊱─
│
│ 🎖️ *العضو:*
│    @${user.split('@')[0]}
│
│ 🔫 *بقرار من:*
│    @${m.sender.split('@')[0]}
│
│ ⚡ *السلطة سُحبت... العائلة لا ترحم.*
╰─⊰ ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻 ⊱─`;

    await conn.sendMessage(m.chat, { 
      text: successMsg, 
      mentions: [user, m.sender] 
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, 
`╭─⊰ 👻 *فشل في العملية* ⊱─
│
│ ❌ *السبب:* ${err?.message || 'خطأ غير معروف'}
│
│ ⚡ *تأكد أن البوت يملك صلاحيات الأدمين.*
╰─⊰ ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻 ⊱─`, m);
  }
};

// 📝 أوامر متاحة
handler.help = [
  'خفض [بالرد أو المنشن]',
  'تنزيل [بالرد أو المنشن]',
  'demote [بالرد أو المنشن]'
];
handler.tags = ['group'];
handler.command = /^(خفض|تنزيل|نزلو|demote|deadmin)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;