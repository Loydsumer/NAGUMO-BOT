const groupLinkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
const channelLinkRegex = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i

const handler = {}

handler.before = async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) => {
  if (!m.isGroup) return

  const text = m.text || m.caption || ''
  if (!text) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  if (!chat.antilink) return

  const isGroupLink = groupLinkRegex.test(text)
  const isChannelLink = channelLinkRegex.test(text)

  if (!isGroupLink && !isChannelLink) return

  if (isGroupLink) {
    try {
      const ownLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
      if (text.includes(ownLink)) return
    } catch {}
  }

  const userPhone = m.sender.split('@')[0]
  const linkType = isChannelLink ? 'قناة' : 'مجموعة'

  if (isROwner || isOwner) {
    await conn.sendMessage(m.chat, {
      text: `╭──「 👑 مضاد الروابط 」──
│
│ ✨ أهلاً @${userPhone}
│ 🔗 تم اكتشاف رابط ${linkType}
│ 👑 أنت المطوّر، افعل ما تشاء!
│ 🚀 الرابط لن يُحذف لك أبداً
│
╰──────────────────`,
      mentions: [m.sender]
    }, { quoted: m })
    return
  }

  if (isAdmin) {
    await conn.sendMessage(m.chat, {
      text: `╭──「 🛡️ مضاد الروابط 」──
│
│ ✅ أهلاً @${userPhone}
│ 🔗 تم اكتشاف رابط ${linkType}
│ 🛡️ أنت مشرف، عادي لك!
│ 📌 الرابط محفوظ بدون حذف
│
╰──────────────────`,
      mentions: [m.sender]
    }, { quoted: m })
    return
  }

  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, {
      text: `╭──「 ⚠️ مضاد الروابط 」──
│
│ 🔗 تم اكتشاف رابط من @${userPhone}
│ ❗ لكنني لست مشرفاً
│ 🙏 لا أستطيع اتخاذ إجراء
│ 💡 رقّني مشرفاً لأعمل بشكل صحيح
│
╰──────────────────`,
      mentions: [m.sender]
    }, { quoted: m })
    return false
  }

  if (!global.db.data.chats[m.chat].antilinkWarns)
    global.db.data.chats[m.chat].antilinkWarns = {}

  const warns = global.db.data.chats[m.chat].antilinkWarns
  if (!warns[m.sender]) warns[m.sender] = 0
  warns[m.sender]++

  const warnCount = warns[m.sender]

  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    })
  } catch {}

  if (warnCount === 1) {
    await conn.sendMessage(m.chat, {
      text: `╭──「 🚫 مضاد الروابط 」──
│
│ ⚠️ تحذير أول لـ @${userPhone}
│ 🔗 نوع الرابط: ${linkType}
│ 📛 تم حذف الرسالة
│
│ ❗ التحذير القادم = طرد فوري
│
╰──────────────────`,
      mentions: [m.sender]
    }, { quoted: m })
  } else {
    warns[m.sender] = 0

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

      await conn.sendMessage(m.chat, {
        text: `╭──「 🚫 مضاد الروابط 」──
│
│ 🔴 تم طرد @${userPhone}
│ 🔗 نوع الرابط: ${linkType}
│ 📋 السبب: نشر رابط ${linkType} بعد التحذير
│
│ ✅ تمت العملية بنجاح
│
╰──────────────────`,
        mentions: [m.sender]
      })
    } catch {
      await conn.sendMessage(m.chat, {
        text: `⚠️ لم أتمكن من طرد @${userPhone}، تأكد من أن لدي صلاحية الطرد.`,
        mentions: [m.sender]
      })
    }
  }

  return false
}

export default handler
