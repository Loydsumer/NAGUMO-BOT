import axios from 'axios'
import FormData from 'form-data'

// ----- Functions -----

async function fetchApiKey() {
  const targetUrl = 'https://overchat.ai/image/ghibli'
  const { data: htmlContent } = await axios.get(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36'
    }
  })

  const match = htmlContent.match(/const apiKey = '([^']+)'/)
  if (!match) throw new Error('🌹 لم يتم العثور على مفتاح API')
  return match[1]
}

async function editImage(buffer, prompt, apiKey) {
  const apiUrl = 'https://api.openai.com/v1/images/edits'
  const form = new FormData()
  form.append('image', buffer, { filename: 'image.png' })
  form.append('prompt', prompt)
  form.append('model', 'gpt-image-1')
  form.append('n', 1)
  form.append('size', '1024x1024')
  form.append('quality', 'medium')

  const response = await axios.post(apiUrl, form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${apiKey}` }
  })

  const result = response.data
  if (!result?.data?.[0]?.b64_json) throw new Error('🌹 فشل الحصول على الصورة المعدلة')
  return Buffer.from(result.data[0].b64_json, 'base64')
}

// ----- Handler -----

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
    const usage = `🌹 استخدم الأمر هكذا:
\`${usedPrefix + command} اجعلها كرتونية\`

🔹 مثال: \`${usedPrefix + command} صورة شخصية أنمي\`

*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞🌹◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*
*◞🧠‟⌝╎اسـمـي: Abyss ⸃⤹*
*⌝💻╎الـوظـيـفـة: بوت تعديل الصور*`
    return m.reply(usage)
  }

  try {
    m.reply('🌹 جاري تنفيذ طلبك ...')
    const buffer = await m.quoted.download()
    const prompt = text || 'حوّل هذه الصورة إلى أسلوب فن Studio Ghibli'

    const apiKey = await fetchApiKey()
    const editedImage = await editImage(buffer, prompt, apiKey)

    await conn.sendFile(
      m.chat,
      editedImage,
      'abyss_edit.png',
      `🌹 تم العمل على صورتك كما طلبت

*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞🌹◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*`,
      m,
      false,
      { mimetype: 'image/png' }
    )
  } catch (err) {
    m.reply(`🌹 حدث خطأ: ${err.message}`)
  }
}

handler.help = ['اديت_صوره']
handler.tags = ['ai']
handler.command = /^(عدل)$/i
handler.mods = true

export default handler