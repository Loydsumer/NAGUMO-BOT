// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🏓 أمر البنج — قياس سرعة الاستجابة
//  🤖 𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let handler = async (m, { conn }) => {
    const start = Date.now()

    // بعت رسالة أولى ونقيس الوقت
    const sent = await conn.sendMessage(m.chat, {
        text: "🏓 جاري القياس..."
    }, { quoted: m })

    const ping = Date.now() - start

    // تحديد الحالة بناءً على السرعة
    const status =
        ping < 300  ? "⚡ ممتاز"   :
        ping < 600  ? "✅ جيد"     :
        ping < 1000 ? "🟡 مقبول"  :
                      "🔴 بطيء"

    const text = [
        `╔═══「 🏓 بنج 」═══╗`,
        `│`,
        `│ ${status}`,
        `│ ⏱️ الاستجابة: ${ping} ms`,
        `│`,
        `│ 🤖 ${global.botName || '𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊'}`,
        `╚══════════════════════╝`,
    ].join("\n")

    // عدّل الرسالة الأولى بالنتيجة
    await conn.sendMessage(m.chat, {
        text,
        edit: sent.key
    }).catch(() =>
        // لو edit مش مدعوم — بعت رسالة جديدة
        conn.sendMessage(m.chat, { text }, { quoted: m })
    )
}

handler.help    = ["بنج", "ping"]
handler.tags    = ["info"]
handler.command = /^(بنج|ping|بينج|pong)$/i

export default handler