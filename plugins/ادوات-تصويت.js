let handler = async (m, { conn, text, usedPrefix, command }) => {
    let commandText = command.includes('poll') || command.includes('تصويت') ? 'تصويت' : 'استطلاع رأي'

    text = text.split(`|`)
    if (!text || text.length == 1) throw `🤖 *طريقة الاستخدام:*\n- أرسل الأمر *\`${usedPrefix + command} <السؤال>|<الخيار الأول>|<الخيار الثاني>|...*\` \n\n🤖 *مثال:*\n\`${usedPrefix + command} ما رأيك في هذا البوت؟|ممتاز|جيد|متوسط|سيئ\``
    if (text.length < 3) throw `🤖 *يجب إدخال خيارين على الأقل للتصويت!*`
    if (text.length > 13) throw `🤖 *عدد الخيارات كبير جدًا، الحد الأقصى هو 12!*`

    let options = text.slice(1) // استخراج الخيارات
    await conn.sendPoll(m.chat, text[0], options) // إرسال التصويت

    conn.reply(m.chat, `🤖 *تم إنشاء ${commandText} بنجاح!*\n\n𝒁𝑶𝑹𝑶 𝑩𝑶𝑻 𝚅¹🤖`, m)
}

handler.help = ['poll', 'تصويت']
handler.tags = ['group']
handler.command = /^(poll|createpoll|polling|تصويت)$/i
handler.group = true

export default handler