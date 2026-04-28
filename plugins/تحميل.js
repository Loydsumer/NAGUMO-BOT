import { join } from 'path'
import {
  existsSync, unlinkSync, mkdirSync,
  readdirSync, statSync, chmodSync,
  createWriteStream
} from 'fs'
import { tmpdir } from 'os'
import { spawn } from 'child_process'
import fetch from 'node-fetch'
import { pipeline } from 'stream/promises'

// ══════════════════════════════════════════
//  دالة تحميل yt-dlp تلقائي لو مش موجود
// ══════════════════════════════════════════
const ytDlpPath = join(process.cwd(), 'yt-dlp')

async function ensureYtDlp() {

  // ─── لو موجود بالفعل خلاص ──────────
  if (existsSync(ytDlpPath)) {
    return ytDlpPath
  }

  console.log('[yt-dlp] جاري التحميل التلقائي...')

  // ─── تحديد نظام التشغيل ──────────────
  let downloadUrl

  if (process.platform === 'win32') {
    downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
  } else if (process.platform === 'darwin') {
    downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos'
  } else {
    // Linux
    downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux'
  }

  // ─── تحميل الملف ────────────────────
  const response = await fetch(downloadUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  if (!response.ok) {
    throw new Error('فشل تحميل yt-dlp: ' + response.status)
  }

  const dest = process.platform === 'win32'
    ? ytDlpPath + '.exe'
    : ytDlpPath

  await pipeline(response.body, createWriteStream(dest))

  // ─── إعطاء صلاحية التشغيل (Linux/Mac) ──
  if (process.platform !== 'win32') {
    chmodSync(dest, 0o755)
  }

  console.log('[yt-dlp] ✅ تم التثبيت بنجاح!')
  return dest
}

// ══════════════════════════════════════════
//  الأمر الرئيسي
// ══════════════════════════════════════════
let handler = async (m, { conn, text, usedPrefix, command }) => {

  const react = async (emoji) => {
    try {
      await conn.sendMessage(m.chat, {
        react: { text: emoji, key: m.key }
      })
    } catch {}
  }

  // ─── التحقق من وجود رابط ──────────────
  if (!text || !text.trim()) {
    await react('❌')
    return m.reply(
      '⚠️ *ازاي تستخدم الأمر:*\n\n' +
      '📌 ' + usedPrefix + command + ' [الرابط]\n\n' +
      '*أمثلة:*\n' +
      '▸ ' + usedPrefix + command + ' https://www.instagram.com/reel/ABC\n' +
      '▸ ' + usedPrefix + command + ' https://fb.watch/xyz\n\n' +
      '> ⚡ 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    )
  }

  const url = text.trim()

  // ─── التحقق من الرابط ────────────────
  const fbRegex = /^https?:\/\/(www\.|m\.|web\.|mbasic\.)?(facebook\.com|fb\.watch|fb\.com)\/.+/i
  const igRegex = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/.+/i

  if (!fbRegex.test(url) && !igRegex.test(url)) {
    await react('❌')
    return m.reply(
      '❌ *الرابط مش صحيح!*\n\n' +
      '⚡ لازم يكون رابط من:\n' +
      '▸ فيسبوك (Facebook)\n' +
      '▸ إنستجرام (Instagram)'
    )
  }

  const platform = fbRegex.test(url) ? 'فيسبوك 📘' : 'إنستجرام 📸'

  await react('⏳')

  // ═══════════════════════════════════════
  //  الخطوة 1: التأكد إن yt-dlp موجود
  // ═══════════════════════════════════════
  let binaryPath
  try {
    binaryPath = await ensureYtDlp()
    await m.reply('⏳ *جاري التحميل من ' + platform + '...*\n⚡ استنى شوية')
  } catch (dlErr) {
    await react('❌')
    return m.reply(
      '❌ *فشل تثبيت yt-dlp تلقائياً*\n\n' +
      '🔍 *الخطأ:*\n```' + dlErr.message + '```\n\n' +
      '> ⚡ 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    )
  }

  // ═══════════════════════════════════════
  //  الخطوة 2: تحميل الفيديو
  // ═══════════════════════════════════════
  const tempDir = join(tmpdir(), 'yorubot-dl')
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  const fileName = 'yoru_' + Date.now()
  const outputTemplate = join(tempDir, fileName + '.%(ext)s')

  const args = [
    url,
    '-o', outputTemplate,
    '-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
    '--merge-output-format', 'mp4',
    '--max-filesize', '60M',
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '--socket-timeout', '30',
    '--retries', '3',
    '--user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]

  try {
    // ─── تشغيل yt-dlp ──────────────────
    await new Promise((resolve, reject) => {
      const proc = spawn(binaryPath, args)

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', d => { stdout += d.toString() })
      proc.stderr.on('data', d => { stderr += d.toString() })

      proc.on('error', err => {
        reject(new Error('SPAWN_ERROR: ' + err.message))
      })

      proc.on('close', code => {
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error('EXIT_' + code + ': ' + stderr))
        }
      })

      setTimeout(() => {
        try { proc.kill() } catch {}
        reject(new Error('TIMEOUT'))
      }, 120000)
    })

    // ─── البحث عن الملف ─────────────────
    const files = readdirSync(tempDir)
    const downloadedFile = files.find(f => f.startsWith(fileName))

    if (!downloadedFile) {
      await react('❌')
      return m.reply('❌ *مقدرتش ألاقي الملف*\nجرب رابط تاني')
    }

    const filePath = join(tempDir, downloadedFile)
    const fileSize = statSync(filePath).size
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)

    if (fileSize > 62 * 1024 * 1024) {
      unlinkSync(filePath)
      await react('❌')
      return m.reply(
        '❌ *الفيديو كبير أوي!*\n' +
        '📦 الحجم: ' + fileSizeMB + ' ميجا'
      )
    }

    // ─── جلب العنوان ────────────────────
    let videoTitle = 'فيديو من ' + platform
    try {
      const t = await new Promise((resolve, reject) => {
        const p = spawn(binaryPath, ['--get-title', url])
        let o = ''
        p.stdout.on('data', d => o += d.toString())
        p.on('close', c => c === 0 && o.trim() ? resolve(o.trim()) : reject())
        setTimeout(() => { try { p.kill() } catch {}; reject() }, 10000)
      })
      videoTitle = t
    } catch {}

    // ─── إرسال الفيديو ──────────────────
    const caption =
      '⚡ *تم التحميل بنجاح!*\n\n' +
      '📌 *المنصة:* ' + platform + '\n' +
      '🎬 *العنوان:* ' + videoTitle.substring(0, 100) + '\n' +
      '📦 *الحجم:* ' + fileSizeMB + ' MB\n\n' +
      '> ⚡ 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

    await conn.sendMessage(m.chat, {
      video: { url: filePath },
      caption: caption,
      mimetype: 'video/mp4'
    }, { quoted: m })

    await react('✅')
    try { unlinkSync(filePath) } catch {}

  } catch (err) {
    await react('❌')

    const errText = err.message || ''
    let errorMsg = '❌ *فشل التحميل!*\n\n'

    if (errText.includes('TIMEOUT')) {
      errorMsg += '⏰ الفيديو أخد وقت طويل - جرب فيديو أقصر'
    } else if (errText.includes('403') || errText.includes('Forbidden')) {
      errorMsg += '🔒 الموقع حظر التحميل - جرب رابط تاني'
    } else if (errText.includes('login') || errText.includes('Login')) {
      errorMsg += '🔐 الفيديو محتاج تسجيل دخول - لازم يكون عام'
    } else if (errText.includes('Unsupported')) {
      errorMsg += '🔗 الرابط مش مدعوم - جرب رابط تاني'
    } else {
      errorMsg += '🔍 *الخطأ:*\n```' + errText.substring(0, 300) + '```'
    }

    errorMsg += '\n\n> ⚡ 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    return m.reply(errorMsg)
  }

  // ─── تنظيف ──────────────────────────
  try {
    const allFiles = readdirSync(tempDir)
    const now = Date.now()
    for (const f of allFiles) {
      if (f.startsWith('yoru_')) {
        const ts = parseInt(f.split('_')[1])
        if (now - ts > 600000) {
          try { unlinkSync(join(tempDir, f)) } catch {}
        }
      }
    }
  } catch {}
}

handler.help = ['تحميل', 'نزل']
handler.tags = ['downloader']
handler.command = /^(تحميل|نزل|حمل|download|dl|فيسبوك|فيس|انستا|انستقرام|ig|fb)$/i

export default handler