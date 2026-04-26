import moment from 'moment-timezone'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // تحديد المستخدم
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] 
            : m.quoted ? m.quoted.sender 
            : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
            : false
    if (!who) return m.reply(`🍓 *أدخل رقم أو ضع تاغ للشخص أولاً!*\n\nمثال: ${usedPrefix + command} @user 7\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)

    // التحقق من تسجيل المستخدم
    if (!global.db.data.users[who]) return m.reply(`🚫 *المستخدم غير مسجل! سجل أولاً باستخدام* ${usedPrefix}daftar\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
    
    let user = global.db.data.users[who]
    let txt = args[1]

    // التحقق من إدخال عدد الأيام
    if (!txt) return m.reply(`🍰 *أدخل عدد أيام البريميوم يا صديقي*\n\nمثال: ${usedPrefix + command} @user 7\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
    if (isNaN(txt)) return m.reply(`🥺 *العدد يجب أن يكون رقم!* مثال: ${usedPrefix + command} @user 7\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)

    // حساب مدة البريميوم
    let jumlahHari = 86400000 * txt
    let now = new Date() * 1
    user.premiumTime = now < user.premiumTime ? user.premiumTime + jumlahHari : now + jumlahHari
    user.premium = true

    // حساب الوقت المتبقي
    let timers = user.premiumTime - now
    let sisaJam = Math.floor(timers / 3600000) % 24
    let sisaMenit = Math.floor(timers / 60000) % 60
    let sisaDetik = Math.floor(timers / 1000) % 60
    let countdown = `${Math.floor(timers / 86400000)} يوم ${sisaJam} ساعة ${sisaMenit} دقيقة ${sisaDetik} ثانية`

    // رسالة المستخدم بصيغة شخصية اوغامي كورليوني
    let capUser = `
🎀 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗔𝗖𝗧𝗜𝗩!* 🎀
────────────────────────
🍓 *الاسم: ${user.name}*
🧁 *المدة: ${txt} يوم*
⏳ *الوقت المتبقي: ${countdown}*
────────────────────────
🌷 استمتع بمميزاتنا الخاصة، ولا تنسى، القوة تكمن في السيطرة.
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`.trim()

    // إرسال الرسالة للمستخدم
    await conn.sendMessage(who, { text: capUser }, { quoted: m })
    await delay(1000)
    await m.reply(`🍨 *تم تفعيل البريميوم للمستخدم ${user.name} لمدة ${txt} يوم بنجاح!* ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
}

handler.help = ['addprem', 'بريم', 'بريمو', 'اضف-بريم']
handler.tags = ['owner']
handler.command = /^(add(prem|premium)|بريم|بريمو|اضف-بريم)$/i
handler.owner = true

export default handler

const delay = time => new Promise(res => setTimeout(res, time))