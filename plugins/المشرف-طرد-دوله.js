let handler = async (m, { conn, text, participants, isBotAdmin, isAdmin }) => {
  if (!m.isGroup) return m.reply('❗ هذا الأمر للجروبات فقط!');
  if (!isAdmin) return m.reply('🚫 هذا الأمر خاص بالمشرفين!');
  if (!isBotAdmin) return m.reply('⚠️ البوت يحتاج يكون مشرف لطرد الأعضاء!');
  if (!text) return m.reply('💬 اكتب كود الدولة، مثال: .طرد-دوله 212');

  let code = text.trim();
  if (isNaN(code)) return m.reply('❗ كود الدولة يجب أن يكون رقم فقط');

  let toKick = participants
    .filter(u => u.id.startsWith(code) && u.id !== m.sender && !u.admin)
    .map(u => u.id);

  if (!toKick.length) return m.reply(`😅 لا يوجد أعضاء بكود الدولة ${code}`);

  await m.reply(`🚫 سيتم طرد ${toKick.length} عضو/أعضاء يبدأ رقمهم بـ +${code}`);

  for (let num of toKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [num], "remove");
      await new Promise(resolve => setTimeout(resolve, 1500)); // تأخير بسيط بين كل طرد
    } catch (e) {
      console.log('فشل طرد:', num, e);
    }
  }

  m.reply(`✅ تم الانتهاء من محاولة الطرد.`);

};
handler.command = /^طرد-دوله$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;