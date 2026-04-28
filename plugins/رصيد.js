let handler = async (m, { conn, user }) => {

  // لو منشن — اعرض رصيد الشخص ده
  const mentioned = await m.mentionedJid
  let target = m.sender
  let targetUser = user
  let targetName = m.pushName || m.sender.split('@')[0]

  if (Array.isArray(mentioned) && mentioned[0]) {
    target     = mentioned[0]
    targetUser = global.db.data.users[target]
    targetName = target.split('@')[0]
  }

  if (!targetUser) return m.reply('❌ المستخدم مش موجود في قاعدة البيانات')

  const coin  = targetUser.coin  || 0
  const bank  = targetUser.bank  || 0
  const total = coin + bank
  const level = targetUser.level || 0
  const exp   = targetUser.exp   || 0

  // شريط الـ XP
  const xpNeeded = (level + 1) * 100
  const xpPct    = Math.min(Math.round((exp % xpNeeded) / xpNeeded * 10), 10)
  const xpBar    = '█'.repeat(xpPct) + '░'.repeat(10 - xpPct)

  await conn.sendMessage(m.chat, {
    text: [
      `💰 *رصيد ${targetName}*`,
      ``,
      `┌─────────────────────┐`,
      `│ 🪙 المحفظة : ${coin.toLocaleString()} عملة`,
      `│ 🏦 البنك   : ${bank.toLocaleString()} عملة`,
      `│ 💎 الإجمالي: ${total.toLocaleString()} عملة`,
      `└─────────────────────┘`,
      ``,
      `⭐ المستوى : ${level}`,
      `✨ XP      : ${xpBar} ${exp}`,
      ``,
      `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    ].join('\n'),
    mentions: Array.isArray(mentioned) && mentioned[0] ? [target] : []
  }, { quoted: m })
}

handler.command = /^(رصيد|balance|محفظة)$/i
handler.help    = ['رصيد', 'رصيد @']
handler.tags    = ['economy']

export default handler