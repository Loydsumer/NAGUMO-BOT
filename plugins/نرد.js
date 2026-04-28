let handler = async (m, { conn }) => {
  // ━━━ رمي النرد ━━━
  const dice1 = Math.floor(Math.random() * 6) + 1
  const dice2 = Math.floor(Math.random() * 6) + 1
  const total = dice1 + dice2

  const faces = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' }

  // ━━━ تعليق حسب المجموع ━━━
  let comment
  if (total === 2)       comment = '💀 أقل رمية ممكنة!'
  else if (total === 12) comment = '🌟 أعلى رمية ممكنة!'
  else if (total >= 10)  comment = '🔥 رمية قوية!'
  else if (total >= 7)   comment = '😊 رمية كويسة'
  else if (total >= 5)   comment = '😐 رمية متوسطة'
  else                   comment = '😬 رمية ضعيفة'

  await conn.sendMessage(m.chat, {
    text: [
      `🎲 *النرد*`,
      ``,
      `${faces[dice1]}  ${faces[dice2]}`,
      ``,
      `🎯 النتيجة: *${dice1}* + *${dice2}* = *${total}*`,
      ``,
      `${comment}`,
      ``,
      `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    ].join('\n')
  }, { quoted: m })
}

handler.command = /^(نرد|dice|زهر)$/i
handler.help    = ['نرد']
handler.tags    = ['games']

export default handler