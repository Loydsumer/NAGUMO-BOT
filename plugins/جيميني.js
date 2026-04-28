// plugins/ai-gemini.js
import { askOverChat, askGroq, downloadMedia } from './ai-helper.js'

const SYSTEM = `أنت Gemini، مساعد ذكي سريع من Google.
- ردودك سريعة ومختصرة ومباشرة
- بتوصل المعلومة بأقل كلام
- بتستخدم • للنقاط
- مش بتطوّل إلا لو حد طلب
- لو حد بعتلك صورة، وصفها بسرعة
- بتستخدم إيموجي بذكاء
- بترد بالعربي
- أجب في 3-5 أسطر ما أمكن
- اسمك Gemini وانت في بوت ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}
لا تقل أبداً إنك Claude أو Llama. أنت Gemini.`

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  let userText = text || ''
  let imageBase64 = null

  try {
    imageBase64 = await downloadMedia(m)
    if (imageBase64 && !userText) userText = 'وصف الصورة دي بسرعة'
  } catch {}

  if (!userText && !imageBase64) {
    await react('❌')
    return m.reply(
      `⚡ *Gemini - ردود سريعة*\n\n` +
      `▸ ${usedPrefix}${command} [سؤالك]\n` +
      `▸ رد على صورة بـ ${usedPrefix}${command}\n\n` +
      `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    )
  }

  await react('⚡')

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
      ], 'llama-3.2-11b-vision-preview', 1024)
    } else {
      // ⚡ Gemini 2.5 Pro من OverChat (سريع جداً)
      reply = await askOverChat(userText, SYSTEM, 'google/gemini-2.5-pro')
    }

    if (!reply) throw new Error('مفيش رد')

    await conn.sendMessage(m.chat, {
      text: `⚡ *Gemini*\n\n${reply}\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
    }, { quoted: m })

    await react('✅')

  } catch (err) {
    // Fallback لـ Groq لو OverChat فشل
    try {
      const fallback = await askGroq([
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userText }
      ], 'llama-3.1-8b-instant', 1024)

      await conn.sendMessage(m.chat, {
        text: `⚡ *Gemini*\n\n${fallback}\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
      }, { quoted: m })
      await react('✅')
    } catch {
      await react('❌')
      m.reply(`❌ ${err.message?.substring(0, 200)}`)
    }
  }
}

handler.help = ['جيميني']
handler.tags = ['ai']
handler.command = /^(جيميني|جيمني|جمني|gemini)$/i

export default handler