import axios from 'axios'

async function searchDDG(query) {
  const res = await axios.get('https://html.duckduckgo.com/html/', {
    params: { q: query, kl: 'ar-ar' },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
      'Accept-Language': 'ar,en;q=0.9',
    },
    timeout: 20000
  })

  const html = res.data

  // استخرج النتائج من HTML بـ regex بسيط
  const results = []
  const titleReg  = /<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/gi
  const snippetReg = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi

  let tMatch, sMatch
  while ((tMatch = titleReg.exec(html)) && results.length < 3) {
    sMatch = snippetReg.exec(html)
    const title   = tMatch[1].replace(/<[^>]+>/g, '').trim()
    const snippet = sMatch ? sMatch[1].replace(/<[^>]+>/g, '').trim() : ''
    if (title) results.push({ title, snippet })
  }

  return results
}

let handler = async (m, { conn, text }) => {
  if (!text?.trim()) return m.reply([
    `🔍 *اكتب الكلمة اللي تدور عليها*`,
    `مثال: \`.بحث واتساب\``,
  ].join('\n'))

  await m.reply('🔍 جارٍ البحث...')

  const query = text.trim()

  try {
    const results = await searchDDG(query)

    if (!results.length) {
      return m.reply([
        `😕 مش لاقي نتيجة لـ: *${query}*`,
        `🌐 https://www.google.com/search?q=${encodeURIComponent(query)}`,
      ].join('\n'))
    }

    const lines = [
      `🔍 *نتائج البحث: ${query}*`,
      ``,
    ]

    results.forEach((r, i) => {
      lines.push(`${i + 1}️⃣ *${r.title}*`)
      if (r.snippet) lines.push(`📝 ${r.snippet}`)
      lines.push('')
    })

    lines.push(`🌐 https://www.google.com/search?q=${encodeURIComponent(query)}`)
    lines.push(``, `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`)

    await conn.sendMessage(m.chat, {
      text: lines.join('\n')
    }, { quoted: m })

  } catch (e) {
    console.error('search error:', e.message)
    m.reply([
      `❌ فشل البحث — جرب على Google:`,
      `🌐 https://www.google.com/search?q=${encodeURIComponent(query)}`,
    ].join('\n'))
  }
}

handler.command = /^(بحث|search|ابحث)$/i
handler.help    = ['بحث <كلمة>']
handler.tags    = ['tools']

export default handler