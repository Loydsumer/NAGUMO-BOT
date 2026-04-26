import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
let stiker = false
let userId = m.sender
let packstickers = global.db.data.users[userId] || {}
let texto1 = packstickers.text1 || global.packsticker
let texto2 = packstickers.text2 || global.packsticker2

// تحديد الرسالة بناءً على الأمر المستخدم
let commandName = command.toLowerCase()
let usageMessage = ''
let exampleMessage = ''

if (commandName === 's' || commandName === 'sticker' || commandName === 'ملصق') {
    usageMessage = `ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻\n\n`
    usageMessage += `*استخدام الأمر 👻:*\n`
    usageMessage += `❖ أرسل صورة أو فيديو مع الأمر\n`
    usageMessage += `❖ أو أرسل رابط صورة مع الأمر\n`
    usageMessage += `❖ يمكنك إضافة نص مخصص للملصق\n\n`
    usageMessage += `*مثال الاستخدام 👻:*\n`
    usageMessage += `▸ ${usedPrefix}ملصق\n`
    usageMessage += `▸ ${usedPrefix}sticker نص1 | نص2\n`
    usageMessage += `▸ ${usedPrefix}s https://example.com/image.jpg\n\n`
    usageMessage += `*ملاحظة 👻:* الفيديوهات يجب ألا تتجاوز 15 ثانية`
}

try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
let txt = args.join(' ')

if (!/webp|image|video/g.test(mime) && !args[0]) {
    return conn.reply(m.chat, usageMessage, m)
}

if (/webp|image|video/g.test(mime) && q.download) {
    if (/video/.test(mime) && (q.msg || q).seconds > 16)
        return conn.reply(m.chat, '✧ الفيديو لا يمكن أن يتجاوز *15 ثانية* يا رفيقي 👻', m)
    
    let buffer = await q.download()
    await m.react('🕓')
    let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
    stiker = await sticker(buffer, false, marca[0], marca[1])
    
} else if (args[0] && isUrl(args[0])) {
    let buffer = await sticker(false, args[0], texto1, texto2)
    stiker = buffer
    await m.react('🕓')
} else {
    return conn.reply(m.chat, usageMessage, m)
}} catch (e) {
await conn.reply(m.chat, `ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻\n\n⚠︎ حدث خطأ غير متوقع: ${e.message}\n\nتأكد من اتباع التعليمات يا صديقي 👻`, m)
await m.react('✖️')
} finally {
if (stiker) {
conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
await m.react('✅')
}}}

handler.help = ['s', 'sticker', 'ملصق']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'ملصق']

export default handler

const isUrl = (text) => {
return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}