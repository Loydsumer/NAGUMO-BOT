import yts from 'yt-search'
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply([
    `🎬 *تحميل فيديو يوتيوب*`,
    ``,
    `▸ ابحث بالاسم: \`.ytv اسم الفيديو\``,
    `▸ رابط مباشر: \`.ytv https://youtu.be/xxx\``,
  ].join('\n'))

  try {
    let video, url

    if (text.includes("youtube.com") || text.includes("youtu.be")) {
      const id     = text.includes("v=") ? text.split("v=")[1].split("&")[0] : text.split("/").pop()
      const search = await yts({ videoId: id })
      if (!search) throw new Error("لم أجد الفيديو")
      video = search
      url   = text
    } else {
      const search = await yts(text)
      if (!search?.videos?.length) return m.reply("❌ لم أجد أي نتائج")
      video = search.videos[0]
      url   = video.url
    }

    const caption = [
      `🎬 *${video.title}*`,
      ``,
      `📺 ${video.author?.name || 'غير معروف'}`,
      `⏱️ ${video.timestamp}`,
      `👁️ ${Number(video.views || 0).toLocaleString()} مشاهدة`,
      ``,
      `🎚️ *اختار جودة الفيديو:*`
    ].join('\n')

    const buttons = [
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎬 144p',  id: `.ytv-dl 144 ${url}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📱 360p',  id: `.ytv-dl 360 ${url}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📺 720p',  id: `.ytv-dl 720 ${url}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 صوت MP3', id: `.ytv-dl mp3 ${url}` }) },
    ]

    // صورة مصغرة
    let imgMsg
    try {
      imgMsg = await prepareWAMessageMedia(
        { image: { url: video.thumbnail } },
        { upload: conn.waUploadToServer }
      )
    } catch {}

    const message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body:   proto.Message.InteractiveMessage.Body.create({ text: caption }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: !!(imgMsg?.imageMessage),
              imageMessage: imgMsg?.imageMessage || null
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons })
          })
        }
      }
    }

    const msg = generateWAMessageFromContent(m.chat, message, { userJid: conn.user.jid })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('ytvideo:', e)
    m.reply("❌ حصل خطأ: " + e.message)
  }
}

handler.help    = ['يوتيوب <اسم أو رابط>']
handler.tags    = ['downloader']
handler.command = /^(يوتيوب|فيديو_يوتيوب|ytfideo)$/i
export default handler


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// أمر التحميل الفعلي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━