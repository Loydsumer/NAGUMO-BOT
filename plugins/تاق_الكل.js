// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  📢 منشن جماعي
//  🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GIF_URL = "https://files.catbox.moe/56k4ua.mp4"

let handler = async (m, { conn, participants, groupMetadata, args, isAdmin, isROwner }) => {

    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }

    if (!m.isGroup) return m.reply("❌ للمجموعات فقط")
    if (!isROwner)  return m.reply("❌ للمطور فقط")

    await react("⏳")

    const botName    = global.botName || "𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓"
    const groupName  = groupMetadata?.subject || "المجموعة"
    const memberList = participants.map(p => p.id || p.jid).filter(Boolean)
    const count      = memberList.length

    // ⏰ التاريخ والوقت
    const now  = new Date()
    const date = now.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
    const time = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })

    // ─── لو في رد على رسالة — منشن مع تحويل الرسالة ─────────────────────────
    const isReply = !!(m.quoted || m.msg?.contextInfo?.quotedMessage)

    if (isReply) {
        await react("📨")
        try {
            const vM = m.quoted?.vM || m.quoted?.fakeObj
            if (vM) {
                await conn.sendMessage(m.chat, {
                    forward:     vM,
                    mentions:    memberList,
                    contextInfo: { mentionedJid: memberList }
                })
            } else {
                // fallback: نص عادي مع منشن
                let text = `📨 *رسالة للجميع*\n\n`
                for (const id of memberList) {
                    text += `⚡ @${id.split("@")[0]}\n`
                }
                text += `\n> 🤖 ${botName}`
                await conn.sendMessage(m.chat, { text, mentions: memberList }, { quoted: m })
            }
        } catch (e) {
            console.error("منشن مع رد:", e.message)
            await react("❌")
            return m.reply("❌ فشل إرسال المنشن مع الرد")
        }
        return await react("✅")
    }

    // ─── منشن عادي مع GIF ────────────────────────────────────────────────────
    const message = args.join(" ") || "📢 منشن جماعي لكل الأعضاء!"

    const text = [
        `🟢🟢🟢 *منشن جماعي* 🟢🟢🟢`,
        ``,
        `📢 ${message}`,
        `🛡️ المجموعة: *${groupName}*`,
        `👥 عدد الأعضاء: *${count}*`,
        `🗓️ التاريخ: ${date}`,
        `🕐 الوقت: ${time}`,
        ``,
        `${"―".repeat(20)}`,
        `💬 منشن فعلي لجميع الأعضاء`,
        ``,
        memberList.map(id => `⚡ @${id.split("@")[0]}`).join("\n"),
        ``,
        `> 🤖 ${botName}`,
    ].join("\n")

    try {
        // إرسال مع GIF
        await conn.sendMessage(m.chat, {
            video:       { url: GIF_URL },
            caption:     text,
            mentions:    memberList,
            gifPlayback: true,
            contextInfo: { mentionedJid: memberList }
        }, { quoted: m })

        await react("📢")

    } catch {
        // fallback بدون GIF
        try {
            await conn.sendMessage(m.chat, {
                text,
                mentions: memberList
            }, { quoted: m })
            await react("📢")
        } catch (e) {
            console.error("منشن:", e.message)
            await react("❌")
            m.reply("❌ فشل الإرسال: " + e.message)
        }
    }
}

handler.help    = ["منشن <رسالة>"]
handler.tags    = ["group"]
handler.command = /^(تاق_الكل|تاقالكل|tagall|تاق|منشن|هيدرا|mentionall)$/i
handler.group   = true
handler.admin   = false
handler.rowner  = true

export default handler
