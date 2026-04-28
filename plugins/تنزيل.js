let handler = async (m, { conn, isAdmin, isROwner, isBotAdmin }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')
  if (!isBotAdmin) return m.reply('❌ لازم البوت يكون أدمن')

  let who = null

  // 1. رد على رسالة
  if (m.quoted) {
    who = m.quoted.sender
  }

  // 2. منشن
  if (!who) {
    const mentioned = await m.mentionedJid
    if (Array.isArray(mentioned) && mentioned[0]) {
      who = mentioned[0]
    }
  }

  // 3. fallback — رقم من النص
  if (!who && m.text) {
    const match = m.text.match(/@(\d{6,15})/)
    if (match) who = match[1] + '@s.whatsapp.net'
  }

  if (!who) {
    react('❌')
    return m.reply('❌ رد على رسالة الشخص أو اعمل منشن @')
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
    react('✅')
    await conn.sendMessage(m.chat, {
      text: `✅ تم إزالة الأدمن من @${who.split('@')[0]} ⚡`,
      mentions: [who]
    }, { quoted: m })
  } catch (e) {
    react('❌')
    m.reply('❌ فشل: ' + e.message)
  }
}

handler.help     = ['تنزيل @']
handler.tags     = ['group']
handler.command  = /^(تنزيل|تنزل|demote)$/i
handler.group    = true
handler.admin    = true
handler.botAdmin = true

export default handler