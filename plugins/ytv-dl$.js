import fetch from 'node-fetch'
import { join } from 'path'
import { tmpdir } from 'os'
import { createWriteStream, unlinkSync, statSync } from 'fs'
import { pipeline } from 'stream/promises'

// ━━━ savenow.to API ━━━
async function downloadFromSaveNow(url, quality) {
  const isAudio = quality === 'mp3'
  const format   = isAudio ? 'mp3' : quality  // 144 | 360 | 720 | mp3

  // الخطوة 1: ابدأ التحميل
  const initRes  = await fetch(
    `https://p.savenow.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&add_info=1`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://savenow.to/',
        Origin: 'https://savenow.to'
      },
      timeout: 30000
    }
  )
  const initJson = await initRes.json()
  console.log('[YTDL] savenow init:', JSON.stringify(initJson).slice(0, 200))

  const jobId = initJson?.id
  if (!jobId) throw new Error('فشل بدء التحميل من SaveNow')

  // الخطوة 2: انتظر حتى يجهز
  let downloadUrl = null
  const maxTries = isAudio ? 30 : 60
  for (let i = 0; i < maxTries; i++) {
    await new Promise(r => setTimeout(r, 3000))

    const progRes  = await fetch(
      `https://p.savenow.to/ajax/progress?id=${jobId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://savenow.to/'
        },
        timeout: 15000
      }
    )
    const progJson = await progRes.json()
    console.log('[YTDL] progress:', progJson?.progress, progJson?.text)

    if (progJson?.success === 1 && progJson?.download_url) {
      downloadUrl = progJson.download_url
      break
    }
    // تجاهل رسائل التقدم — فقط افشل لو في error صريح
    if (progJson?.error) throw new Error('فشل SaveNow: ' + progJson?.error)
  }

  if (!downloadUrl) throw new Error(`انتهى الوقت بعد ${maxTries * 3} ثانية — جرب جودة أقل`)
  return downloadUrl
}

let handler = async (m, { conn, args }) => {
  if (!args[0]) return

  const quality = args[0]  // 144 | 360 | 720 | mp3
  const url     = args.slice(1).join(' ')

  if (!url || (!url.includes('youtube') && !url.includes('youtu.be'))) {
    return m.reply('❌ رابط غير صالح')
  }

  const isAudio = quality === 'mp3'

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }).catch(() => {})
  await m.reply(`⏳ *جاري تحميل ${isAudio ? 'الصوت' : 'الفيديو ' + quality + 'p'}...*\n📡 المصدر: SaveNow`)

  const ts      = Date.now()
  const ext     = isAudio ? 'mp3' : 'mp4'
  const outPath = join(tmpdir(), `yt_${ts}.${ext}`)

  try {
    const downloadUrl = await downloadFromSaveNow(url, quality)
    console.log('[YTDL] download url:', downloadUrl)

    // حمّل الملف
    const dlRes = await fetch(downloadUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 120000
    })
    if (!dlRes.ok) throw new Error(`فشل التحميل: ${dlRes.status}`)

    await pipeline(dlRes.body, createWriteStream(outPath))

    const size = statSync(outPath).size
    console.log('[YTDL] file size:', size)
    if (size < 1000) throw new Error('الملف صغير جداً')

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: outPath },
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: outPath },
        mimetype: 'video/mp4',
        caption: `✅ *تم التحميل!*\n📹 *الجودة:* ${quality}p\n📡 *المصدر:* SaveNow\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})

  } catch (err) {
    console.error('[YTDL] error:', err.message)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    m.reply(`❌ فشل التحميل: ${err.message}`)
  } finally {
    try { unlinkSync(outPath) } catch {}
  }
}

handler.help    = ['ytv-dl']
handler.tags    = ['downloader']
handler.command = /^ytv-dl$/i
export default handler