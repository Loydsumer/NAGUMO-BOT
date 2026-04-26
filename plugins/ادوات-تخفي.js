let handler = async (m, { conn, isBotAdmin, usedPrefix, command }) => {
  try {
    if (!m.quoted) {
      return m.reply(
        `🧞‍♀️ *كيفية استخدام الأمر "${command}":*

🔹 *قم بالرد على وسائط (صورة، فيديو، صوت، ملصق، مستند) ثم أرسل الأمر "${command}".*
🔹 *سيقوم البوت بإعادة إرسال الوسائط بحيث يمكن عرضها مرة واحدة فقط ثم يحذف الأصلية تلقائيًا.*

📌 *مثال:*
1️⃣ *أرسل صورة أو فيديو في الدردشة.*
2️⃣ *قم بالرد على الصورة بكتابة:*
  \`${usedPrefix + command}\`
3️⃣ *سيجعلها الروبوت "عرض مرة واحدة" ثم يحذف النسخة الأصلية.*

ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`
      );
    }

    const mtype = m.quoted.mtype;
    const settings = {
      'audioMessage': { viewOnce: true },
      'videoMessage': { viewOnce: true },
      'imageMessage': { viewOnce: true },
      'stickerMessage': { isAvatar: true },
      'documentMessage': { viewOnce: true }
    };

    if (settings[mtype]) {
      let doc = m.quoted.mediaMessage;
      Object.assign(doc[mtype], settings[mtype]);
      await conn.relayMessage(m.chat, doc, { quoted: m });

      const sender = m.quoted.sender ? m.message.extendedTextMessage.contextInfo.participant : m.key.participant;
      const msgId = m.quoted.id ? m.message.extendedTextMessage.contextInfo.stanzaId : m.key.id;

      if (isBotAdmin) {
        return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: msgId, participant: sender }});
      } else {
        return conn.sendMessage(m.chat, { delete: m.quoted.vM.key });
      }
    } else {
      throw "🧞‍♀️ *نوع الوسائط غير مدعوم لهذا الأمر!*";
    }
  } catch {
    throw '🧞‍♀️ *حدث خطأ أثناء تنفيذ الأمر!*';
  }
};

handler.help = ['1time', 'تخفي', 'NaN'];
handler.tags = ['الأدوات'];
handler.command = /^(1time|تخفي|NaN)$/i;

export default handler;