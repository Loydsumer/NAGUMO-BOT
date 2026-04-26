import axios from 'axios'
import cheerio from 'cheerio'
import FormData from 'form-data'

// دالة لرفع الصورة
async function postimg(buffer) {
  try {
    let data = new FormData()
    data.append('optsize', '0')
    data.append('expire', '0')
    data.append('numfiles', '1')
    data.append('upload_session', Math.random())
    data.append('file', buffer, `${Date.now()}.jpg`)

    const res = await axios.post('https://postimages.org/json/rr', data)
    const html = await axios.get(res.data.url)
    const $ = cheerio.load(html.data)

    let link = $('#code_html').attr('value')
    let image = $('#code_direct').attr('value')
    let delimg = $('#code_remove').attr('value')

    return { link, image, delimg }
  } catch (err) {
    throw err
  }
}

// معالجة الرسائل الواردة
let handler = async (m, { conn, usedPrefix }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image/.test(mime)) {
      return m.reply(`❌ أرسل صورة مع التعليق *${usedPrefix}ممم* أو رد على صورة بنفس الأمر.`)
    }

    let media = await q.download()

    m.reply('⏳ *جارٍ رفع الصورة...* 🧞‍♀️')

    let result = await postimg(media)

    let caption = `✅ *تم رفع الصورة بنجاح!*\n\n` +
                  `📎 *رابط HTML:* ${result.link}\n` +
                  `🖼️ *رابط مباشر:* ${result.image}\n` +
                  `🗑️ *رابط حذف الصورة:* ${result.delimg}`

    await conn.sendMessage(m.chat, { image: { url: result.image }, caption }, { quoted: m })
  } catch (e) {
    m.reply(`❌ *فشل في رفع الصورة:*\n${e}`)
  }
}

// تخصيص الأمر
handler.command = ['رفع']
handler.group = false

// التوضيح لكيفية الاستخدام مع مثال
handler.description = '🔗 يقوم هذا الأمر برفع الصور وإرسال رابط مباشر لها. مثال: أرسل صورة مع التعليق *ممم* أو رد على صورة بنفس الأمر.'

// التوقيع
handler.footer = 'ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ'

export default handler