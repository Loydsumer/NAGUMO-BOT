let handler = async (m, { conn, text, user }) => {

  // ━━━ استخرج المنشن والمبلغ ━━━
  const mentioned = await m.mentionedJid
  const target    = Array.isArray(mentioned) && mentioned[0] ? mentioned[0] : null

  if (!target) return m.reply([
    `💸 *طريقة الاستخدام:*`,
    ``,
    `\`.تحويل @شخص مبلغ\``,
    `مثال: \`.تحويل @فلان 500\``,
  ].join('\n'))

  // استخرج المبلغ من النص
  const amountMatch = text?.replace(/@\d+/g, '').trim().match(/\d+/)
  const amount      = amountMatch ? parseInt(amountMatch[0]) : 0

  if (!amount || amount <= 0) return m.reply('❌ اكتب مبلغ صحيح')
  if (amount < 10)            return m.reply('❌ الحد الأدنى للتحويل 10 عملات')

  if (target === m.sender) return m.reply('❌ مش هتحول لنفسك 😂')

  // تحقق من الرصيد
  const senderCoin = user.coin || 0
  if (senderCoin < amount) {
    return m.reply([
      `❌ رصيدك مش كفاية!`,
      `💰 رصيدك: ${senderCoin} عملة`,
      `💸 المطلوب: ${amount} عملة`,
    ].join('\n'))
  }

  // تأكد إن المستلم موجود في DB
  if (!global.db.data.users[target]) {
    global.db.data.users[target] = {
      coin: 0, bank: 0, exp: 0, level: 0
    }
  }

  // ━━━ رسوم التحويل 2% ━━━
  const fee     = Math.max(1, Math.floor(amount * 0.02))
  const netAmount = amount - fee

  // نفذ التحويل
  user.coin                             -= amount
  global.db.data.users[target].coin    += netAmount

  const targetName = target.split('@')[0]

  await conn.sendMessage(m.chat, {
    text: [
      `💸 *تم التحويل بنجاح!*`,
      ``,
      `┌─────────────────────┐`,
      `│ 👤 إلى    : @${targetName}`,
      `│ 💰 المبلغ : ${amount} عملة`,
      `│ 💸 الرسوم : ${fee} عملة (2%)`,
      `│ ✅ وصل له : ${netAmount} عملة`,
      `│ 🪙 رصيدك  : ${user.coin} عملة`,
      `└─────────────────────┘`,
      ``,
      `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    ].join('\n'),
    mentions: [target]
  }, { quoted: m })
}

handler.command = /^(تحويل|transfer|حول)$/i
handler.help    = ['تحويل @شخص مبلغ']
handler.tags    = ['economy']

export default handler