import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  const decorate = (msg) => `*╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊰*\n*${msg}*\n*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊰*`
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } })
    return m.reply(decorate(`⚠️ يرجى الرد على صورة أو إرسالها مع الأمر:\n*${usedPrefix + command}*`))
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const media = await quoted.download()
    const ext = mime.split('/')[1]
    const filename = `upscaled_${Date.now()}.${ext}`

    const form = new FormData()
    form.append('image', media, { filename, contentType: mime })
    form.append('scale', '2')

    const headers = {
      ...form.getHeaders(),
      'accept': 'application/json',
      'x-client-version': 'web',
      'x-locale': 'en'
    }

    const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers,
      body: form
    })

    const json = await res.json()
    if (!json?.result_url || !json.result_url.startsWith('http')) {
      throw new Error('فشل الحصول على رابط النتيجة من Pixelcut.')
    }

    const resultBuffer = await (await fetch(json.result_url)).buffer()

    // إرسال الصورة النهائية مع اسم البوت
    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: decorate(`✨ تم تحسين الصورة بدقة 2x بنجاح!\n> ⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐`)
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply(decorate(`❌ حدث خطأ:\n${err.message || err}`))
  }
}

handler.help = ['upscale']
handler.tags = ['tools', 'image']
handler.command = /^(تحسين|hd|remini)$/i

export default handler