// 🧞‍♀️ رفع الملفات إلى خادم سحابي وإرجاع رابط مباشر
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { tmpdir } from 'os'
import path from 'path'

let handler = async (m, { conn, command }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
      await m.reply(`🧞‍♀️ *استخدام الأمر:* ${command}

❓ *الوصف:*
هذا الأمر يقوم برفع أي ملف أو وسائط (صورة، فيديو، PDF...) إلى خادم سحابي ويُرجع لك رابط مباشر للتحميل.

📌 *طريقة الاستخدام:*
1. أرسل ملفًا أو وسائط.
2. ثم رد على الملف بكتابة الأمر:

مثال:
.${command}

ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`)
      return
    }

    let media = await q.download()
    let ext = mime.split('/')[1] || 'bin'
    let filename = path.join(tmpdir(), `upload_${Date.now()}.${ext}`)
    fs.writeFileSync(filename, media)

    let form = new FormData()
    form.append('file', fs.createReadStream(filename))

    let { data } = await axios.post('https://fgsi1-restapi.hf.space/api/upload/uploadS3Aws', form, {
      headers: form.getHeaders()
    })

    fs.unlinkSync(filename)

    await m.reply(`🧞‍♀️ *تم رفع الملف بنجاح!*

🔗 *الرابط:*
${data.data.url}

ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`)

  } catch (e) {
    await m.reply(`❌🧞‍♀️ *حدث خطأ:*
${typeof e === 'string' ? e : e.message}`)
  }
}

handler.help = ['lrabit13', 'لرابط13', 'rabit13', 'رابط13']
handler.command = ['lrabit13', 'لرابط13', 'rabit13', 'رابط13']
handler.tags = ['tools']

export default handler