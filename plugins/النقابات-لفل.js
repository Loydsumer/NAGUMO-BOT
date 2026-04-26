import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

const imagen1 = 'https://n.uguu.se/UDKnJnhh.jpg'

let handler = async (m, { conn, command }) => {
    let who = m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.fromMe
        ? conn.user.jid
        : m.sender

    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => imagen1)
    
    let user = global.db.data.users[who] || (global.db.data.users[who] = {
        premium: false,
        level: 0,
        cookies: 0,
        exp: 0,
        lastclaim: 0,
        registered: false,
        regTime: -1,
        age: 0,
        role: '⭑ مبتدئ ⭑'
    })

    let { premium, level, exp, registered, role } = user
    let username = await conn.getName(who)

    // دمج الرسالة الأولية مع النص النهائي
    let noprem = `
🤖〘 *نظام السحر* 〙📖

🤖 جاري تحليل الطاقة السحرية...
🤖 فحص كتاب الغريموار...
🤖 مزامنة مع طاقة المستخدم...

✨✨✨ 🤖 *تم التفعيل* 🤖 ✨✨✨

*تم فتح الغريموار بنجاح...*

🤖 『 غريموار بسيط 』📕

🤖 *الاسم:* ${username}
🤖 *المعرف:* @${who.replace(/@.+/, '')}
🤖 *مسجل:* ${registered ? '✅ نعم' : '❌ لا'}

🤖 *معلومات سحرية:*
⚡ *المستوى:* ${level}
✨ *الخبرة:* ${exp}
📈 *الرتبة:* ${role}
💠 *مميز:* ❌ لا

📘 *الكتاب:* غريموار عادي من صفحة واحدة
🔒 *العنصر:* غير معروف

🤖 استمر في التطوير لتفتح قوى جديدة...

🅾🅶🅰🅼🅸 🅱🅾🆃
`.trim()

    let prem = `
🤖〘 *نظام السحر* 〙📖

🤖 جاري تحليل الطاقة السحرية...
🤖 فحص كتاب الغريموار...
🤖 مزامنة مع طاقة المستخدم...

✨✨✨ 🤖 *تم التفعيل* 🤖 ✨✨✨

*تم فتح الغريموار بنجاح...*

🤖〘 𝐄𝐋𝐈𝐓𝐄 𝐌𝐎𝐃𝐄: *مُفعل* 〙🤖

🤖 『 غريموار أسطوري - ٥ صفحات 』☯️

🤖 *الاسم:* ${username}
🤖 *المعرف:* @${who.replace(/@.+/, '')}
🤖 *مسجل:* ${registered ? '✅ نعم' : '❌ لا'}
👑 *الرتبة:* 🟣 *أسطورة شيطانية*

🤖 *الطاقة السحرية:*
⚡ *المستوى:* ${level}
🌟 *الخبرة:* ${exp}
🪄 *الرتبة:* ${role}
💠 *مميز:* ✅ مفعل

📕 *الكتاب:* غريموار مكافحة السحر ٥ صفحات
🔥 *الوضع:* ✦ *التحول المظلم*
🧩 *العنصر:* سيف شيطاني & مكافحة السحر

📜 *مهارة مفعلة:* 
❖ 「⚡ الأسطورة السوداء ⚡」
↳ تسبب ضرر كبير للأعداء.

🤖 هذا المستخدم تخطى حدوده... ⚔️

🅾🅶🅰🅼🅸 🅱🅾🆃
`.trim()

    // تحديد النص النهائي حسب حالة البريميوم
    let finalText = premium ? prem : noprem

    // إرسال الصورة مع النص الكامل دفعة واحدة
    await conn.sendFile(
        m.chat,
        pp,
        'grimorio.jpg',
        finalText,
        m,
        undefined,
        { mentions: [who] }
    )
}

handler.help = ['profile', 'لفل', 'مهاراتي', 'قدراتي']
handler.tags = ['xp']
handler.command = ['profile', 'perfil', 'لفل', 'مهاراتي', 'قدراتي']
handler.register = true
handler.group = true

export default handler