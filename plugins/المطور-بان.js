let handler = async (m, { conn, args, usedPrefix, command }) => {
    // تحديد المستخدم المستهدف
    let who = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted ? m.quoted.sender 
        : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
        : false

    if (!who) return m.reply(`🍩 *ضع تاغ للمستخدم أو أدخل رقمه أولاً! 👻*\n\n🍡 *مثال:*\n${usedPrefix + command} @${m.sender.split('@')[0]} 4`, false, { mentions: [m.sender] })

    if (!global.db.data.users[who]) global.db.data.users[who] = {}
    let user = global.db.data.users[who]

    // حظر مؤقت إذا تم تحديد عدد الأيام
    if (args[1]) {
        if (isNaN(args[1])) return m.reply('🍮 *المدخل يجب أن يكون رقمًا فقط، لا أحرف! 👻*')
        let jumlahHari = 86400000 * args[1] // تحويل الأيام إلى ميلي ثانية
        let now = new Date() * 1
        if (now < user.bannedTime) user.bannedTime += jumlahHari
        else user.bannedTime = now + jumlahHari
        user.banned = true

        // إشعار المجموعة والمستخدم
        m.reply(`🧁 *تم حظر @${who.split('@')[0]} لمدة ${args[1]} يوم! 👻*`, false, { mentions: [who] })
        m.reply(`🍬 *لقد تم حظرك بواسطة المالك لمدة ${args[1]} يوم! 👻*`, who)
    } else { // حظر دائم
        user.bannedTime = 999
        user.banned = true
        m.reply(`🍫 *تم حظر @${who.split('@')[0]} بشكل دائم! 👻*`, false, { mentions: [who] })
        m.reply(`🍧 *لقد تم حظرك بواسطة المالك بشكل دائم! 👻*`, who)
    }

    // توضيح الاستخدام للمستخدم بأسلوب اوغامي كورليوني
    let usage = `
💡 *لتوضيح استخدام الأمر:*  
يمكنك حظر المستخدم مؤقتًا أو دائمًا باستخدام الأمر \`${usedPrefix + command}\`  

📌 مثال:  
- لحظر المستخدم لمدة 4 أيام: \`${usedPrefix + command} @user 4\`  
- للحظر الدائم: \`${usedPrefix + command} @user\`  

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim()

    await m.reply(usage)
}

handler.help = ['banned', 'بان']
handler.tags = ['owner']
handler.command = /^(ban(user)?|banned(user)?|بان)$/i
handler.owner = true
handler.register = true

export default handler