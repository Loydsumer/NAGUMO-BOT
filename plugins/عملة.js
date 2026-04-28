let handler = async (m, { conn, text }) => {
  if (!text) return m.reply([
    `🪙 *محول العملات*`,
    ``,
    `مثال:`,
    `\`.عملة 100 USD EGP\``,
    `\`.عملة 50 EUR USD\``,
    `\`.عملة 1000 SAR EGP\``,
  ].join('\n'))

  const parts = text.trim().split(/\s+/)
  if (parts.length < 3) return m.reply('❌ الصيغة: `.عملة <مبلغ> <من> <إلى>`')

  const amount = parseFloat(parts[0])
  const from   = parts[1].toUpperCase()
  const to     = parts[2].toUpperCase()

  if (isNaN(amount) || amount <= 0) return m.reply('❌ المبلغ غير صحيح')

  await m.reply('⏳ جارٍ التحويل...')

  try {
    const res = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`
    )
    const data = await res.json()

    if (data.error || !data.rates) return m.reply(`❌ عملة "${from}" غير مدعومة`)
    if (!data.rates[to])           return m.reply(`❌ عملة "${to}" غير مدعومة`)

    const rate   = data.rates[to]
    const result = (amount * rate).toFixed(2)

    // أسماء العملات بالعربي
    const names = {
      USD: 'دولار أمريكي 🇺🇸',
      EGP: 'جنيه مصري 🇪🇬',
      SAR: 'ريال سعودي 🇸🇦',
      AED: 'درهم إماراتي 🇦🇪',
      EUR: 'يورو 🇪🇺',
      GBP: 'جنيه إسترليني 🇬🇧',
      KWD: 'دينار كويتي 🇰🇼',
      QAR: 'ريال قطري 🇶🇦',
      BHD: 'دينار بحريني 🇧🇭',
      OMR: 'ريال عماني 🇴🇲',
      JOD: 'دينار أردني 🇯🇴',
      MAD: 'درهم مغربي 🇲🇦',
      TRY: 'ليرة تركية 🇹🇷',
    }

    const fromName = names[from] || from
    const toName   = names[to]   || to

    await conn.sendMessage(m.chat, {
      text: [
        `🪙 *تحويل العملات*`,
        ``,
        `┌─────────────────────┐`,
        `│ 💵 ${amount} ${fromName}`,
        `│ ⬇️`,
        `│ 💰 ${result} ${toName}`,
        `└─────────────────────┘`,
        ``,
        `📊 سعر الصرف: 1 ${from} = ${rate.toFixed(4)} ${to}`,
        ``,
        `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
      ].join('\n')
    }, { quoted: m })

  } catch (e) {
    console.error('coin error:', e.message)
    m.reply('❌ فشل التحويل: ' + e.message)
  }
}

handler.command = /^(عملة|عمله|currency|coin|تحويل_عملة)$/i
handler.help    = ['عملة <مبلغ> <من> <إلى>']
handler.tags    = ['tools']

export default handler