import axios from 'axios'
import { join } from 'path'
import { tmpdir } from 'os'
import { createWriteStream, unlinkSync, statSync } from 'fs'
import { pipeline } from 'stream/promises'
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const POLLINATIONS_KEY = 'pk_EsNR60VG0fSAwk9A'

const STYLES = {
  'انيمي':      { suffix: 'anime style, studio ghibli, detailed anime art',     emoji: '🌸' },
  'كرتون':      { suffix: 'cartoon style, pixar, vibrant colors',                emoji: '🎨' },
  'زيتي':       { suffix: 'oil painting, classical art, rich textures',          emoji: '🖼️' },
  'رسم_رصاص':   { suffix: 'pencil sketch, black and white, detailed drawing',    emoji: '✏️' },
  'ماء':        { suffix: 'watercolor painting, soft colors, artistic',          emoji: '💧' },
  'ثلاثي':      { suffix: '3D render, hyperrealistic, cinema 4D, octane render', emoji: '🎭' },
  'فانتازيا':   { suffix: 'fantasy art, magical, epic, concept art',             emoji: '🔮' },
  'سايبر':      { suffix: 'cyberpunk, neon lights, futuristic, dark atmosphere', emoji: '🌆' },
  'قديم':       { suffix: 'vintage, retro, old photo style, sepia',              emoji: '📷' },
  'ابيض_اسود':  { suffix: 'black and white, monochrome, artistic photography',   emoji: '⬛' },
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // ━━━ عرض قائمة الأستايلات بزراير ━━━
  if (!text) {
    const rows = Object.entries(STYLES).map(([key, val]) => ({
      title: `${val.emoji} ${key}`,
      description: val.suffix.slice(0, 30) + '...',
      id: `.رسم ${key} `
    }))

    try {
      const msg = generateWAMessageFromContent(m.chat, {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body:   { text: `🎨 *اختار الأستايل*\n\nاكتب: ${usedPrefix}${command} [أستايل] [الوصف]\n\nمثال: ${usedPrefix}${command} انيمي قطة في حديقة` },
          footer: { text: `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
          header: { hasMediaAttachment: false },
          nativeFlowMessage: {
            buttons: [{
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '🎨 اختار الأستايل',
                sections: [{ title: '🖌️ أستايلات الرسم', rows }]
              })
            }]
          }
        })
      }, { userJid: conn.user.jid, quoted: m })

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    } catch {
      const styleList = Object.entries(STYLES)
        .map(([k, v]) => `${v.emoji} \`${k}\``)
        .join(' • ')
      await m.reply([
        `🎨 *الأستايلات المتاحة:*`,
        ``,
        styleList,
        ``,
        `▸ ${usedPrefix}${command} [أستايل] [وصف]`,
        `▸ مثال: ${usedPrefix}${command} انيمي قطة لطيفة`,
      ].join('\n'))
    }
    return
  }

  // ━━━ استخرج الأستايل والوصف ━━━
  const parts  = text.trim().split(/\s+/)
  const styleKey = parts[0]?.toLowerCase()
  const style  = STYLES[styleKey]

  if (!style) {
    return m.reply([
      `❌ أستايل غير معروف: *${styleKey}*`,
      ``,
      `الأستايلات المتاحة:`,
      Object.entries(STYLES).map(([k, v]) => `${v.emoji} ${k}`).join(' • '),
      ``,
      `▸ مثال: ${usedPrefix}${command} انيمي قطة`
    ].join('\n'))
  }

  const prompt = parts.slice(1).join(' ')
  if (!prompt) return m.reply(`❌ اكتب الوصف بعد الأستايل\n▸ مثال: ${usedPrefix}${command} ${styleKey} قطة لطيفة`)

  await react('🎨')
  await m.reply(`${style.emoji} *جاري رسم الصورة...*\n🖌️ الأستايل: ${styleKey}\n⏳ انتظر قليلاً...`)

  try {
    // ترجمة للإنجليزية
    let englishText = prompt
    try {
      const trRes = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(prompt)}`,
        { timeout: 8000 }
      )
      const translated = trRes.data?.[0]?.map(x => x?.[0]).filter(Boolean).join('') || prompt
      if (translated) englishText = translated
    } catch {}

    const fullPrompt = `${englishText}, ${style.suffix}`
    const encoded    = encodeURIComponent(fullPrompt)
    const seed       = Math.floor(Math.random() * 999999)
    const imageUrl   = `https://gen.pollinations.ai/image/${encoded}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true`

    const filePath = join(tmpdir(), `yoru_art_${Date.now()}.jpg`)
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
      throw new Error('فشل الرسم — جرب وصف مختلف')
    }

    await conn.sendMessage(m.chat, {
      image: { url: filePath },
      caption: [
        `${style.emoji} *تم الرسم!*`,
        ``,
        `📝 *الوصف:* ${prompt}`,
        `🖌️ *الأستايل:* ${styleKey}`,
        ``,
        `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
      ].join('\n')
    }, { quoted: m })

    await react('✅')
    try { unlinkSync(filePath) } catch {}

  } catch (err) {
    await react('❌')
    console.error('art error:', err.message)
    m.reply(`❌ *فشل:* ${err.message}\n💡 جرب وصف بالإنجليزي`)
  }
}

handler.help    = ['فن [أستايل] [وصف]']
handler.tags    = ['ai']
handler.command = /^(فن|art|رسم|draw)$/i

export default handler