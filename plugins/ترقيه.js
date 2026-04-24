let handler = async (m, { conn, text, usedPrefix, isAdmin, isOwner, command }) => {
  if (!isAdmin && !isOwner) 
    return conn.reply(m.chat, '*╮──────────────────⟢ـ*\n*❐↞┇✦ هذا الأمر مخصص للمشرفين فقط ↞*\n*╯──────────────────⟢ـ*', m);

  let user;

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    user = m.mentionedJid[0]; // منشن
  } else if (m.quoted) {
    user = m.quoted.sender; // رد
  } else if (text) {
    let number = text.replace(/[^0-9]/g, '');
    if (number.length < 11 || number.length > 13) {
      return conn.reply(m.chat, '*╮──────────────────⟢ـ*\n*❐↞┇✦ الرقم غير صحيح، الرجاء إدخال رقم صالح ↞*\n*╯──────────────────⟢ـ*', m);
    }
    user = number + '@s.whatsapp.net';
  } else {
    return conn.reply(m.chat, `*╮──────────────────⟢ـ*\n*❐↞┇✦ الرجاء منشن الشخص أولاً ↞*\n*❯ مثال:*\n> ${usedPrefix}ترقيه @منشن\n> ${usedPrefix}اعفاء @منشن\n*╯──────────────────⟢ـ*`, m);
  }

  try {
    if (command.match(/^(ترقيه|رفع|ارفع)$/i)) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
      await conn.sendMessage(m.chat, {
        text: `*╮──────────────────⟢ـ*\n*❐↞┇✅ تم ترقية *@${user.split('@')[0]}* إلى مشرف ↞*\n*❐↞┇✦ 𝐅υׁׅ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭 دائماً بالخدمة ↞*\n*╯──────────────────⟢ـ*`,
        mentions: [user]
      }, { quoted: m });
    } else if (command.match(/^(demote|اعفاء)$/i)) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
      await conn.sendMessage(m.chat, {
        text: `*╮──────────────────⟢ـ*\n*❐↞┇✅ تم إعفاء *@${user.split('@')[0]}* من الإدارة ↞*\n*❐↞┇✦ 𝐅υׁׅ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭 دائماً بالخدمة ↞*\n*╯──────────────────⟢ـ*`,
        mentions: [user]
      }, { quoted: m });
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '*╮──────────────────⟢ـ*\n*❐↞┇⚠️ حدث خطأ أثناء تنفيذ العملية ↞*\n*╯──────────────────⟢ـ*', m);
  }
};

handler.help = ['ترقيه @منشن', 'اعفاء @منشن'];
handler.tags = ['group'];
handler.command = ['ترقيه','رفع','ارفع','demote','اعفاء']; 
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;