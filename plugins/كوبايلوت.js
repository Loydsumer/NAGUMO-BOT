// • Feature : copiolot ai (3 models) 
// • Developers : izana x radio
// • Channel : https://whatsapp.com/channel/0029VbB2Uwg11ulIMA9bfq2c
import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args.length)
      throw new Error(`استخدم الأمر هكذا:\n${usedPrefix}${command} [model اختياري] <النص>\n\n📍 النماذج المتاحة:\n- default\n- gpt-5\n- think-deeper`)

    // استخراج الموديل والنص
    let models = ["default", "gpt-5", "think-deeper"]
    let model = "default"
    let prompt = args.join(" ")

    if (models.includes(args[0])) {
      model = args[0]
      prompt = args.slice(1).join(" ")
    }

    if (!prompt) throw new Error(`⚠️ يرجى كتابة نص بعد اسم النموذج.`)

    // إرسال رسالة انتظار
    await conn.sendMessage(m.chat, {
      text: "⏳ جاري جلب الرد من Copilot AI ...",
    })

    // جلب الرد من API
    const res = await fetch(`https://dark-api-x.vercel.app/api/v1/ai/copilot?prompt=${encodeURIComponent(prompt)}&model=${model}`)
    const data = await res.json()

    if (!data.status) throw new Error("❌ فشل في الحصول على الرد من الخادم.")

    // إرسال الرد
    let replyMsg = `🤖 *Copilot AI (${data.model})*\n\n${data.response}\n\n> 𝑆𝐻𝛩𝐷𝛩𝑊 𝐵𝛩𝑇`

    await conn.sendMessage(m.chat, {
      text: replyMsg,
      contextInfo: {
        externalAdReply: {
          title: `Copilot • ${data.model}`,
          body: "ذكاء اصطناعي متطور من Microsoft Copilot",
          thumbnailUrl: "https://raw.githubusercontent.com/RADIOdemon6-alt/uploads/main/uploads/6cf69aced4-file_1761850678390.jpg",
          sourceUrl: "https://dark-api-x.vercel.app",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })

  } catch (err) {
    await conn.sendMessage(m.chat, {
      text: `❌ حدث خطأ:\n${err.message}`,
    })
  }
}

handler.help = ["copilot <model> <prompt>"]
handler.tags = ["ai"]
handler.command = ["كوبايلوت"]

export default handler