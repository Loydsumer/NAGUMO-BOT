let handler = async (m, { conn, user }) => {

  const now       = Date.now()
  const lastDaily = user.lastDaily || 0
  const cooldown  = 24 * 60 * 60 * 1000 // 24 ساعة

  const remaining = cooldown - (now - lastDaily)

  if (remaining > 0 && lastDaily !== 0) {
    const hours   = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return m.reply([
      `⏳ *خدت مكافأتك اليومية بالفعل!*`,
      ``,
      `🕐 باقي: *${hours} ساعة و ${minutes} دقيقة*`,
      ``,
      `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    ].join('\n'))
  }

  // ━━━ حساب المكافأة ━━━
  const level  = user.level || 0
  const base   = 500
  const bonus  = level * 50
  const reward = base + bonus + Math.floor(Math.random() * 200)

  // ━━━ streak ━━━
  const lastDate  = new Date(lastDaily).toDateString()
  const todayDate = new Date(now).toDateString()
  const yesterday = new Date(now - 86400000).toDateString()

  if (lastDate === yesterday) {
    user.streak = (user.streak || 0) + 1
  } else {
    user.streak = 1
  }

  const streak      = user.streak || 1
  const streakBonus = streak >= 7 ? Math.floor(reward * 0.5) :
                      streak >= 3 ? Math.floor(reward * 0.2) : 0

  const total = reward + streakBonus

  // ━━━ أضف للمحفظة ━━━
  user.coin      = (user.coin || 0) + total
  user.lastDaily = now

  // ━━━ streak message ━━━
  let streakMsg = ''
  if (streak >= 7)      streakMsg = `🔥 *${streak} يوم متتالي! +${streakBonus} بونص!*`
  else if (streak >= 3) streakMsg = `✨ *${streak} أيام متتالية! +${streakBonus} بونص!*`
  else if (streak > 1)  streakMsg = `💪 *يوم ${streak} متتالي!*`

  await conn.sendMessage(m.chat, {
    text: [
      `🎁 *المكافأة اليومية*`,
      ``,
      `┌─────────────────────┐`,
      `│ 🪙 المكافأة : +${reward} عملة`,
      streakBonus ? `│ 🔥 بونص    : +${streakBonus} عملة` : '',
      `│ 💰 الإجمالي: +${total} عملة`,
      `│ 💎 رصيدك   : ${user.coin.toLocaleString()} عملة`,
      `└─────────────────────┘`,
      ``,
      streakMsg,
      ``,
      `⏰ تقدر تاخد مكافأتك بكره تاني!`,
      ``,
      `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    ].filter(l => l !== '').join('\n')
  }, { quoted: m })
}

handler.command = /^(يومي|daily|مكافأة_يومية)$/i
handler.help    = ['يومي']
handler.tags    = ['economy']

export default handler