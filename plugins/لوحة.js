let handler = async (m, { conn, text }) => {

  const users = global.db.data.users
  if (!users || !Object.keys(users).length) return m.reply('❌ مفيش بيانات لحد لسه')

  // ━━━ نوع اللوحة ━━━
  const type = text?.trim() || 'coin'

  const types = {
    coin:  { label: '🪙 أغنى المستخدمين', key: 'coin' },
    exp:   { label: '⭐ أعلى XP',          key: 'exp'  },
    level: { label: '🏆 أعلى مستوى',       key: 'level'},
    cmds:  { label: '⚡ أكتر أوامر',        key: 'commands'},
  }

  const selected = types[type] || types['coin']

  // ترتيب المستخدمين
  const sorted = Object.entries(users)
    .map(([jid, u]) => ({ jid, ...u }))
    .filter(u => (u[selected.key] || 0) > 0)
    .sort((a, b) => (b[selected.key] || 0) - (a[selected.key] || 0))
    .slice(0, 10)

  if (!sorted.length) return m.reply('❌ مفيش بيانات كفاية لعرض اللوحة')

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

  const lines = [
    `🏆 *${selected.label}*`,
    ``,
  ]

  sorted.forEach((u, i) => {
    const name  = u.name || u.jid.split('@')[0]
    const value = (u[selected.key] || 0).toLocaleString()
    const unit  = selected.key === 'coin' ? ' 🪙' :
                  selected.key === 'exp'  ? ' XP' :
                  selected.key === 'level'? ' lvl' : ' cmd'
    lines.push(`${medals[i]} *${name}*`)
    lines.push(`    ↳ ${value}${unit}`)
  })

  // رتبة المستخدم نفسه
  const myRank = Object.entries(users)
    .map(([jid, u]) => ({ jid, val: u[selected.key] || 0 }))
    .sort((a, b) => b.val - a.val)
    .findIndex(u => u.jid === m.sender) + 1

  lines.push(``)
  lines.push(`📊 رتبتك: #${myRank}`)
  lines.push(``)
  lines.push(`📌 أنواع اللوحات:`)
  lines.push(`\`.لوحة coin\` | \`.لوحة exp\` | \`.لوحة level\` | \`.لوحة cmds\``)
  lines.push(``)
  lines.push(`> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`)

  await conn.sendMessage(m.chat, {
    text: lines.join('\n')
  }, { quoted: m })
}

handler.command = /^(لوحة|leaderboard|ترتيب|top)$/i
handler.help    = ['لوحة', 'لوحة coin|exp|level|cmds']
handler.tags    = ['economy']

export default handler