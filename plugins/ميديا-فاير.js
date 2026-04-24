import fetch from 'node-fetch'
import { mediafiredl } from '@bochilteam/scraper'
import pkg from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, prepareWAMessageMedia } = pkg

let handler = async (m, { conn, args, usedPrefix, command, isOwner, isPrems }) => {
    var limit = (isOwner || isPrems) ? 1200 : 100

    // بدل if(!args[0]) throw ...
    let msg
    if (!args[0]) {
        msg = '*✳️ أدخـل الـرابــط بـجانـب الأمــر*'
        return await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
    }

    if (!args[0].match(/mediafire/gi)) {
        msg = '❎ الرابط غير صحيح'
        return await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '🤌🏻', key: m.key } })

    let u = /https?:\/\//.test(args[0]) ? args[0] : 'https://' + args[0]
    let ssBuffer = await (await fetch(`https://image.thum.io/get/fullpage/${u}`)).buffer()
    let res = await mediafiredl(args[0])
    let { url, filename, ext, aploud, filesize, filesizeH } = res
    let isLimit = filesize > limit * 1012

    msg = `
       ≡ *ميديافاير* ≡
   
   ▢ *الرقم:* ${filename}
   ▢ *الحجم:* ${filesizeH}
   ▢ *الامتداد:* ${ext}
   ▢ *تم التحميل:* ${aploud}
${isLimit ? `\n▢ الملف يتجاوز حد التنزيل *+${limit} ميغابايت*\nقم بالترقية إلى حساب بريميوم لتكون قادرًا على تنزيل ملفات أكبر من *900 ميغابايت*` : ''} 
`.trim()

    const media = await prepareWAMessageMedia({ image: ssBuffer }, { upload: conn.waUploadToServer })
    let sendMsg = generateWAMessageFromContent(m.chat, {
        imageMessage: media.imageMessage,
        caption: msg
    }, { userJid: m.sender })

    await conn.relayMessage(m.chat, sendMsg.message, { messageId: sendMsg.key.id })

    if (!isLimit) {
        const fileMedia = await prepareWAMessageMedia({ url, mimetype: ext, fileName: filename }, { upload: conn.waUploadToServer })
        let fileMsg = generateWAMessageFromContent(m.chat, {
            documentMessage: fileMedia.documentMessage
        }, { userJid: m.sender })
        await conn.relayMessage(m.chat, fileMsg.message, { messageId: fileMsg.key.id })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
}

handler.help = ['mediafire <url>']
handler.tags = ['downloader', 'premium']
handler.command = ['mediafire', 'ميديا-فاير','مديافاير','ميديافاير'] 

export default handler