// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🎬 أمر اديت - بحث عن اديتات شخصيات
//  من تيك توك بالاسم (كاروسيل)
//  🤖 𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch"
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from "@whiskeysockets/baileys"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const chat = m.chat

  // ─── لو مفيش اسم ─────────────────────
  if (!args[0]) {
    await conn.sendMessage(chat, { react: { text: "❌", key: m.key } })
    return m.reply(
      `╭─── 🎬 *بحث اديتات* ───╮
│
│ 🔍 ابحث عن اديتات لأي شخصية
│ من تيك توك مباشرة
│
│ *الاستخدام:*
│ ${usedPrefix}${command} <اسم الشخصية>
│
│ *أمثلة:*
│ ${usedPrefix}${command} ناروتو
│ ${usedPrefix}${command} gojo
│ ${usedPrefix}${command} itachi
│ ${usedPrefix}${command} eren
│ ${usedPrefix}${command} levi ackerman
│
╰─── 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓───╯`
    )
  }

  const characterName = args.join(" ")
  const searchQuery = `${characterName} edit`

  await conn.sendMessage(chat, { react: { text: "🔍", key: m.key } })
  await m.reply(`🔍 جاري البحث عن اديتات *${characterName}*...`)

  try {
    // ─── البحث في تيك توك ────────────────
    const videos = await searchTikTok(searchQuery)

    if (!videos || videos.length === 0) {
      await conn.sendMessage(chat, { react: { text: "❌", key: m.key } })
      return m.reply(
        `❌ ما لقيت اديتات لـ *${characterName}*\n\nجرب اسم ثاني أو بالإنجليزي 🔄`
      )
    }

    // ─── محاولة إرسال كاروسيل ───────────
    let carouselSent = false

    try {
      await sendCarousel(conn, chat, m, characterName, videos)
      carouselSent = true
    } catch (carouselErr) {
      console.log(
        "⚠️ Carousel failed, sending individually:",
        carouselErr.message
      )
    }

    // ─── لو الكاروسيل فشل: ارسل فيديوهات منفصلة ──
    if (!carouselSent) {
      await sendIndividualVideos(conn, chat, m, characterName, videos)
    }

    await conn.sendMessage(chat, { react: { text: "✅", key: m.key } })
  } catch (err) {
    console.error("❌ Edit Search Error:", err)
    await conn.sendMessage(chat, { react: { text: "❌", key: m.key } })
    m.reply(`❌ فشل البحث!\n\n${err.message}`)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🔍 دالة البحث في تيك توك
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchTikTok(query) {
  // ─── API 1: tikwm.com (POST) ──────────
  try {
    const res = await fetch("https://www.tikwm.com/api/feed/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      body: `keywords=${encodeURIComponent(query)}&count=10&cursor=0&HD=1`,
    })
    const json = await res.json()

    if (json.code === 0 && json.data?.videos?.length) {
      return json.data.videos.map((v) => ({
        title: v.title || "اديت 🎬",
        videoUrl: v.hdplay || v.play,
        cover: v.cover || v.origin_cover || "",
        author: v.author?.nickname || "غير معروف",
        username: v.author?.unique_id || "",
        duration: v.duration || 0,
        likes: v.digg_count || 0,
        comments: v.comment_count || 0,
        shares: v.share_count || 0,
        plays: v.play_count || 0,
      }))
    }
  } catch (e) {
    console.error("tikwm search error:", e.message)
  }

  // ─── API 2: tikwm.com (GET) ───────────
  try {
    const res2 = await fetch(
      `https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=10&cursor=0&HD=1`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    )
    const json2 = await res2.json()

    if (json2.code === 0 && json2.data?.videos?.length) {
      return json2.data.videos.map((v) => ({
        title: v.title || "اديت 🎬",
        videoUrl: v.hdplay || v.play,
        cover: v.cover || v.origin_cover || "",
        author: v.author?.nickname || "غير معروف",
        username: v.author?.unique_id || "",
        duration: v.duration || 0,
        likes: v.digg_count || 0,
        comments: v.comment_count || 0,
        shares: v.share_count || 0,
        plays: v.play_count || 0,
      }))
    }
  } catch (e) {
    console.error("tikwm GET search error:", e.message)
  }

  return null
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🎠 إرسال كاروسيل (Carousel)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function sendCarousel(conn, chat, m, characterName, videos) {
  const selectedVideos = videos.slice(0, 5)

  // ─── رفع الفيديوهات وإنشاء الكاردات ──
  const cards = await Promise.all(
    selectedVideos.map(async (video, index) => {
      const { videoMessage } = await generateWAMessageContent(
        { video: { url: video.videoUrl } },
        { upload: conn.waUploadToServer }
      )

      return {
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `❤️ ${formatNum(video.likes)} | 💬 ${formatNum(video.comments)} | 👁️ ${formatNum(video.plays)}`,
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: `👤 ${video.author} ${video.username ? `(@${video.username})` : ""} | ⏱️ ${video.duration}s`,
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title:
            video.title.length > 60
              ? video.title.substring(0, 57) + "..."
              : video.title,
          hasMediaAttachment: true,
          videoMessage: videoMessage,
        }),
        nativeFlowMessage:
          proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [],
          }),
      }
    })
  )

  // ─── إنشاء رسالة الكاروسيل ───────────
  const msg = generateWAMessageFromContent(
    chat,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage:
            proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `🎬 *اديتات:* ${characterName}\n📊 تم العثور على ${selectedVideos.length} اديت`,
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "🤖 𝙽𝚒𝚔𝚘𝚕𝚊 𝚃𝚎𝚜𝚕𝚊 | TikTok Edits",
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false,
              }),
              carouselMessage:
                proto.Message.InteractiveMessage.CarouselMessage.fromObject(
                  {
                    cards,
                  }
                ),
            }),
        },
      },
    },
    { quoted: m }
  )

  // ─── إرسال الكاروسيل ──────────────────
  await conn.relayMessage(chat, msg.message, {
    messageId: msg.key.id,
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  📹 إرسال فيديوهات منفصلة (Fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function sendIndividualVideos(conn, chat, m, characterName, videos) {
  const selectedVideos = videos.slice(0, 3)
  const total = selectedVideos.length

  for (let i = 0; i < total; i++) {
    const video = selectedVideos[i]

    const caption = `╭─── 🎬 *اديت ${characterName}* (${i + 1}/${total}) ───╮
│
│ 📝 ${video.title}
│ 👤 ${video.author} ${video.username ? `(@${video.username})` : ""}
│ ⏱️ ${video.duration} ثانية
│
│ ❤️ ${formatNum(video.likes)}  💬 ${formatNum(video.comments)}
│ 🔄 ${formatNum(video.shares)}  👁️ ${formatNum(video.plays)}
│
╰─── 🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 ───╯`

    await conn.sendMessage(
      chat,
      {
        video: { url: video.videoUrl },
        caption,
        mimetype: "video/mp4",
      },
      { quoted: m }
    )

    // ─── تأخير بسيط بين الفيديوهات ─────
    if (i < total - 1) {
      await delay(2000)
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  أدوات مساعدة
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function formatNum(n) {
  if (!n) return "0"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toString()
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  إعدادات الأمر
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
handler.help = ["اديت <اسم شخصية>"]
handler.tags = ["downloader"]
handler.command = /^(اديت|edit|اديتات|edits)$/i

export default handler