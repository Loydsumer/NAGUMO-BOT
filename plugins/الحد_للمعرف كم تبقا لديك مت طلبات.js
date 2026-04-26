// 📌 ملف عرض حدود المستخدم (limit.js)
// ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻

let handler = async (m, { conn, command }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    else who = m.sender

    const user = global.db.data.users[who]
    if (typeof user == 'undefined') return m.reply(`
👻 ⚠️ المستخدم غير موجود في قاعدة البيانات!  
💡 مثال: \`.${command}\`  
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim())

    const isMods = [conn.decodeJid(global.conn.user.id), ...global.config.owner.filter(([number, _, isDeveloper]) => number && isDeveloper).map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(who)
    const isOwner = m.fromMe || isMods || [conn.decodeJid(global.conn.user.id), ...global.config.owner.filter(([number, _, isDeveloper]) => number && !isDeveloper).map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(who)
    const isPrems = isOwner || new Date() - user.premiumTime < 0

    m.reply(`
👻 *・゜・🍓 حالة الحدود الخاصة بك 🍓・゜・*
────────────────────
🍬 *الاسم:* ${user.registered ? user.name : await conn.getName(who)}
🧁 *الحالة:* ${isMods ? '🌸 مطور' : isOwner ? '👑 مالك' : isPrems ? '💖 بريميوم' : user.level > 999 ? '🌟 مستخدم نجم' : '🍭 مستخدم عادي'}
🍩 *الحد:* ${isPrems ? 'غير محدود' : user.limit + ' / 1000'}
🍡 *الأوامر المتبقية:* ${isPrems ? 'غير محدود' : (user.commandLimit - user.command) + ' / ' + user.commandLimit}
🍰 *إجمالي الاستخدام:* ${user.command + user.commandTotal}
────────────────────
✨ *استخدم حدودك بحكمة يا صديقي~*  
💡 مثال: \`.${command}\`  
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim())
}

// 📝 أوامر إنجليزية + عربية
handler.help = ['limit', 'الحد']
handler.tags = ['xp']
handler.command = /^limit$|^الحد$/i
handler.register = true

export default handler