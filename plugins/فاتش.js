import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { text, conn }) => {
    if (!/^https?:\/\//.test(text)) throw '📌 يجب أن يكون الرابط يبدأ بـ http:// أو https://'

    let url = new URL(text)
    let fullUrl = url.toString()

    let res = await fetch(fullUrl)
    
    if (parseInt(res.headers.get('content-length') || '0') > 100 * 1024 * 1024) {
        throw `❌ الملف كبير جدًا: ${res.headers.get('content-length')} بايت`
    }

    await m.reply('⏳ جارٍ جلب المحتوى...')

    let contentType = res.headers.get('content-type') || ''

    if (!/text|json/.test(contentType)) {
        return conn.sendFile(m.chat, fullUrl, 'file', `📎 الملف من: ${fullUrl}`, m)
    }

    let txt = await res.buffer()
    try {
        txt = format(JSON.parse(txt.toString()))
    } catch (e) {
        txt = txt.toString()
    }

    m.reply(txt.slice(0, 65536))
}

handler.help = ['fetch', 'get']
handler.tags = ['tools']
handler.command = /^(فاتش|get)$/i


export default handler