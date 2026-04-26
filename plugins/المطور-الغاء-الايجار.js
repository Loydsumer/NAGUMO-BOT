let handler = async (m, { conn, args, command, usedPrefix }) => {

    try {
        let who
        if (m.isGroup) who = args[0] ? args[0] : m.chat
        else who = args[0]

        // قائمة الأرقام المسموح لها موجودة في منتصف الكود
        const allowedNumbers = [
            '201115546207@s.whatsapp.net', // الرقم الأول
            '963969829657@s.whatsapp.net'  // الرقم الثاني
        ]

        // التحقق من أن المستخدم مسموح له باستخدام الأمر
        if (!allowedNumbers.includes(m.sender)) {
            return m.reply(`❌ *غير مسموح لك باستخدام هذا الأمر! 👻*`)
        }

        // إزالة انتهاء صلاحية المجموعة
        global.db.data.chats[who].expired = false

        // إرسال رسالة تأكيد بأسلوب اوغامي كورليوني
        let pesan = `
🍫 *تم بنجاح إلغاء الإيجار للمجموعة! 👻*
*الآن هذه المجموعة دائمة ولا تخضع لأي حد زمني.*  

💡 *لتوضيح استخدام الأمر:*  
يمكنك استخدام الأمر \`${usedPrefix + command}\` لإلغاء الإيجار للمجموعة الحالية أو تحديد معرف مجموعة أخرى 👻  

📌 مثال:  
\`${usedPrefix + command}\` (لإلغاء الإيجار للمجموعة الحالية)

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim()

        await conn.reply(m.chat, pesan, m)

    } catch (err) {
        console.error(err)
        m.reply(`❌ *حدث خطأ أثناء إلغاء الإيجار! 👻*`)
    }
}

handler.help = ['delexpired', 'الغاء-الايجار', 'إلغاء الإيجار']
handler.tags = ['owner']
handler.command = /^(delexpired|delsewa|الغاء-الايجار|إلغاء الإيجار)$/i
handler.owner = true

export default handler