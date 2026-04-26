let handler = async (m, { conn, text }) => {
    let [l, r] = text.split`|`
    if (!l) l = ''
    if (!r) r = ''

    let message = `🧞‍♀️ *طريقة الاستخدام:*\n`
    message += `🧞‍♀️ أرسل الأمر متبوعًا بالنص الذي تريد إخفاء جزء منه، باستخدام الرمز "|".\n`
    message += `🧞‍♀️ *مثال:*  \n`
    message += `🧞‍♀️ \`/سبويلر هذا النص ظاهر | وهذا النص مخفي\`\n\n`
    message += `🧞‍♀️ سيتم إخفاء الجزء الثاني، ولن يظهر إلا عند الضغط على "Read More".\n\n`
    message += ` ${l}${readMore}${r}\n\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`
    
    conn.reply(m.chat, message, m)
}

handler.help = ['سبويلر', 'إخفاء-نص', 'قراءة-المزيد', 'readmore', 'spoiler']
handler.tags = ['أدوات']
handler.command = /^(سبويلر|إخفاء-نص|قراءة-المزيد|spoiler|hidetext|readmore|selengkapnya)$/i

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)