// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🧮 أمر Wolfram Alpha
//  🤖 𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch"

const WOLFRAM_APP_ID = "L9X4GE73LT"

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊'

  if (!text) {
    react('❌')
    return m.reply(
      '╔═══════════════════════════════╗\n' +
      '║     🧮 Wolfram Alpha 🧮     ║\n' +
      '╚═══════════════════════════════╝\n\n' +
      '⚡ الاستخدام:\n' +
      usedPrefix + command + ' <سؤال>\n\n' +
      '⚡ أمثلة:\n' +
      usedPrefix + command + ' 2+2\n' +
      usedPrefix + command + ' solve x^2 = 4\n' +
      usedPrefix + command + ' integrate x^2\n' +
      usedPrefix + command + ' 100 USD to EGP\n' +
      usedPrefix + command + ' mass of earth\n\n' +
      '> ⚡ ' + botName + ' ⚡'
    )
  }

  react('🧮')

  try {
    // ─── Short Answer API ───────────────
    const url = 'https://api.wolframalpha.com/v1/result?appid=' + WOLFRAM_APP_ID + '&i=' + encodeURIComponent(text)
    
    console.log('🧮 URL:', url)
    
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    console.log('🧮 Status:', res.status)

    if (res.status === 200) {
      const answer = await res.text()
      console.log('🧮 Answer:', answer)
      
      const caption = '╔═══════════════════════════════╗\n' +
        '║     🧮 Wolfram Alpha 🧮     ║\n' +
        '╚═══════════════════════════════╝\n\n' +
        '📝 *السؤال:*\n' + text + '\n\n' +
        '━━━「 الإجابة 」━━━\n\n' +
        '📊 ' + answer + '\n\n' +
        '> ⚡ ' + botName + ' ⚡'

      // صورة النتيجة
      const imgUrl = 'https://api.wolframalpha.com/v1/simple?appid=' + WOLFRAM_APP_ID + '&i=' + encodeURIComponent(text) + '&width=500'
      
      try {
        await conn.sendMessage(m.chat, {
          image: { url: imgUrl },
          caption: caption
        }, { quoted: m })
      } catch {
        await m.reply(caption)
      }

      react('✅')
      return
    }

    // ─── لو 501 = مش فاهم السؤال ────────
    if (res.status === 501) {
      react('❌')
      return m.reply('❌ Wolfram مش فاهم السؤال\n\n💡 جرب بالإنجليزي أو صيغة مختلفة')
    }

    // ─── لو 401 = مشكلة في الـ API ──────
    if (res.status === 401) {
      react('❌')
      return m.reply('❌ مشكلة في API Key')
    }

    // ─── أي خطأ تاني ────────────────────
    react('❌')
    m.reply('❌ فشل الطلب: ' + res.status)

  } catch (e) {
    console.error('❌ Wolfram Error:', e)
    react('❌')
    m.reply('❌ خطأ: ' + e.message)
  }
}

handler.help = ['ولفرام <سؤال>']
handler.tags = ['tools']
handler.command = /^(ولفرام|wolfram|حساب|calc|math)$/i

export default handler