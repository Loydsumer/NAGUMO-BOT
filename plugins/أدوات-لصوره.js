let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) {
        return conn.reply(m.chat, `👻 *عليك أن تقتبس ملصقاً (sticker) حتى أحوله إلى صورة، يا صديقي.*\n\n❖ مثال على الاستخدام:\n${usedPrefix + command} (وأنت مقتبس ملصق)\n\nلا تجعلني أكرر نفسي...`, m)
    }

    await m.react('🕒')

    let xx = m.quoted
    let imgBuffer = await xx.download()

    if (!imgBuffer) {
        await m.react('✖️')
        return conn.reply(m.chat, `👻 *لم أستطع تحميل الملصق، ربما هناك خلل... أو أنك لم تقتبس ملصقاً فعلاً.*`, m)
    }

    await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: `👻 *ها هي صورتك كما طلبت...*\n\n❖ لا تنسَ من قدم لك هذا المعروف.`,
    }, { quoted: m })

    await m.react('✔️')
}

handler.help = ['toimg', 'jpg', 'img', 'لصوره', 'لصورة']
handler.tags = ['tools']
handler.command = ['toimg', 'jpg', 'img', 'لصوره', 'لصورة'] 

handler.register = true // إن أردت جعله للمستخدمين المسجلين فقط

// توقيع كورليوني
handler.footer = 'ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻'

export default handler