const handler = async (m, { conn }) => {
  let name = '𝑮𝒊𝒕𝒐';
  let number = '201115546207'; // بدون @ أو أي رمز

  // إنشاء بطاقة الاتصال (vCard)
  let vcard = `
BEGIN:VCARD
VERSION:3.0
N:${name}
FN:${name}
TEL;type=CELL;type=VOICE;waid=${number}:${number}
END:VCARD
`.trim();

  // إرسال بطاقة الاتصال
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: name,
      contacts: [{ vcard }],
    },
  }, { quoted: m });

  // إرسال رسالة تعريفية إضافية
  await conn.sendMessage(m.chat, {
    text: `
━━ 👑 👻 منشئ البوت 👻 👑 ━━

📛 الاسم: ${name} 👻
📞 الرقم: wa.me/${number} 👻
🛠️ المشروع: بوت واتساب من الصفر 👻

📬 يمكنك مراسلته إذا كنت تحتاج مساعدة أو دعم فني 👻

✦ ƓȺⱮį 👻 βටͲ ✦ 👻
`.trim()
  }, { quoted: m });
};

handler.help = ['creador'];
handler.tags = ['info'];
handler.command = ['creador', 'owner', 'creator'];
export default handler;