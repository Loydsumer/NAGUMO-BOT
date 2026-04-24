let handler = async (m, { conn, usedPrefix, text }) => {
    if (!m.quoted) throw '🧞 *يجب عليك الرد على رسالة لإضافة تفاعل!*'
    if (text.length > 2) throw '🧞 *يُسمح فقط بإرسال إيموجي واحد!*'
    if (!text) throw `🧞 *طريقة الاستخدام:* \n📍 مثال: ${usedPrefix}تفاعل 🗿`

    conn.relayMessage(m.chat, {
        reactionMessage: {
            key: {
                id: m.quoted.id,
                remoteJid: m.chat,
                fromMe: true
            },
            text: `${text}`
        }
    }, { messageId: m.id })

    m.reply(`🧞 *تم إرسال التفاعل بنجاح!* 🆅🅸🆃🅾 🅱🅾🆃🧞`)
}

handler.help = ['تفاعل', 'react']
handler.tags = ['أدوات']
handler.command = /^(تفاعل|react)$/i

export default handler