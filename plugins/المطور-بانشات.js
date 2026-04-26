let handler = async (m, { args, command, usedPrefix }) => {
    let id = args[1] ? args[1] : m.chat
    let chat = global.db.data.chats[id]

    if (args[0]) {
        if (isNaN(args[0])) return m.reply('🍭 *المدخل يجب أن يكون رقمًا فقط! 👻*')
        let jumlahHari = 86400000 * args[0]
        let now = new Date() * 1
        if (now < chat.isBannedTime) chat.isBannedTime += jumlahHari
        else chat.isBannedTime = now + jumlahHari
        chat.isBanned = true
        m.reply(`🍬 *تم حظر هذه المجموعة لمدة ${args[0]} يوم! 👻*`)
    } else {
        chat.isBannedTime = 999
        chat.isBanned = true
        m.reply('🍓 *تم حظر هذه المجموعة بشكل دائم! 👻*')
    }

    // توضيح الاستخدام للمستخدم بأسلوب اوغامي كورليوني
    let usage = `
💡 *لتوضيح استخدام الأمر:*  
يمكنك حظر المجموعة مؤقتًا أو دائمًا باستخدام الأمر \`${usedPrefix + command}\`  

📌 مثال:  
- لحظر المجموعة لمدة 3 أيام: \`${usedPrefix + command} 3\`  
- للحظر الدائم: \`${usedPrefix + command}\`  

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim()

    await m.reply(usage)
}

handler.help = ['banchat', 'بانشات']
handler.tags = ['owner']
handler.command = /^(ban(chat|gc)|بانشات)$/i
handler.owner = true

export default handler