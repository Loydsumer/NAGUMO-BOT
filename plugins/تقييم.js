import axios from 'axios'

const GROQ_KEY = global.APIs?.groq || 'gsk_2gburnTq2830iQT5rJFcWGdyb3FYIn4Y4h7yg8llm8lC6TD830W'

const REVIEW_PROMPT = `أنت مبرمج خبير ومتخصص في مراجعة الكود.
مهمتك:
- تحليل الكود المرسل بدقة
- تحديد الأخطاء والمشاكل
- تقييم جودة الكود من 10
- الرد دائماً بالعربي

طريقة الرد يجب أن تكون هكذا بالضبط:
━━━━━━━━━━━━━━━━
⭐ *التقييم: [رقم]/10*
━━━━━━━━━━━━━━━━
✅ *الإيجابيات:*
• [نقطة 1]
• [نقطة 2]

❌ *السلبيات والأخطاء:*
• [خطأ 1 مع الشرح]
• [خطأ 2 مع الشرح]

💡 *اقتراحات التحسين:*
• [اقتراح 1]
• [اقتراح 2]

📊 *ملخص:*
[جملة أو جملتين تلخص الكود]
━━━━━━━━━━━━━━━━
كن صريحاً ودقيقاً ولا تجامل.`

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // ━━━ استخرج الكود ━━━
  let code = text || ''

  // لو رد على رسالة فيها كود
  if (!code && m.quoted?.text) {
    code = m.quoted.text
  }

  if (!code) {
    await react('❌')
    return m.reply([
      `🔍 *تقييم الكود*`,
      ``,
      `*الاستخدام:*`,
      `▸ ${usedPrefix}${command} [الكود]`,
      `▸ أو رد على رسالة فيها كود بـ ${usedPrefix}${command}`,
      ``,
      `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    ].join('\n'))
  }

  await react('🔍')
  await m.reply('🔍 *جاري تقييم الكود...*')

  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: REVIEW_PROMPT },
          { role: 'user', content: `قيّم الكود التالي:\n\`\`\`\n${code}\n\`\`\`` }
        ],
        max_tokens: 2048,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )

    const reply = res.data?.choices?.[0]?.message?.content
    if (!reply) throw new Error('مفيش رد')

    await conn.sendMessage(m.chat, {
      text: `🔍 *تقييم الكود*\n\n${reply}\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    }, { quoted: m })

    await react('✅')

  } catch (err) {
    await react('❌')
    m.reply(`❌ فشل التقييم: ${err.response?.data?.error?.message || err.message}`)
  }
}

handler.help    = ['تقييم [كود]']
handler.tags    = ['ai']
handler.command = /^(تقييم|review|قيم|كود)$/i

export default handler