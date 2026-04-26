// قائمة الأرقام المسموح لها بالتنفيذ
const allowedNumbers = [
    '201226033056@s.whatsapp.net', // الرقم الأول
    '201115546207@s.whatsapp.net'  // الرقم الثاني
];

let handler = async (m, { conn, text, isOwner, command }) => {
  // تحقق من إذن المستخدم
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply(`❌ 🤖 عذراً، ليس لديك صلاحية لاستخدام هذا الأمر 🤖`);
  }

  // تأكد من وجود رابط
  if (!text) {
    return m.reply(`🤖 *طريقة استخدام الأمر ${command}*\n` +
                   `🔗 أرسل رابط دعوة صالح للبوت للانضمام إلى المجموعة.\n\n` +
                   `💡 مثال:\n${command} https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXXXX\n\n` +
                   `🅾🅶🅰🅼🅸 🅱🅾🆃`);
  }

  // تحقق من صحة رابط الدعوة
  let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
  let match = text.match(linkRegex);
  if (!match) {
    return m.reply(`🤖 الرابط غير صالح، يرجى إرسال رابط دعوة واتساب صحيح.\n\n` +
                   `🅾🅶🅰🅼🅸 🅱🅾🆃`);
  }

  let code = match[1];

  if (isOwner) {
    try {
      await conn.groupAcceptInvite(code);
      
      // إرسال فيديو ترحيبي عند الانضمام
      let videoUrl = 'https://qu.ax/wGDKA.mp4';
      let caption = `🤖 تم تسجيل دخول *ڤيتو كورليوني* إلى المجموعة.\n\n أوقفوا الكلام، الزعيم هنا 🤖🔥`;
      
      // الحصول على آيدي المجموعة بعد الانضمام
      let groupMetadata = await conn.groupGetInviteInfo(code);
      let groupId = groupMetadata.id;

      await conn.sendMessage(groupId, {
        video: { url: videoUrl },
        caption: caption
      });

      return m.reply(`✅ 🤖 تم الانضمام للمجموعة وإرسال فيديو الترحيب 🤖`);
    } catch (e) {
      return m.reply(`❌ 🤖 حدث خطأ أثناء الانضمام للمجموعة، حاول مرة أخرى.\n${e.message}\n🤖`);
    }
  } else {
    // إذا لم يكن مالكاً، يتم إرسال الدعوة للمالك
    let ownerJid = '201226033056@s.whatsapp.net'; // غيّرها للمالك المناسب
    let message = `🤖 تم استلام دعوة انضمام لمجموعة:\n${text}\n\nمرسل بواسطة: @${m.sender.split('@')[0]} 🤖`;
    await conn.sendMessage(ownerJid, { text: message, mentions: [m.sender] }, { quoted: m });
    return m.reply(`✅ 🤖 تم إرسال رابط الدعوة إلى المطور، شكراً لدعوتك! 🤖`);
  }
};

handler.help = ['انضم', 'invite'];
handler.tags = ['owner', 'tools'];
handler.command = /^(انضم|invite)$/i;

export default handler;