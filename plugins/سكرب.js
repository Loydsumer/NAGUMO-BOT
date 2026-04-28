import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!text) {
    await react('❌')
    return m.reply(`⚔️ *استخدام:*\n${usedPrefix}${command} [رابط]`)
  }

  let url = text.trim()
  if (!url.startsWith('http')) url = 'https://' + url

  try { new URL(url) } catch {
    await react('❌')
    return m.reply('❌ الرابط مش صحيح!')
  }

  await react('⏳')
  await m.reply('⏳ جاري جلب كود الموقع...')

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxRedirects: 5,
      validateStatus: (s) => s < 400,
    })

    const html = String(response.data)
    const sizeKB = (html.length / 1024).toFixed(1)

    await conn.sendMessage(m.chat, {
      document: Buffer.from(html, 'utf-8'),
      mimetype: 'text/plain',
      fileName: `source_${Date.now()}.txt`,
      caption: `✅ *كود المصدر*\n🌐 ${url}\n📦 ${sizeKB} KB\n✅ Status: ${response.status}`
    }, { quoted: m })

    await react('⚡')

  } catch (e) {
    await react('❌')
    await m.reply('❌ ' + (e.message || 'خطأ غير معروف'))
  }
}

handler.help = ['سكرب']
handler.tags = ['tools']
handler.command = /^(سكرب|scrape|موقع)$/i

export default handler