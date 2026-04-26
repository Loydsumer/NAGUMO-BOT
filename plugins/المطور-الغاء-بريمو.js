let handler = async (m, { conn, text, command, usedPrefix }) => {

    // تحديد المستخدم المستهدف
    let who = m.mentionedJid?.[0]
        || m.quoted?.sender
        || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false)

    if (!who) return m.reply(
        `🍓 *ضع تاغ للمستخدم أو أدخل رقمه أولاً يا عزيزي~ 👻*\n\n*مثال: ${usedPrefix + command} @${m.sender.split('@')[0]}*`
    )

    // قائمة الأرقام المسموح لها موجودة في منتصف الكود
    const allowedNumbers = [
        '201115546207@s.whatsapp.net', // الرقم الأول
        '963969829657@s.whatsapp.net'  // الرقم الثاني
    ]

    // التحقق من صلاحية المستخدم
    if (!allowedNumbers.includes(m.sender)) {
        return m.reply(`❌ *غير مسموح لك باستخدام هذا الأمر! 👻*`)
    }

    let user = global.db.data.users[who]
    if (!user || !user.premium) return m.reply(`⚠️ *هذا المستخدم ليس لديه حالة بريميوم نشطة! 👻*`)

    // إزالة البريميوم
    user.premium = false
    user.premiumTime = 0

    // رسالة تأكيد للمستخدم
    await m.reply(
        `💔 *تم سحب حالة البريميوم من ${user.name}~ 👻*\n*نأمل أن ينضم للبريميوم مرة أخرى لاحقًا...*`,
        false,
        { mentions: [who] }
    )

    // إرسال تقرير للقناة الخاصة بالبوت
    let capChannel = `
💔 *تم إلغاء البريميوم* 💔
────────────────────────
🍓 *الاسم: ${user.name}*
📱 *رقم: wa.me/${who.split('@')[0]}*
🗑️ *الحالة: تم سحب البريميوم 👻*
────────────────────────
`.trim()

    await conn.sendMessage('120363335665264747@newsletter', { text: capChannel })

    // توضيح الاستخدام بأسلوب اوغامي كورليوني
    let usage = `
💡 *لتوضيح استخدام الأمر:*  
يمكنك استخدام الأمر \`${usedPrefix + command}\` لسحب البريميوم من مستخدم محدد 👻  

📌 مثال:  
\`${usedPrefix + command} @${m.sender.split('@')[0]}\` (لسحب البريميوم من المستخدم الحالي)

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim()

    await m.reply(usage)
}

handler.help = ['delprem', 'الغاء-بريم', 'الغاء-بريمو', 'امسح-بريم']
handler.tags = ['owner']
handler.command = /^(delp(rem)?|الغاء-بريم|الغاء-بريمو|امسح-بريم)$/i
handler.owner = true

export default handler