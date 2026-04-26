import axios from "axios"
import crypto from "crypto"

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("⚠️ اكتب الوصف بعد الأمر.\nمثال:\n.sora ارسم لي مشهد سيرا عن فتاة تمشي في المطر")

  await m.reply("⏳ *جاري إنشاء الفيديو باستخدام Sora AI...*")

  try {
    // 🔹 إعداد API
    const api = axios.create({
      baseURL: 'https://api.bylo.ai/aimodels/api/v1/ai',
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "user-agent": "Mozilla/5.0",
        uniqueId: crypto.randomUUID().replace(/-/g, '')
      }
    })

    // 🔹 إرسال الطلب
    const { data: task } = await api.post("/video/create", {
      prompt: text,
      channel: "SORA2",
      pageId: 536,
      source: "bylo.ai",
      watermarkFlag: true,
      privateFlag: true,
      isTemp: true,
      vipFlag: true,
      model: "sora_video2",
      videoType: "text-to-video",
      aspectRatio: "portrait" // ✅ الوضع الافتراضي كما طلبت
    })

    // 🔁 الانتظار للنتيجة
    let resultUrl = null
    for (let i = 0; i < 25; i++) { // 25 محاولة = ~25 ثانية
      await new Promise(res => setTimeout(res, 2000))
      const { data: status } = await api.get(`/${task.data}?channel=SORA2`)
      if (status?.data?.state > 0) {
        const fullData = JSON.parse(status.data.completeData)
        resultUrl = fullData?.videoUrl || fullData?.url
        break
      }
    }

    if (!resultUrl) throw new Error("⚠️ لم يتم استلام الفيديو — حاول بوصف مختلف")

    // 🎯 إرسال الرابط فقط كما طلبت
    await conn.sendMessage(m.chat, { text: `🎬 *Video Link:* ${resultUrl}` })

  } catch (err) {
    console.error(err)
    await m.reply(`❌ فشل إنشاء الفيديو:\n${err.message}`)
  }
}

handler.help = ['sora <وصف>']
handler.tags = ['ai', 'video']
handler.command = /^sora$/i

export default handler