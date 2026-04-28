import axios from 'axios'
import { join } from 'path'
import { tmpdir } from 'os'
import { createWriteStream, unlinkSync, statSync } from 'fs'
import { pipeline } from 'stream/promises'

const POLLINATIONS_KEY = 'pk_EsNR60VG0fSAwk9A'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!text) {
    await react('❌')
    return m.reply([
      `🖼️ *توليد صور بالذكاء الاصطناعي*`,
      ``,
      `▸ ${usedPrefix}${command} [وصف الصورة]`,
      ``,
      `*أمثلة:*`,
      `▸ ${usedPrefix}${command} قطة لطيفة في حديقة`,
      `▸ ${usedPrefix}${command} غروب الشمس على البحر`,
      `▸ ${usedPrefix}${command} مدينة مستقبلية`,
      ``,
      `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    ].join('\n'))
  }

  await react('🎨')
  await m.reply(`🎨 *جاري توليد الصورة...*\n⏳ انتظر قليلاً...`)

  try {
    // ━━━ ترجمة للإنجليزية ━━━
    let englishText = text
    try {
      const trRes = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`,
        { timeout: 8000 }
      )
      const translated = trRes.data?.[0]?.map(x => x?.[0]).filter(Boolean).join('') || text
      if (translated) englishText = translated
    } catch { englishText = text }

    const encoded  = encodeURIComponent(englishText + ', high quality, detailed')
    const seed     = Math.floor(Math.random() * 999999)
    const imageUrl = `https://gen.pollinations.ai/image/${encoded}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true`

    const filePath = join(tmpdir(), `yoru_img_${Date.now()}.jpg`)
    const imgRes   = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 120000,
      headers: {
        Authorization: `Bearer ${POLLINATIONS_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      }
    })
    await pipeline(imgRes.data, createWriteStream(filePath))

    const size = statSync(filePath).size
    if (size < 5000) {
      try { unlinkSync(filePath) } catch {}
      throw new Error('فشل توليد الصورة — جرب وصف مختلف')
    }

    await conn.sendMessage(m.chat, {
      image: { url: filePath },
      caption: [
        `🖼️ *تم توليد الصورة!*`,
        ``,
        `📝 *الوصف:* ${text}`,
        ``,
        `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
      ].join('\n')
    }, { quoted: m })

    await react('✅')
    try { unlinkSync(filePath) } catch {}

  } catch (err) {
    await react('❌')
    console.error('draw error:', err.message)
    m.reply(`❌ *فشل:* ${err.message}\n💡 جرب وصف بالإنجليزي مثل: cat in garden`)
  }
}

handler.help    = ['صورة', 'image']
handler.tags    = ['ai']
handler.command = /^(صورة|صوره|توليد|imagine|img|imag)$/i

export default handler