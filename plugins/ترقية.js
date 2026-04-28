let handler = async (m, { conn, isAdmin, isROwner, isBotAdmin }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ هذا الأمر للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')
  if (!isBotAdmin) return m.reply('❌ لازم البوت يكون أدمن')

  let who = null

  // 1. رد على رسالة
  if (m.quoted) {
    who = m.quoted.sender
  }

  // 2. منشن من m.mentionedJid
  if (!who) {
    const mentioned = await m.mentionedJid
    if (Array.isArray(mentioned) && mentioned[0]) {
      who = mentioned[0]
    }
  }

  // 3. استخرج الرقم من النص مباشرة @201xxxxxxxx
  if (!who && m.text) {
    const match = m.text.match(/@(\d{6,15})/)
    if (match) who = match[1] + '@s.whatsapp.net'
  }

  if (!who) {
    react('❌')
    return m.reply('❌ رد على رسالة الشخص أو اعمل منشن @')
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    react('✅')
    await conn.sendMessage(m.chat, {
      text: `✅ تم ترقية @${who.split('@')[0]} لأدمن ⚡`,
      mentions: [who]
    }, { quoted: m })
  } catch (e) {
    react('❌')
    m.reply('❌ فشل الترقية: ' + e.message)
  }
}

handler.help     = ['ترقية @']
handler.tags     = ['group']
handler.command  = /^(ترقية|ترقيه|promote|رفع)$/i
handler.group    = true
handler.admin    = true
handler.botAdmin = true

export default handler