import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let pendingReports = {}

let handler = async (m, { conn }) => {
  await m.react('🦋')

  const devNumber = "4917672339436@s.whatsapp.net"

  // نمسك كل شيء بعد كلمة "ابلاغ"
  let reportText = m.text.replace(/^(\.|\!)?ابلاغ/i, "").trim()

  // لو ما كتبش مشكلة
  if (!reportText) {
    await conn.sendMessage(m.chat, {
      text: "🦋 اكتب هكذا: `ابلاغ مشكلتك هنا`\nلكي أرسلها للمطور 💌"
    }, { quoted: m })
    return
  }

  // نخزن البلاغ مؤقتاً
  pendingReports[m.sender] = reportText

  const textMsg = `مرحباً @${m.sender.split('@')[0]} 🦋\n\nتم حفظ مشكلتك ✅\nاختر ما تريد فعله:\n❀ نظام البلاغات ❀`

  const interactiveMessage = {
    body: { text: textMsg },
    footer: { text: "❀ نظام البلاغات ❀" },
    nativeFlowMessage: {
      buttons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "🦋 ارسال البلاغ 🦋"
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "🦋 إلغاء 🦋"
          })
        }
      ]
    }
  }

  let msg = generateWAMessageFromContent(
    m.chat,
    { viewOnceMessage: { message: { interactiveMessage } } },
    { userJid: conn.user.jid, quoted: m }
  )

  // هنا المنشن الحقيقي
  await conn.relayMessage(
    m.chat, 
    msg.message, 
    { messageId: msg.key.id, mentions: [m.sender] }
  )
}

handler.command = /^ابلاغ/i
export default handler

// مراقبة ردود الأزرار
handler.before = async (m, { conn }) => {
  const devNumber = "4917672339436@s.whatsapp.net"

  if (!m.text) return
  const choice = m.text.trim()

  // زر "ارسال البلاغ"
  if (choice === "🦋 ارسال البلاغ 🦋" && pendingReports[m.sender]) {
    const report = pendingReports[m.sender]

    await conn.sendMessage(devNumber, {
      text: `📢 *بلاغ جديد* 🦋\n\n👤 المرسل: @${m.sender.split('@')[0]}\n\n💌 البلاغ:\n${report}`,
      mentions: [m.sender] // ← هنا المنشن يوصل للمطور
    })

    await conn.sendMessage(m.chat, { text: "✅ تم إرسال بلاغك للمطور بنجاح 🦋" }, { quoted: m })
    delete pendingReports[m.sender]
  }

  // زر "إلغاء"
  if (choice === "🦋 إلغاء 🦋" && pendingReports[m.sender]) {
    await conn.sendMessage(m.chat, { text: "❌ تم إلغاء إرسال البلاغ 🦋" }, { quoted: m })
    delete pendingReports[m.sender]
  }
}