import { join } from 'path'
import { existsSync, unlinkSync, chmodSync, createWriteStream } from 'fs'
import { spawn } from 'child_process'
import fetch from 'node-fetch'
import { pipeline } from 'stream/promises'

let handler = async (m, { conn }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  await react('⏳')
  await m.reply('⏳ *جاري تحديث yt-dlp لأحدث نسخة...*')

  const ytDlpPath = join(process.cwd(), 'yt-dlp')

  // ─── امسح القديم ─────────────────────
  try {
    if (existsSync(ytDlpPath)) {
      unlinkSync(ytDlpPath)
      await m.reply('🗑️ تم مسح النسخة القديمة')
    }
    if (existsSync(ytDlpPath + '.exe')) {
      unlinkSync(ytDlpPath + '.exe')
    }
  } catch (e) {
    await m.reply('⚠️ فشل مسح القديم: ' + e.message)
  }

  // ─── حمل أحدث nightly ─────────────────
  let downloadUrl
  if (process.platform === 'win32') {
    downloadUrl = 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp.exe'
  } else if (process.platform === 'darwin') {
    downloadUrl = 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp_macos'
  } else {
    downloadUrl = 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp_linux'
  }

  try {
    await m.reply('📥 *جاري التحميل من:*\n' + downloadUrl)

    const res = await fetch(downloadUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    if (!res.ok) throw new Error('HTTP ' + res.status)

    const dest = process.platform === 'win32' ? ytDlpPath + '.exe' : ytDlpPath
    await pipeline(res.body, createWriteStream(dest))

    if (process.platform !== 'win32') {
      chmodSync(dest, 0o755)
    }

    // ─── تحقق من النسخة ─────────────────
    const version = await new Promise((resolve, reject) => {
      const proc = spawn(dest, ['--version'])
      let out = ''
      proc.stdout.on('data', d => out += d.toString())
      proc.on('close', code => {
        if (code === 0) resolve(out.trim())
        else reject(new Error('فشل'))
      })
      setTimeout(() => { try { proc.kill() } catch {}; reject(new Error('timeout')) }, 10000)
    })

    await react('✅')
    await m.reply(
      '✅ *تم التحديث بنجاح!*\n\n' +
      '📌 *النسخة:* ' + version + '\n' +
      '📂 *المسار:* ' + dest + '\n\n' +
      '> ⚡ 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    )

  } catch (err) {
    await react('❌')
    await m.reply(
      '❌ *فشل التحديث!*\n\n' +
      '```' + err.message + '```\n\n' +
      '> ⚡ 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    )
  }
}

handler.help = ['تحديث']
handler.tags = ['owner']
handler.command = /^(تحديث|update|تحديث_يوتيوب|updateytdlp)$/i
handler.owner = true

export default handler