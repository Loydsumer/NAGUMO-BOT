// instagram.com/noureddine_ouafy
// plugin scrape by rikikangsc2-eng شكراً أخي

import axios from 'axios'
import * as cheerio from 'cheerio'
import { URLSearchParams } from 'url'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const baseUrls = [
    'https://elevenlabs-crack.vercel.app',
    'https://elevenlabs-crack-qyb7.vercel.app',
    'https://elevenlabs-crack-f2zu.vercel.app'
  ]

  const baseUrl = baseUrls[Math.floor(Math.random() * baseUrls.length)]

  try {
    const { data: html } = await axios.get(baseUrl + '/')
    const $ = cheerio.load(html)
    const availableModels = $('#ttsForm select[name="model"] option').map((_, el) => $(el).val()).get()

    if (!availableModels.length) {
      return m.reply("❌ لم يتم العثور على أي نماذج صوتية متاحة.")
    }

    // تحديد رقم النموذج
    let modelIndex = parseInt(args[0]) - 1
    if (isNaN(modelIndex) || modelIndex < 0 || modelIndex >= availableModels.length) {
      modelIndex = 0 // إذا لم يحدد رقم صحيح -> نختار الأول
    }

    const model = availableModels[modelIndex]
    const text = isNaN(parseInt(args[0])) ? args.join(" ") : args.slice(1).join(" ")

    if (!text) {
      return m.reply('❌ الرجاء إدخال النص الذي تريد تحويله إلى صوت.\n\n📌 مثال:\n' +
        `${usedPrefix + command} 1 مرحباً بك في بوت عائلة`)
    }

    const payload = new URLSearchParams()
    payload.append('model', model)
    payload.append('text', text)

    const response = await axios.post(`${baseUrl}/generate-audio`, payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
        'Referer': baseUrl + '/'
      },
      responseType: 'arraybuffer'
    })

    await conn.sendMessage(m.chat, {
      audio: Buffer.from(response.data),
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m })

  } catch (e) {
    console.error(`❌ خطأ: ${e.message}`)
    return m.reply('❌ حدث خطأ أثناء المعالجة أو أن الخدمة غير متاحة حالياً.')
  }
}

handler.help = handler.command = ['انطق']
handler.tags = ['ai']
export default handler