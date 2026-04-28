let handler = async (m, { conn, isAdmin, isROwner }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')

  try {
    const code = await conn.groupInviteCode(m.chat)
    react('🔗')
    await m.reply(
      '╔═══════════════════════════════╗\n' +
      '║     🔗 رابط المجموعة 🔗     ║\n' +
      '╚═══════════════════════════════╝\n\n' +
      '⚡ https://chat.whatsapp.com/' + code + '\n\n' +
      '> ⚡ ' + (global.botName || '𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊') + ' ⚡'
    )
  } catch (e) {
    react('❌')
    m.reply('❌ فشل جلب الرابط: ' + e.message)
  }
}

handler.help = ['رابط']
handler.tags = ['group']
handler.command = /^(رابط|link|لينك)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler