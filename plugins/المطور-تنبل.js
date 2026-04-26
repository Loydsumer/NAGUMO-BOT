import { readdirSync, rmSync } from 'fs'

let handler = async (m, { conn, command }) => {

    try {
        const dir = './tmp'

        // قائمة الأرقام المسموح لها موجودة في منتصف الكود
        const allowedNumbers = [
            '201115546207@s.whatsapp.net', // الرقم الأول
            '963969829657@s.whatsapp.net'  // الرقم الثاني
        ]

        // التحقق من أن المستخدم مسموح له باستخدام الأمر
        if (!allowedNumbers.includes(m.sender)) {
            return m.reply(`❌ *غير مسموح لك باستخدام هذا الأمر! 👻*`)
        }

        // حذف جميع الملفات داخل مجلد tmp
        readdirSync(dir).forEach(f => rmSync(`${dir}/${f}`))

        // رسالة نجاح التنظيف
        let pesan = `🩷 *تم تنظيف مجلد tmp بنجاح 👻*\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
        await m.reply(pesan)

    } catch (err) {
        console.error(err)
        m.reply(`❌ *حدث خطأ أثناء تنظيف المجلد! 👻*`)
    }
}

handler.help = ['cleartmp', 'تنبل']
handler.tags = ['owner']
handler.command = /^(cleartmp|c(lear)?tmp|تنبل)$/i
handler.mods = true
handler.owner = true

export default handler