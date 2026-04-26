import axios from 'axios'
import crypto from 'crypto'
import yts from 'yt-search'
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

/* إعدادات */
const VIDEO_QUALITIES = ['144','240','360','480','720','1080']
const SEND_LIMIT_AUDIO = 70 * 1024 * 1024   // 70MB
const SEND_LIMIT_VIDEO = 100 * 1024 * 1024  // 100MB
const AXIOS_TIMEOUT = 60000

const http = axios.create({
  timeout: AXIOS_TIMEOUT,
  maxRedirects: 5,
  validateStatus: s => s >= 200 && s < 400
})

const delay = ms => new Promise(r => setTimeout(r, ms))

/* SaveTube */
const savetube = {
  api: {
    base: 'https://media.savetube.me/api',
    cdn: '/random-cdn',
    info: '/v2/info',
    download: '/download'
  },
  headers: {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'referer': 'https://yt.savetube.me/',
    'user-agent': 'Mozilla/5.0 (Linux) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36'
  },
  crypto: {
    hexToBuffer: (hex) => Buffer.from(hex.match(/.{1,2}/g).join(''), 'hex'),
    decrypt: async (enc) => {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
      const data = Buffer.from(enc, 'base64')
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = savetube.crypto.hexToBuffer(secretKey)
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return JSON.parse(decrypted.toString())
    }
  },
  isUrl: (s) => { try { new URL(s); return true } catch { return false } },
  youtubeId: (url) => {
    if (!url) return null
    const pats = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (const re of pats) {
      const m = url.match(re); if (m) return m[1]
    }
    return null
  },
  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await http({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      })
      return { status: true, data: response }
    } catch (e) {
      return { status: false, error: e.message, code: e.response?.status || 500 }
    }
  },
  getCDN: async (retries = 3) => {
    for (let i=0;i<retries;i++){
      const r = await savetube.request(savetube.api.cdn, {}, 'get')
      if (r.status && r?.data?.cdn) return { status: true, cdn: r.data.cdn }
      await delay(400*(i+1))
    }
    return { status: false, error: 'تعذّر اختيار CDN' }
  },
  getDownload: async (url, format) => {
    const id = savetube.youtubeId(url)
    if (!id) return { status: false, error: 'تعذر استخراج معرف الفيديو.' }

    const pickCdn = await savetube.getCDN()
    if (!pickCdn.status) return pickCdn
    const cdn = pickCdn.cdn

    const info = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` })
    if (!info.status) return info

    const decrypted = await savetube.crypto.decrypt(info.data.data)
    const payload = {
      id,
      downloadType: format === 'mp3' ? 'audio' : 'video',
      quality: format === 'mp3' ? '128' : format,
      key: decrypted.key
    }

    let dl = await savetube.request(`https://${cdn}${savetube.api.download}`, payload)
    if (!dl.status || !dl?.data?.data?.downloadUrl) {
      // إعادة محاولة مع CDN آخر
      const pick2 = await savetube.getCDN()
      if (!pick2.status) return { status: false, error: 'تعذر التحميل من CDN' }
      dl = await savetube.request(`https://${pick2.cdn}${savetube.api.download}`, payload)
      if (!dl.status || !dl?.data?.data?.downloadUrl) return { status: false, error: 'الرابط غير متاح حالياً' }
    }

    return {
      status: true,
      result: {
        title: decrypted.title || 'غير معروف',
        type: format === 'mp3' ? 'audio' : 'video',
        format,
        thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        download: dl.data.data.downloadUrl,
        id,
        duration: decrypted.duration || '-',
        quality: payload.quality
      }
    }
  }
}

/* أدوات */
const headInfo = async (url) => {
  try {
    const r = await http.head(url)
    return { ok: r.status >= 200 && r.status < 400, size: Number(r.headers['content-length']||0), type: r.headers['content-type']||'' }
  } catch { return { ok:false, size:0, type:'' } }
}
const sizeStr = n => {
  if (!Number.isFinite(n)) return '-'
  const u=['B','KB','MB','GB']; let i=0
  while(n>=1024 && i<u.length-1){ n/=1024; i++ }
  return `${n.toFixed(1)} ${u[i]}`
}

/* === واجهة المستخدم === */
async function sendFormatPicker(conn, m, { title, url, thumb, usedPrefix }) {
  // هيدر بصورة
  let header = { hasMediaAttachment: false }
  try {
    const media = await prepareWAMessageMedia({ image: { url: thumb } }, { upload: conn.waUploadToServer })
    header = { hasMediaAttachment: true, imageMessage: media.imageMessage }
  } catch {}

  // زرّين: MP3 أو MP4
  const buttons = [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 MP3', id: `${usedPrefix}غنيه mp3 ${url}` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎬 MP4', id: `${usedPrefix}غنيه mp4 ${url}` }) }
  ]

  const card = {
    body: { text: `🎵 *${title}*\n\nاختر الصيغة المطلوبة:` },
    footer: { text: '✦ ƓȺⱮį 👻 βටͲ ✦' },
    header,
    nativeFlowMessage: { buttons, messageParamsJson: '' }
  }

  const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage: card } } }, { quoted: m, userJid: conn.user.jid })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

async function sendQualityPicker(conn, m, { title, url, thumb, usedPrefix }) {
  let header = { hasMediaAttachment: false }
  try {
    const media = await prepareWAMessageMedia({ image: { url: thumb } }, { upload: conn.waUploadToServer })
    header = { hasMediaAttachment: true, imageMessage: media.imageMessage }
  } catch {}

  // أزرار دقّات سريعة
  const quick = VIDEO_QUALITIES.map(q => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: `${q}p`, id: `${usedPrefix}غنيه mp4 ${url} ${q}` })
  }))

  const card = {
    body: { text: `🎬 *${title}*\n\nاختر دقّة الفيديو:` },
    footer: { text: '✦ ƓȺⱮį 👻 βටͲ ✦' },
    header,
    nativeFlowMessage: { buttons: quick, messageParamsJson: '' }
  }

  const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage: card } } }, { quoted: m, userJid: conn.user.jid })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

/* === الأمر الرئيسي === */
const handler = async (m, { conn, args, usedPrefix, command }) => {
  // حالات:
  // 1) .غنيه <اسم/رابط>  → يبحث ويعرض اختيار MP3/MP4
  // 2) .غنيه mp3 <رابط/اسم> → تنزيل MP3 مباشرة
  // 3) .غنيه mp4 <رابط/اسم> → يعرض اختيار الدقّة
  // 4) .غنيه mp4 <رابط> <دقة> → تنزيل فيديو بالدقّة

  if (!args.length) {
    return m.reply(
`🧞‍♀️ الاستخدام:
• *${usedPrefix + command} <اسم/رابط>* ← يعرض اختيار MP3/MP4
• *${usedPrefix + command} mp3 <اسم/رابط>* ← تحميل صوت
• *${usedPrefix + command} mp4 <اسم/رابط>* ← اختيار الدقّة للفيديو`)
  }

  let mode = null
  let query = args.join(' ')

  if (['mp3','mp4','صوت','فيديو'].includes(args[0].toLowerCase())) {
    const t = args[0].toLowerCase()
    mode = (t === 'mp3' || t === 'صوت') ? 'audio' : 'video'
    query = args.slice(1).join(' ')
  }

  // لو ما حددت نوع: اعرض اختيار MP3/MP4
  if (!mode) {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
    let url = savetube.isUrl(query) ? query : null
    let meta = null
    if (!url) {
      const r = await yts(query).catch(() => null)
      if (!r?.videos?.length) {
        await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
        return m.reply('❌ لم يتم العثور على نتائج.')
      }
      const v = r.videos[0]
      url = v.url
      meta = { title: v.title, thumb: v.thumbnail }
    }
    await sendFormatPicker(conn, m, { title: meta?.title || 'YouTube', url, thumb: meta?.thumb || `https://i.ytimg.com/vi/${savetube.youtubeId(url)}/hqdefault.jpg`, usedPrefix })
    return
  }

  // نوع محدد
  if (mode === 'audio') {
    // تنزيل MP3 مباشرة
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
    let url = savetube.isUrl(query) ? query : null
    if (!url) {
      const r = await yts(query).catch(() => null)
      if (!r?.videos?.length) {
        await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
        return m.reply('❌ لم يتم العثور على نتائج.')
      }
      url = r.videos[0].url
    }

    const res = await savetube.getDownload(url, 'mp3')
    if (!res.status) {
      await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
      return m.reply(`❌ فشل التنزيل:\n${res.error || 'غير معروف'}`)
    }

    const { title, download } = res.result
    const head = await headInfo(download)
    if (!head.ok) {
      await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
      return m.reply('❌ الرابط غير متاح حالياً.')
    }
    if (head.size > SEND_LIMIT_AUDIO) {
      await conn.sendMessage(m.chat, { text: `⚠️ الملف كبير (${sizeStr(head.size)}). رابط مباشر:\n${download}` }, { quoted: m })
      return
    }
    await conn.sendMessage(m.chat, {
      audio: { url: download },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    return
  }

  // mode === 'video'
  // هل تم تحديد دقّة؟
  const parts = query.trim().split(/\s+/)
  let quality = null
  if (/^\d{3,4}$/.test(parts[parts.length - 1])) {
    quality = parts.pop()
    query = parts.join(' ')
  }

  let url = savetube.isUrl(query) ? query : null
  let meta = null
  if (!url) {
    const r = await yts(query).catch(() => null)
    if (!r?.videos?.length) {
      await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
      return m.reply('❌ لم يتم العثور على نتائج.')
    }
    const v = r.videos[0]
    url = v.url
    meta = { title: v.title, thumb: v.thumbnail }
  }

  if (!quality) {
    // اعرض اختيار الدقّة
    await sendQualityPicker(conn, m, {
      title: meta?.title || 'YouTube',
      url,
      thumb: meta?.thumb || `https://i.ytimg.com/vi/${savetube.youtubeId(url)}/hqdefault.jpg`,
      usedPrefix
    })
    return
  }

  if (!VIDEO_QUALITIES.includes(quality)) {
    return m.reply(`❌ دقّة غير مدعومة. الدقات المتاحة: ${VIDEO_QUALITIES.join(', ')}`)
  }

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  const res = await savetube.getDownload(url, quality)
  if (!res.status) {
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
    return m.reply(`❌ فشل التنزيل:\n${res.error || 'غير معروف'}`)
  }

  const { title, download, duration } = res.result
  const head = await headInfo(download)
  if (!head.ok) {
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } })
    return m.reply('❌ الرابط غير متاح حالياً.')
  }
  if (head.size > SEND_LIMIT_VIDEO) {
    await conn.sendMessage(m.chat, { text: `⚠️ الملف كبير (${sizeStr(head.size)}). رابط مباشر:\n${download}` }, { quoted: m })
    return
  }

  await conn.sendMessage(m.chat, {
    video: { url: download },
    caption: `${title}\nالجودة: ${quality}p\nالمدة: ${duration || '-'}`
  }, { quoted: m })
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
}

handler.command = /^(غنيه|اغنيه|اغنية)$/i
export default handler