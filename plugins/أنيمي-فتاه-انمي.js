let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // 👻 تحديد الرسالة بناء على الأمر المستخدم
        let commandInfo = {
            'ba': { name: 'فتاه-انمي', desc: 'صور عشوائية من بلو أرشيف' },
            'bluearchive': { name: 'فتاه-انمي', desc: 'صور عشوائية من بلو أرشيف' },
            'فتاه-انمي': { name: 'فتاه-انمي', desc: 'صور عشوائية من بلو أرشيف' },
            'انمي-فتاه': { name: 'انمي-فتاه', desc: 'صور عشوائية من بلو أرشيف' }
        }

        let currentCommand = commandInfo[command] || { name: 'فتاه-انمي', desc: 'صور عشوائية من بلو أرشيف' }

        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

        await conn.sendMessage(m.chat, { 
            image: { url: 'https://api.nekolabs.my.id/random/blue-archive' }, 
            caption: `👻 *${currentCommand.name}* 🎨\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻\n\n👻 *طريقة الاستخدام:*\n╰─⊶ *${usedPrefix}فتاه-انمي*` 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply(`👻 *يا رفيقي* ⚠️\n\nالمشكلة في السيرفر\nجرب مرة ثانية بعد شوي`)
    }
}

handler.help = ['ba', 'bluearchive', 'فتاه-انمي', 'انمي-فتاه']
handler.command = ['ba', 'bluearchive', 'فتاه-انمي', 'انمي-فتاه']
handler.tags = ['random', 'anime']

export default handler