let handler = async (m, { conn, isROwner, isOwner }) => {
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
    }

    // ━━━ التأكد أن الأمر في مجموعة ━━━
    if (!m.isGroup) {
        await react('❌')
        return m.reply('❌ *هذا الأمر يستخدم فقط في المجموعات*')
    }

    // ━━━ التأكد أن المستخدم هو مطور البوت فقط ━━━
    if (!isROwner && !isOwner) {
        await react('❌')
        return m.reply('❌ *هذا الأمر للمطور فقط* 🐤👋')
    }

    await react('👋')

    // ━━━ جلب اسم المجموعة ━━━
    let groupName = m.chat
    try {
        const metadata = await conn.groupMetadata(m.chat)
        groupName = metadata.subject || m.chat
    } catch (err) {
        console.error('Error getting group name:', err)
    }

    // ━━━ رسالة الوداع قبل المغادرة ━━━
    const goodbyeMsg = `🐤 *مع السلامة* 👋\n\n📌 *من مجموعة:* ${groupName}\n👑 *تم الطرد بواسطة:* مطور البوت\n\n> *وداعاً!* 🐤👋`

    await conn.sendMessage(m.chat, { text: goodbyeMsg })

    // ━━━ المغادرة ━━━
    await conn.groupLeave(m.chat)
    console.log(`✅ Bot left group: ${groupName}`)
}

handler.help = ['اطلع']
handler.tags = ['owner']
handler.command = /^(اطلع|غادر|leave|exit)$/i
handler.group = true
handler.rowner = true

export default handler