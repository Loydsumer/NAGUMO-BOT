// ✨ كود مخصص لتحميل الصوت فقط بالأمر .صوت 🤖
import fetch from "node-fetch"
import yts from "yt-search"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text || !text.trim()) {
      return conn.sendMessage(m.chat, {
        text: `🤖 *الاستخدام الصحيح:*\n${command} <رابط أو اسم الفيديو>\n\n📌 مثال:\n${command} رابح صقر - الصمت`,
        quoted: m
      })
    }

    await m.react("🔍")

    const videoIdMatch = text.match(youtubeRegexID)
    const searchQuery = videoIdMatch ? `https://youtu.be/${videoIdMatch[1]}` : text
    let result = await yts(searchQuery)

    if (videoIdMatch) {
      const videoId = videoIdMatch[1]
      result = result.all.find(v => v.videoId === videoId) || result.videos.find(v => v.videoId === videoId)
    } else {
      result = result.videos?.[0] || result.all?.[0] || result
    }

    if (!result) {
      return conn.sendMessage(m.chat, {
        text: "🤖 لم أتمكن من العثور على أي نتيجة، جرب باسم آخر.",
        quoted: m
      })
    }

    const { title, url } = result

    try {
      const api = await (await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)).json()
      const audioUrl = api.result?.download?.url
      if (!audioUrl) throw "🤖 لم يتمكن البوت من جلب رابط الصوت."

      await conn.sendMessage(m.chat, {
        audio: { url: audioUrl },
        fileName: `${api.result.title || "تحميل"}.mp3`,
        mimetype: "audio/mpeg",
        ptt: true
      }, { quoted: m })

      await m.react("✅")

    } catch (err) {
      return conn.sendMessage(m.chat, {
        text: "🤖 حدث خطأ أثناء تجهيز الصوت. جرب رابط أو عنوان آخر.",
        quoted: m
      })
    }

  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `💥 وقع خطأ غير متوقع:\n> \`${error.message || error}\``,
      quoted: m
    })
    await m.react("❌")
  }
}

handler.command = handler.help = ["صوت"]
handler.tags = ["downloader"]
export default handler