let handler = async (m, { conn, participants }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')

  const botName = global.botName || '𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊'

  const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
  const members = participants.filter(p => !p.admin)

  let text = '╔═══════════════════════════════╗\n'
  text += '║     👥 أعضاء المجموعة 👥     ║\n'
  text += '╚═══════════════════════════════╝\n\n'
  text += '📊 المجموع: ' + participants.length + '\n'
  text += '👑 الأدمنية: ' + admins.length + '\n'
  text += '👤 الأعضاء: ' + members.length + '\n\n'

  text += '━━━「 👑 الأدمنية 」━━━\n\n'
  for (const admin of admins) {
    const role = admin.admin === 'superadmin' ? '🌟' : '👑'
    text += role + ' @' + admin.id.split('@')[0] + '\n'
  }

  text += '\n━━━「 👤 الأعضاء 」━━━\n\n'
  for (const member of members.slice(0, 50)) {
    text += '⚡ @' + member.id.split('@')[0] + '\n'
  }

  if (members.length > 50) {
    text += '\n... و ' + (members.length - 50) + ' عضو آخر'
  }

  text += '\n\n> ⚡ ' + botName + ' ⚡'

  react('👥')

  const mentions = participants.map(p => p.id)

  await conn.sendMessage(m.chat, {
    text: text,
    mentions: mentions
  }, { quoted: m })
}

handler.help = ['اعضاء']
handler.tags = ['group']
handler.command = /^(اعضاء|اعضا|members|listmembers)$/i
handler.group = true

export default handler