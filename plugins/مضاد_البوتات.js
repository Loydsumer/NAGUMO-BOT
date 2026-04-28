import fs from 'fs';

const detectedBots = {};
const antibotPath = './data/antibot.json';

if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}
if (!fs.existsSync(antibotPath)) {
  fs.writeFileSync(antibotPath, JSON.stringify({}, null, 2));
}

let handler = async (m, { conn, args, usedPrefix, command }) => {

  if (!m.isGroup) return m.reply('❌ هذا الأمر للمجموعات فقط!');

  let chatId = m.chat;
  let antibott = {};
  try {
    antibott = JSON.parse(fs.readFileSync(antibotPath));
  } catch {
    antibott = {};
  }
  let antibot = antibott[chatId] === true;

  if (args[0] === "اون" || args[0] === "on") {
    if (antibot) return m.reply(`╭─── ⚠️ ───╮\n│  مضاد البوتات مفعل   │\n│    بالفعل في الجروب!    │\n╰──────────╯`);

    antibott[chatId] = true;
    fs.writeFileSync(antibotPath, JSON.stringify(antibott, null, 2));
    await m.reply(`╭━━━━━━━━━━━━━━━━━━━╮\n┃  🛡️ *مضاد البوتات*\n┃━━━━━━━━━━━━━━━━━━━\n┃  ✅ تم التفعيل بنجاح!\n┃\n┃  📌 *المعلومات:*\n┃  ├ 🔍 الكشف: بصمة الرسالة\n┃  ├ ⚡ السرعة: فوري\n┃  ├ 🎯 الدقة: 95%+\n┃  └ 🦶 الإجراء: طرد تلقائي\n┃\n┃  ⚠️ *تنبيه مهم:*\n┃  إذا كان لديك بوت آخر في\n┃  الجروب، اجعله أدمن حتى\n┃  لا يتم طرده!\n╰━━━━━━━━━━━━━━━━━━━╯`);
    return;
  }

  else if (args[0] === "اوف" || args[0] === "off") {
    if (!antibot) return m.reply(`╭─── ⚠️ ───╮\n│  مضاد البوتات معطل    │\n│    بالفعل في الجروب!    │\n╰──────────╯`);

    delete antibott[chatId];
    fs.writeFileSync(antibotPath, JSON.stringify(antibott, null, 2));
    await m.reply(`╭━━━━━━━━━━━━━━━━━━━╮\n┃  🛡️ *مضاد البوتات*\n┃━━━━━━━━━━━━━━━━━━━\n┃  ❌ تم التعطيل بنجاح!\n┃\n┃  ⚠️ البوتات الآن تقدر\n┃  تدخل وتشتغل عادي\n╰━━━━━━━━━━━━━━━━━━━╯`);
    return;
  }

  else {
    let status = antibot ? '✅ مفعل' : '❌ معطل';
    let statusEmoji = antibot ? '🟢' : '🔴';
    await m.reply(`╭━━━━━━━━━━━━━━━━━━━━╮\n┃   🛡️ *مضاد البوتات*\n┃━━━━━━━━━━━━━━━━━━━━\n┃\n┃  ${statusEmoji} *الحالة:* ${status}\n┃\n┃  ⚡ *الأوامر المتاحة:*\n┃  ├ ${usedPrefix + command} اون\n┃  └ ${usedPrefix + command} اوف\n╰━━━━━━━━━━━━━━━━━━━━╯`);
  }
};

handler.before = async function (m, { conn, participants }) {
  try {
    if (!m.isGroup) return false;

    let chatId = m.chat;
    let senderId = m.sender;

    let antibott = {};
    try {
      antibott = JSON.parse(fs.readFileSync(antibotPath));
    } catch { return false; }

    if (antibott[chatId] !== true) return false;

    let msgId = m.key?.id || m.id || '';

    let isBot = false;
    let botType = '';

    if (/^3EB0/.test(msgId) && msgId.length < 25)   { isBot = true; botType = 'Baileys'; }
    if (/^BAE5/.test(msgId) && msgId.length === 16)  { isBot = true; botType = 'Baileys v2'; }
    if (/^B24E/.test(msgId) && msgId.length === 20)  { isBot = true; botType = 'Baileys v3'; }
    if (/^8SCO/.test(msgId) && msgId.length === 20)  { isBot = true; botType = 'Baileys v4'; }
    if (msgId.startsWith('NJX-'))                    { isBot = true; botType = 'NJX Bot'; }

    if (!isBot) return false;
    if (m.key.fromMe) return false;

    let senderNum = senderId.split('@')[0].split(':')[0];

    // فحص الأدمن من participants
    if (participants && participants.length > 0) {
      for (let p of participants) {
        if (!p.admin) continue;
        let pJid = p.jid || p.id || '';
        let pNum = pJid.split('@')[0].split(':')[0];
        if (pNum === senderNum || pJid === senderId || pJid.includes(senderNum) || senderId.includes(pNum)) {
          return false;
        }
      }
    }

    // فحص من groupMetadata مباشرة
    try {
      let groupMeta = await conn.groupMetadata(chatId);
      if (groupMeta?.participants) {
        for (let p of groupMeta.participants) {
          if (!p.admin) continue;
          let pJid = p.jid || p.id || '';
          let pNum = pJid.split('@')[0].split(':')[0];
          if (pNum === senderNum || pJid === senderId || senderId.includes(pNum)) return false;
        }
      }
    } catch {}

    if (!detectedBots[chatId]) detectedBots[chatId] = [];
    if (detectedBots[chatId].includes(senderId)) return false;
    detectedBots[chatId].push(senderId);

    await conn.sendMessage(chatId, {
      text: `╭━━━━━━━━━━━━━━━━━━━╮\n┃  🚨 *تم اكتشاف بوت!*\n┃━━━━━━━━━━━━━━━━━━━\n┃\n┃  👤 *الرقم:* @${senderNum}\n┃  🔍 *النوع:* ${botType}\n┃  🆔 *البصمة:* ${msgId.substring(0, 10)}...\n┃\n┃  🦶 *الإجراء:* جاري الطرد...\n╰━━━━━━━━━━━━━━━━━━━╯`,
      mentions: [senderId]
    });

    try {
      await conn.groupParticipantsUpdate(chatId, [senderId], "remove");
      await conn.sendMessage(chatId, {
        text: `╭━━━━━━━━━━━━━━━━━━━╮\n┃  ✅ *تم الطرد بنجاح!*\n┃━━━━━━━━━━━━━━━━━━━\n┃\n┃  🤖 البوت @${senderNum}\n┃  تم طرده من الجروب\n┃\n┃  🛡️ مضاد البوتات يحميكم\n╰━━━━━━━━━━━━━━━━━━━╯`,
        mentions: [senderId]
      });
    } catch {
      await conn.sendMessage(chatId, {
        text: `╭━━━━━━━━━━━━━━━━━━━╮\n┃  ❌ *فشل الطرد!*\n┃━━━━━━━━━━━━━━━━━━━\n┃\n┃  🤖 اكتشفت بوت @${senderNum}\n┃  لكن مقدرتش أطرده!\n┃\n┃  ⚠️ خليني أدمن عشان أطرد\n╰━━━━━━━━━━━━━━━━━━━╯`,
        mentions: [senderId]
      });
    }

    setTimeout(() => {
      if (detectedBots[chatId]) {
        const i = detectedBots[chatId].indexOf(senderId);
        if (i > -1) detectedBots[chatId].splice(i, 1);
      }
    }, 10000);

    return false;

  } catch (e) {
    console.log('antibot error:', e);
    return false;
  }
};

handler.command = /^(مضاد_البوتات|antibot|نوبوت|مضاد)$/i;
handler.tags = ['group'];
handler.group = true;

export default handler;