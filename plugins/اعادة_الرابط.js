let handler = async (m, { conn, args, isAdmin, isROwner }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')

  try {
    const code = await conn.groupRevokeInvite(m.chat)
    react('🔄')
    await m.reply(
      '🔄 تم إعادة تعيين رابط المجموعة\n\n' +
      '⚡ الرابط الجديد:\nhttps://chat.whatsapp.com/' + code + '\n\n' +
      '> ⚡ ' + (global.botName || '𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊') + ' ⚡'
    )
  } catch (e) {
    react('❌')
    m.reply('❌ فشل: ' + e.message)
  }
}

handler.help = ['اعادة_الرابط']
handler.tags = ['group']
handler.command = /^(اعادة_الرابط|اعادةالرابط|resetlink|رابط_جديد)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler