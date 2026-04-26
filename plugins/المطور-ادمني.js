const handler = async (m, { conn, isAdmin, text }) => {
  // قائمة المطورين الافتراضية
  let developers = [
    ['963969829657', true], // المطور الأساسي
    ['201115546207', true]  // المطور الثاني المضاف
  ];
  let developerNumbers = developers.map(([id]) => id + '@s.whatsapp.net');

  // التأكد من أن البوت أدمين
  if (!m.isGroup) return;
  const groupMetadata = await conn.groupMetadata(m.chat);
  const bot = groupMetadata.participants.find(p => p.id === conn.user.jid);
  const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';
  if (!isBotAdmin) return m.reply('👻┇ البوت يحتاج لصلاحيات أدمين لتنفيذ هذا الأمر.');

  if (m.fromMe) return;

  // دالة لتغليف النصوص بالزخرفة
  const fancy = (text) => {
    return `*~⌝˼※⪤˹͟͞≽━┈⌯⧽°⸂◞👻◜⸃°⧼⌯┈━≼˹͟͞⪤※˹⌞~*\n${text}\n*~⌝˼※⪤˹͟͞≽━┈⌯⧽°⸂◞👻◜⸃°⧼⌯┈━≼˹͟͞⪤※˹⌞~*`;
  };

  if (text && text === 'المطورين') {
    if (developerNumbers.length === 0) return m.reply(fancy('👻┇ لم يتم العثور على أي مطورين.'));

    try {
      let addedCount = 0;
      let promotedCount = 0;
      
      for (let developerId of developerNumbers) {
        try {
          // التحقق إذا كان المطور موجود بالفعل في المجموعة
          const existingParticipant = groupMetadata.participants.find(p => p.id === developerId);
          
          if (!existingParticipant) {
            // إضافة المطور إذا لم يكن موجوداً
            await conn.groupParticipantsUpdate(m.chat, [developerId], 'add');
            addedCount++;
            await new Promise(resolve => setTimeout(resolve, 2000)); // تأخير بين الإضافات
          }
          
          // ترقية المطور إلى مشرف
          await conn.groupParticipantsUpdate(m.chat, [developerId], 'promote');
          promotedCount++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // تأخير بين الترقيات
          
        } catch (devError) {
          console.error(`خطأ في معالجة المطور ${developerId}:`, devError);
        }
      }
      
      let resultMessage = '';
      if (addedCount > 0 && promotedCount > 0) {
        resultMessage = `✅┇ تم إضافة ${addedCount} مطور وترقية ${promotedCount} مشرف بنجاح.`;
      } else if (promotedCount > 0) {
        resultMessage = `✅┇ تم ترقية ${promotedCount} مطور إلى مشرف بنجاح.`;
      } else {
        resultMessage = '⚠️┇ جميع المطورين مشرفين بالفعل في المجموعة.';
      }
      
      await m.reply(fancy(resultMessage));
      
    } catch (err) {
      console.error(err);
      await m.reply(fancy('❌ حدث خطأ أثناء محاولة إضافة المطورين.'));
    }
    return;
  } else {
    if (isAdmin) return m.reply(fancy('👻┇أنت مشرف بالفعل.'));

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
      await m.reply(fancy('✅┇ تمت ترقيتك إلى مشرف في المجموعة بنجاح.'));
    } catch (err) {
      console.error(err);
      await m.reply(fancy('❌ حدث خطأ أثناء محاولة ترقيتك. تأكد أن البوت أدمين.'));
    }
  }
};

handler.command = /^ادمني$/i;
handler.rowner = true; // فقط المطورين الأساسيين
handler.group = true;
handler.botAdmin = true;

export default handler;