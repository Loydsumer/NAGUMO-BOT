import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text }) => {
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    }

    // ━━━ التأكد من وجود رد على استيكر ━━━
    if (!m.quoted) {
        await react('❌')
        return m.reply('❌ *لازم ترد على الاستيكر*\n\n📌 *مثال:*\nرد على الاستيكر بـ:\n`.حقوق يوسف|مطور البوت`')
    }

    // ━━━ فصل اسم الحزمة واسم المؤلف ━━━
    let [packname, ...author] = text ? text.split('|') : []
    author = (author || []).join('|')
    
    // إذا ما كتب شيء، يستخدم الأسماء الافتراضية
    if (!text) {
        packname = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
        author = global.botDev || '...'
    }

    let stiker = false
    try {
        let mime = m.quoted.mimetype || ''
        if (!/webp/.test(mime)) {
            await react('❌')
            return m.reply('❌ *يا نجم، لازم ترد على استيكر عشان نضيف الاسم!*')
        }
        
        let img = await m.quoted.download()
        if (!img) throw new Error('فشل تحميل الاستيكر')
        
        // إضافة البيانات للاستيكر
        stiker = await addExif(img, packname || '', author || '')
        
    } catch (e) {
        console.error(e)
        if (Buffer.isBuffer(e)) stiker = e
    } finally {
        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await react('✅')
            await m.reply(`✅ *تم تعديل حقوق الاستيكر بنجاح*\n📦 *الحزمة:* ${packname}\n👤 *المؤلف:* ${author}`)
        } else {
            await react('❌')
            throw 'حصلت غلطة! تأكد انك رديت على استيكر وضفت اسم الباكدج'
        }
    }
}

handler.help = ['حقوق <packname>|<author>']
handler.tags = ['sticker']
handler.command = /^(حقوق|wm)$/i

export default handler