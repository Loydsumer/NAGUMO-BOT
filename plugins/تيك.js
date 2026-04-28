import fetch from "node-fetch"
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const sessions = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply([
      `╭─── 🎬 *تحميل تيك توك* ───╮`,
      `│ ${usedPrefix}${command} <رابط الفيديو>`,
      `╰─── ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'} ───╯`
    ].join('\n'))
  }

  const url = args[0]
  if (!/tiktok|douyin|vm\.tiktok|vt\.tiktok/i.test(url)) {
    return m.reply("❌ رابط غير صالح!")
  }

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
  await m.reply("⏳ *جاري جلب معلومات الفيديو...*")

  try {
    const data = await fetchTikWM(url)
    if (!data || !data.videoUrl) throw new Error("فشل جلب الفيديو")

    sessions[m.sender] = { data, ts: Date.now() }

    try {
      const msg = generateWAMessageFromContent(m.chat, {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: {
            text: [
              `🎬 *${data.title || 'تيك توك'}*`,
              `👤 ${data.author}${data.username ? ` (@${data.username})` : ''}`,
              `⏱️ ${data.duration}s  ❤️ ${formatNum(data.likes)}  💬 ${formatNum(data.comments)}`,
              ``,
              `📥 *اختار نوع التحميل:*`
            ].join('\n')
          },
          footer: { text: `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
          header: { hasMediaAttachment: false },
          nativeFlowMessage: {
            buttons: [
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎬 فيديو', id: 'tt_video' }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 صوت', id: 'tt_audio' }) }
            ]
          }
        })
      }, { userJid: conn.user.jid, quoted: m })

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    } catch {
      await m.reply(`اختار:\n1️⃣ tt_video - فيديو\n2️⃣ tt_audio - صوت`)
    }

    setTimeout(() => { delete sessions[m.sender] }, 3 * 60 * 1000)

  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    m.reply(`❌ فشل: ${err.message}`)
  }
}

handler.all = async function (m) {
  if (!m.text) return
  const txt = m.text.trim()
  if (txt !== 'tt_video' && txt !== 'tt_audio') return

  // دور على الجلسة
  let session = sessions[m.sender]
  if (!session) {
    // جرب بدون @lid أو @s.whatsapp.net
    const num = m.sender.split('@')[0]
    session = Object.entries(sessions).find(([k]) => k.startsWith(num))?.[1]
  }
  if (!session) return
  if (Date.now() - session.ts > 3 * 60 * 1000) {
    delete sessions[m.sender]
    return
  }

  // امسح الجلسة فوراً عشان ما يتنفذش مرتين
  delete sessions[m.sender]

  const { data } = session
  await this.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }).catch(() => {})

  const caption = [
    `🎬 *${data.title || 'تيك توك'}*`,
    `👤 ${data.author}`,
    `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
  ].join('\n')

  try {
    if (txt === 'tt_audio') {
      const audioUrl = data.musicUrl || data.videoUrl
      await this.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })

    } else {
      await this.sendMessage(m.chat, {
        video: { url: data.videoUrl },
        caption,
        mimetype: 'video/mp4'
      }, { quoted: m })
    }

    await this.sendMessage(m.chat, { react: { text: "✅", key: m.key } }).catch(() => {})

  } catch (err) {
    console.error('[TikTok]', err.message)
    await this.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {})
    await this.sendMessage(m.chat, { text: `❌ فشل الإرسال: ${err.message}` }, { quoted: m }).catch(() => {})
  }
}

async function fetchTikWM(url) {
  const apis = [
    `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`,
    `https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`,
  ]
  for (const api of apis) {
    try {
      const res  = await fetch(api, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 20000
      })
      const json = await res.json()
      if (json.code !== 0 || !json.data) continue
      const d = json.data
      return {
        videoUrl: d.hdplay || d.play,
        musicUrl: d.music || null,
        title:    d.title || 'بدون عنوان',
        author:   d.author?.nickname || 'غير معروف',
        username: d.author?.unique_id || '',
        duration: d.duration || 0,
        likes:    d.digg_count || 0,
        comments: d.comment_count || 0,
        shares:   d.share_count || 0,
      }
    } catch {}
  }
  try {
    const res  = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 15000 })
    const json = await res.json()
    if (json.video?.noWatermark) {
      return {
        videoUrl: json.video.noWatermark,
        musicUrl: json.music || null,
        title:    json.title || 'بدون عنوان',
        author:   json.author?.name || 'غير معروف',
        username: json.author?.username || '',
        duration: json.duration || 0,
        likes:    json.stats?.likeCount || 0,
        comments: json.stats?.commentCount || 0,
      }
    }
  } catch {}
  return null
}

function formatNum(n) {
  if (!n) return "0"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K"
  return n.toString()
}

handler.help    = ['تيك <رابط>']
handler.tags    = ['downloader']
handler.command = /^(تيك|tik|تيكتوك|tiktok|تحميل_تيك)$/i

export default handler