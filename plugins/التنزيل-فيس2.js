// plugins/fb-downloader.js
import axios from 'axios'
import * as cheerio from 'cheerio'
import qs from 'qs'

const SIGN = 'ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻'

// التحقق من رابط فيسبوك
const isFacebookUrl = (u = '') => {
  try {
    const url = new URL(u)
    const host = url.hostname.toLowerCase()
    return (
      host.endsWith('facebook.com') ||
      host === 'fb.watch' ||
      host.endsWith('m.facebook.com') ||
      host.endsWith('www.facebook.com')
    )
  } catch {
    return false
  }
}

// استخراج أول رابط من النص
const extractFirstUrl = (text = '') => {
  const m = text.match(/https?:\/\/\S+/i)
  return m ? m[0] : ''
}

// رسالة إرشاد ديناميكية حسب اسم الأمر
const usageText = (cmdShown) => {
  const dot = cmdShown?.startsWith('.') || cmdShown?.startsWith('!') ? '' : '.'
  const cmd = `${dot}${cmdShown || 'fbdl'}`
  const example = `${cmd} https://www.facebook.com/watch/?v=1234567890`
  return (
    `👻 طريقة الاستخدام (${cmd}):\n` +
    `أرسل الأمر متبوعًا برابط فيديو فيسبوك، أو اقتبس رسالة تحتوي على الرابط.\n` +
    `مثال:\n> ${example}\n\n` +
    `${SIGN}`
  )
}

let handler = async (m, { command, args }) => {
  // اجمع الرابط من الوسائط المتاحة
  let inputUrl =
    args[0] ||
    extractFirstUrl(m?.text || '') ||
    extractFirstUrl(m?.quoted?.text || '')

  // إن ما فيه رابط أو مش فيسبوك → أرسل الإرشاد مرة واحدة فقط
  if (!inputUrl || !isFacebookUrl(inputUrl)) {
    return m.reply(usageText(command))
  }

  // رسالة بدء (أسلوب اوغامي كورليوني)
  await m.reply(
    `👻 يا صديقي… دع رجال العائلة يتولّون الأمر.\n` +
    `سنُحضر لك الفيديو كما طلبت.\n\n` +
    `${SIGN}`
  )

  try {
    const payload = qs.stringify({ fb_url: inputUrl })
    const res = await axios.post('https://saveas.co/smart_download.php', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 25_000
    })

    const $ = cheerio.load(res.data)
    const hd = $('#hdLink').attr('href') || null
    const sd = $('#sdLink').attr('href') || null
    const video = hd || sd

    if (!video) {
      return m.reply(
        `👻 لم أعثر على رابط تنزيل صالح.\n` +
        `تأكد أن الفيديو عام وليس خاصًا، ثم أرسل الرابط مجددًا.\n\n` +
        `${SIGN}`
      )
    }

    const quality = hd ? 'HD' : 'SD'
    const sock = m.conn || global.conn

    await sock.sendMessage(
      m.chat,
      { video: { url: video }, caption: `👻 تم التنزيل بنجاح (${quality}).\n${SIGN}` },
      { quoted: m }
    )
  } catch (e) {
    await m.reply(
      `👻 حدث خطأ أثناء جلب الفيديو:\n` +
      `${String(e?.message || e)}\n\n` +
      `${SIGN}`
    )
  }
}

// الأوامر: إنجليزي + عربي (بدون 👻 في نصوص الأوامر)
handler.command = /^(fbdl|fb|facebook2|فيس2|فيسبوك2)$/i
handler.tags = ['downloader']
handler.help = [
  'fbdl',
  'fb',
  'Facebook2',
  'فيس2',
  'فيسبوك2'
]

export default handler