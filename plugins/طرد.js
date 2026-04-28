let handler = async (m, { conn, participants, isAdmin, isROwner }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')

  let who = null
  if (m.quoted) {
    who = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
  }

  if (!who) {
    react('❌')
    return m.reply('❌ رد على رسالة الشخص أو اعمل منشن @')
  }

  // ما تطردش نفسك أو البوت
  const botNumber = conn.user.jid || conn.user.id
  if (who === botNumber || who === botNumber.replace(/:\d+/, '')) {
    return m.reply('❌ مش هطرد نفسي 😤')
  }
  if (who === m.sender) {
    return m.reply('❌ مش هتطرد نفسك 😂')
  }

  try {
    await conn.sendMessage(m.chat, {
      text: '👋 تم طرد @' + who.split('@')[0] + ' ⚡',
      mentions: [who]
    }, { quoted: m })

    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    react('✅')
  } catch (e) {
    react('❌')
    m.reply('❌ فشل الطرد: ' + e.message)
  }
}

handler.help = ['طرد @']
handler.tags = ['group']
handler.command = /^(طرد|kick|remove|اطرد)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler