let handler = async (m, { conn }) => {
  const sender = m.sender
  const today  = new Date().toISOString().slice(0, 10) // 2026-03-13

  // ━━━ الحظ ثابت لنفس الشخص في نفس اليوم ━━━
  // بنعمل seed من رقم المستخدم + التاريخ
  const seed = [...(sender + today)].reduce((a, c) => a + c.charCodeAt(0), 0)
  const luck = seed % 101 // 0 → 100

  // ━━━ تحديد الرسالة حسب النسبة ━━━
  let emoji, title, msg

  if (luck >= 90) {
    emoji = '🌟'; title = 'حظ أسطوري!'
    msg = 'النهارده يومك يا بطل — كل حاجة هتنجح!'
  } else if (luck >= 75) {
    emoji = '✨'; title = 'حظ ممتاز!'
    msg = 'يوم مباركك — استغله كويس!'
  } else if (luck >= 60) {
    emoji = '😊'; title = 'حظ كويس'
    msg = 'يومك حلو، بس ركز شوية!'
  } else if (luck >= 45) {
    emoji = '😐'; title = 'حظ عادي'
    msg = 'يوم عادي زي أي يوم — مفيش لا كويس ولا وحش!'
  } else if (luck >= 30) {
    emoji = '😕'; title = 'حظ أقل من المتوسط'
    msg = 'خلي بالك من نفسك النهارده!'
  } else if (luck >= 15) {
    emoji = '😟'; title = 'حظ وحش'
    msg = 'النهارده مش يومك — تعامل بحذر!'
  } else {
    emoji = '💀'; title = 'حظ أسود!'
    msg = 'النهارده ابعد عن المشاكل خالص 😂'
  }

  // ━━━ شريط الحظ ━━━
  const filled = Math.round(luck / 10)
  const bar    = '█'.repeat(filled) + '░'.repeat(10 - filled)

  await conn.sendMessage(m.chat, {
    text: [
      `${emoji} *حظك النهارده*`,
      ``,
      `👤 ${m.pushName || 'المستخدم'}`,
      `📅 ${today}`,
      ``,
      `┌─────────────────────┐`,
      `│ ${bar} │`,
      `│       ${String(luck).padStart(2, '0')}%            │`,
      `└─────────────────────┘`,
      ``,
      `⚡ *${title}*`,
      `📝 ${msg}`,
      ``,
      `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    ].join('\n')
  }, { quoted: m })
}

handler.command = /^(حظ|luck|حظي)$/i
handler.help    = ['حظ']
handler.tags    = ['games']

export default handler