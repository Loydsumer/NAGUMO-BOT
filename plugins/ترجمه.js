// plugins/ai-translate.js
import axios from 'axios'

const GROQ_KEY = global.APIs?.groq || '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'

const LANGUAGES = {
  'عربي': 'Arabic', 'انجليزي': 'English', 'فرنسي': 'French',
  'اسباني': 'Spanish', 'الماني': 'German', 'ايطالي': 'Italian',
  'تركي': 'Turkish', 'روسي': 'Russian', 'صيني': 'Chinese',
  'ياباني': 'Japanese', 'كوري': 'Korean', 'هندي': 'Hindi',
  'برتغالي': 'Portuguese', 'هولندي': 'Dutch', 'فارسي': 'Persian',
  'اردو': 'Urdu', 'اندونيسي': 'Indonesian', 'ماليزي': 'Malay',

  'ar': 'Arabic', 'en': 'English', 'fr': 'French',
  'es': 'Spanish', 'de': 'German', 'it': 'Italian',
  'tr': 'Turkish', 'ru': 'Russian', 'zh': 'Chinese',
  'ja': 'Japanese', 'ko': 'Korean', 'hi': 'Hindi',
  'pt': 'Portuguese', 'nl': 'Dutch', 'fa': 'Persian',
  'ur': 'Urdu', 'id': 'Indonesian', 'ms': 'Malay'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // ─── التحقق من وجود نص ────────────────
  let inputText = text || ''

  // لو رد على رسالة، نترجم الرسالة المقتبسة
  if (!inputText && m.quoted?.text) {
    inputText = m.quoted.text
  }

  if (!inputText) {
    const langList = Object.entries(LANGUAGES)
      .filter(([k]) => k.length > 2)
      .map(([k]) => `▸ ${k}`)
      .join('\n')

    await react('❌')
    return m.reply(
      `🌍 *الترجمة الذكية*\n\n` +
      `*الاستخدام:*\n` +
      `▸ ${usedPrefix}${command} [اللغة] [النص]\n` +
      `▸ ${usedPrefix}${command} [النص] (هيترجم لعربي تلقائي)\n` +
      `▸ رد على رسالة بـ ${usedPrefix}${command} [اللغة]\n\n` +
      `*اللغات:*\n${langList}\n\n` +
      `*أمثلة:*\n` +
      `▸ ${usedPrefix}${command} انجليزي مرحبا كيف حالك\n` +
      `▸ ${usedPrefix}${command} Hello how are you\n` +
      `▸ ${usedPrefix}${command} فرنسي أنا أحب البرمجة\n\n` +
      `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    )
  }

  await react('🌍')

  try {
    // ─── تحديد اللغة والنص ──────────────
    let targetLang = 'Arabic'
    let textToTranslate = inputText

    const firstWord = inputText.split(/\s+/)[0].toLowerCase()

    if (LANGUAGES[firstWord]) {
      targetLang = LANGUAGES[firstWord]
      textToTranslate = inputText.split(/\s+/).slice(1).join(' ')

      if (!textToTranslate && m.quoted?.text) {
        textToTranslate = m.quoted.text
      }

      if (!textToTranslate) {
        return m.reply('❌ *اكتب النص اللي عايز تترجمه*')
      }
    }

    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLang}. 
Rules:
- Output ONLY the translation, nothing else
- Maintain the original formatting
- Keep names and technical terms as they are
- Be accurate and natural sounding`
        },
        { role: 'user', content: textToTranslate }
      ],
      max_tokens: 2048,
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    })

    const translation = res.data?.choices?.[0]?.message?.content
    if (!translation) throw new Error('فشل الترجمة')

    // ─── كشف اللغة الأصلية ──────────────
    let detectedLang = 'غير معروف'
    try {
      const detectRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Detect the language of the text. Reply with ONLY the language name in Arabic. Example: إنجليزي, عربي, فرنسي'
          },
          { role: 'user', content: textToTranslate }
        ],
        max_tokens: 20,
        temperature: 0
      }, {
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      })
      detectedLang = detectRes.data?.choices?.[0]?.message?.content || 'غير معروف'
    } catch {}

    // ─── النتيجة ────────────────────────
    const targetAr = Object.entries(LANGUAGES)
      .filter(([k]) => k.length > 2)
      .find(([, v]) => v === targetLang)?.[0] || targetLang

    await conn.sendMessage(m.chat, {
      text:
        `🌍 *الترجمة*\n\n` +
        `📥 *من:* ${detectedLang}\n` +
        `📤 *إلى:* ${targetAr}\n\n` +
        `📝 *الأصلي:*\n${textToTranslate}\n\n` +
        `✅ *الترجمة:*\n${translation}\n\n` +
        `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    }, { quoted: m })

    await react('✅')

  } catch (err) {
    await react('❌')
    m.reply(`❌ *خطأ:* ${err.response?.data?.error?.message || err.message}`)
  }
}

handler.help = ['ترجمة']
handler.tags = ['ai']
handler.command = /^(ترجمه|ترجمة|ترجم|translate|tr)$/i

export default handler