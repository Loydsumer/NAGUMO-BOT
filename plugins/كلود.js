// plugins/ai-claude.js
import { askOverChat, askGroq, downloadMedia } from './ai-helper.js'

const SYSTEM = `أنت Claude، خبير برمجة ومساعد تقني متقدم صنعته Anthropic.
شخصيتك وقدراتك:
- متخصص في البرمجة بكل اللغات (JavaScript, Python, Java, C++, etc)
- لما حد يسألك عن كود، بتكتبه نظيف ومنظم داخل code blocks
- بتشرح كل سطر في الكود
- بتصلح الأخطاء البرمجية وبتشرح السبب
- لو حد بعتلك صورة فيها كود أو خطأ، بتحلله وتصلحه
- بتقترح Best Practices
- بتستخدم \`\`\` للأكواد دايماً
- بترد بالعربي مع كتابة الأكواد بالإنجليزي
- اسمك Claude وانت في بوت ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}

لما حد يسألك عن كود:
1. اكتب الكود كامل ومنظم
2. اشرح كل جزء
3. ادي أمثلة على الاستخدام
4. حذر من الأخطاء الشائعة
5. اقترح تحسينات`

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  let userText = text || ''
  let imageBase64 = null

  try {
    imageBase64 = await downloadMedia(m)
    if (imageBase64 && !userText) userText = 'حلل الكود أو المحتوى اللي في الصورة دي وصلح أي أخطاء'
  } catch {}

  if (!userText && !imageBase64) {
    await react('❌')
    return m.reply(
      `💻 *Claude - خبير الأكواد*\n\n` +
      `*الاستخدام:*\n` +
      `▸ ${usedPrefix}${command} [سؤال برمجي]\n` +
      `▸ رد على صورة كود بـ ${usedPrefix}${command}\n\n` +
      `*أمثلة:*\n` +
      `▸ ${usedPrefix}${command} اعملي API بالـ Express.js\n` +
      `▸ ${usedPrefix}${command} اشرحلي async/await\n` +
      `▸ ${usedPrefix}${command} صلحلي الكود ده\n\n` +
      `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    )
  }

  await react('💻')

  try {
    let reply

    if (imageBase64) {
      reply = await askGroq([
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ], 'llama-3.2-11b-vision-preview', 4096)
    } else {
      // ⚡ Claude Opus 4 الحقيقي من OverChat!
      reply = await askOverChat(userText, SYSTEM, 'anthropic/claude-opus-4-6')
    }

    if (!reply) throw new Error('مفيش رد')

    await conn.sendMessage(m.chat, {
      text: `💻 *Claude*\n\n${reply}\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    }, { quoted: m })

    await react('✅')

  } catch (err) {
    await react('❌')
    m.reply(`❌ *خطأ:* ${err.message?.substring(0, 200)}`)
  }
}

handler.help = ['كلود']
handler.tags = ['ai']
handler.command = /^(كلود|كلاود|claude)$/i

export default handler