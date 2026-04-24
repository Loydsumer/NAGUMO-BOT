import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
  let stiker = false
  let userId = m.sender

  // جلب إعدادات الباك الخاص بالمستخدم
  let packstickers = global.db.data.users[userId] || {}
  let texto1 = packstickers.text1 || global.packsticker
  let texto2 = packstickers.text2 || global.packsticker2

  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    let txt = args.join(' ')

    // ===== التعامل مع صورة / فيديو / WEBP =====
    if (/webp|image|video/g.test(mime) && q.download) {

      // منع الفيديوهات الطويلة
      if (/video/.test(mime) && (q.msg || q).seconds > 16)
        return conn.reply(m.chat, '✧ لا يمكن أن يزيد الفيديو عن *15 ثانية* ❗', m)

      let buffer = await q.download()
      await m.react('🕓')

      // تقسيم النص لمنطقة Pack / Author
      let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]

      stiker = await sticker(buffer, false, marca[0], marca[1])

    // ===== التعامل مع الروابط =====
    } else if (args[0] && isUrl(args[0])) {
      let buffer = await sticker(false, args[0], texto1, texto2)
      stiker = buffer

    } else {
      return conn.reply(m.chat, '❀ من فضلك أرسل *صورة* أو *فيديو* لتحويله إلى ملصق.', m)
    }

  } catch (e) {
    await conn.reply(m.chat, '⚠︎ حدث خطأ: ' + e.message, m)
    await m.react('✖️')

  } finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      await m.react('✅')
    }
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['ملصق', 'ملصق']

export default handler

// التحقق من الروابط الصالحة
const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}