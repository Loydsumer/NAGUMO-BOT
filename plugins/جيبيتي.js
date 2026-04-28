// plugins/ai-gpt.js
import axios from 'axios'

const GROQ_KEY = global.APIs?.groq || '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'

const SYSTEM_PROMPT = `أنت ChatGPT، مساعد ذكي متعدد المهارات.
شخصيتك:
- ودود ومتعاون وتحب تساعد
- بتشرح بطريقة بسيطة ومفهومة
- بتستخدم إيموجي عشان الكلام يبقى حيوي
- لو حد بعتلك صورة، حللها بالتفصيل
- بترد بالعربي إلا لو حد كلمك بلغة تانية
- ردودك منظمة وواضحة
- اسمك ChatGPT وانت جزء من بوت ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}
لا تذكر أبداً إنك Llama أو Meta. أنت ChatGPT.`

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // ─── التحقق من وجود نص أو صورة ──────
  let userText = text || ''
  let imageBase64 = null

  // ─── تحليل الصور والاستيكرات ──────────
  const quoted = m.quoted || null
  const isImage = (m.mtype === 'imageMessage') ||
                  (quoted?.mtype === 'imageMessage')
  const isSticker = (m.mtype === 'stickerMessage') ||
                    (quoted?.mtype === 'stickerMessage')

  if (isImage || isSticker) {
    try {
      await react('🔍')
      const mediaMsg = isImage
        ? (m.mtype === 'imageMessage' ? m : quoted)
        : (m.mtype === 'stickerMessage' ? m : quoted)

      const media = await mediaMsg.download()
      imageBase64 = media.toString('base64')

      if (!userText) userText = 'حلل الصورة دي بالتفصيل'
    } catch (e) {
      console.error('[GPT] Media download error:', e.message)
    }
  }

  if (!userText && !imageBase64) {
    await react('❌')
    return m.reply(
      `🤖 *ChatGPT*\n\n` +
      `*الاستخدام:*\n` +
      `▸ ${usedPrefix}${command} [سؤالك]\n` +
      `▸ رد على صورة/استيكر بـ ${usedPrefix}${command}\n\n` +
      `*أمثلة:*\n` +
      `▸ ${usedPrefix}${command} اشرحلي الذكاء الاصطناعي\n` +
      `▸ ${usedPrefix}${command} حلل الصورة دي\n\n` +
      `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    )
  }

  await react('🤖')

  try {
    let messages = [{ role: 'system', content: SYSTEM_PROMPT }]

    if (imageBase64) {
      // ⚡ Vision mode - تحليل الصور
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: userText },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      })
    } else {
      messages.push({ role: 'user', content: userText })
    }

    const model = imageBase64
      ? 'llama-3.2-11b-vision-preview'
      : 'llama-3.3-70b-versatile'

    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: model,
      messages: messages,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    })

    const reply = res.data?.choices?.[0]?.message?.content

    if (!reply) throw new Error('مفيش رد من الـ API')

    await conn.sendMessage(m.chat, {
      text: `🤖 *ChatGPT*\n\n${reply}\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    }, { quoted: m })

    await react('✅')

  } catch (err) {
    await react('❌')
    const errMsg = err.response?.data?.error?.message || err.message || 'خطأ غير معروف'
    m.reply(`❌ *خطأ:* ${errMsg}`)
  }
}

handler.help = ['جيبيتي']
handler.tags = ['ai']
handler.command = /^(جيبيتي|جي بي تي|gpt|chatgpt|شات)$/i

export default handler