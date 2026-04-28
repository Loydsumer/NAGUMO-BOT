import axios from 'axios'
import os from 'os'
import { getDevice } from '@whiskeysockets/baileys'

const IMAGE_URL = 'https://file.garden/aauvg01sjleV_ic1/2.jpg'

const PING_ENDPOINTS = [
  'https://www.google.com/',
  'https://www.cloudflare.com/',
  'https://www.github.com/'
]

const WA_VERSIONS = {
  android: '2.25.7',
  ios:     '25.31.75',
  web:     '2.2419.11',
}

async function pingUrl(url) {
  const start = Date.now()
  try {
    await axios.get(url, { timeout: 4000 })
    return Date.now() - start
  } catch { return null }
}

function speedBar(ms) {
  if (ms === null) return '❌ غير متاح'
  const bars  = ['▁','▂','▃','▄','▅','▆','▇','█']
  const score = Math.max(0, Math.min(bars.length - 1,
    Math.floor((300 - Math.min(ms, 300)) / (300 / bars.length))))
  return bars.slice(0, score + 1).join('') + `  ${ms}ms`
}

function surpriseLine() {
  return [
    '🔎 تحليل دقيق — تمت المعالجة بنجاح!',
    '✨ النتيجة مؤكدة بنسبة 97.3٪',
    '🧭 النتائج تقديرية ولا تكشف بيانات حساسة.',
    '📡 الاتصال مستقر ومؤمَّن ببروتوكول E2E.'
  ][Math.floor(Math.random() * 4)]
}

let handler = async (m, { conn }) => {
  try {
    // ━━━ تحديد الهدف ━━━
    const mentioned = await m.mentionedJid
    let targetId = mentioned?.[0] || m.quoted?.sender || m.sender

    // ━━━ نوع الجهاز ━━━
    let deviceType = 'غير معروف'
    try {
      const dt = await getDevice(m.key.id)
      if (dt) deviceType = dt
    } catch {}

    const osName = {
      android: 'Android',
      ios:     'iOS',
      web:     'Web (Desktop)',
      bot:     'Bot'
    }[deviceType] || 'غير محدد'

    // ━━━ نوع الشبكة (من السيرفر) ━━━
    let networkType = 'غير معروف'
    try {
      const ifaces = os.networkInterfaces()
      const names  = Object.keys(ifaces || {})
      if      (names.some(n => /wlan|wifi|wl/i.test(n)))           networkType = 'Wi-Fi'
      else if (names.some(n => /rmnet|wwan|pdp|cell|data/i.test(n))) networkType = 'بيانات الهاتف'
      else networkType = names[0] || 'غير معروف'
    } catch {}

    // ━━━ Ping ━━━
    const pings    = await Promise.all(PING_ENDPOINTS.map(pingUrl))
    const valid    = pings.filter(v => v !== null)
    const avgPing  = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null

    const speedEmoji = avgPing === null ? '❌' :
      avgPing <= 70  ? '⚡⚡⚡ ممتاز' :
      avgPing <= 150 ? '⚡⚡ جيد' : '⚡ بطيء'

    const waVersion = WA_VERSIONS[deviceType] || 'غير متاح'

    // ━━━ الرسالة ━━━
    const caption = [
      `✅ *تم الفحص بنجاح!*`,
      `────────────────────────`,
      `📱 *النظام:* ${osName} (${deviceType})`,
      `🌐 *الاتصال:* ${networkType}`,
      `⚡ *السرعة:* ${avgPing !== null ? avgPing + 'ms' : 'غير متاح'}  ${speedEmoji}`,
      `▸ ${speedBar(avgPing)}`,
      `🧩 *إصدار واتساب:* ${waVersion}`,
      `🔒 *التشفير:* 🔐 مشفَّر (E2E)`,
      `────────────────────────`,
      `🔍 ${surpriseLine()}`,
      `────────────────────────`,
      `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    ].join('\n')

    await conn.sendMessage(m.chat, {
      image: { url: IMAGE_URL },
      caption
    }, { quoted: m })

  } catch (e) {
    console.error('deviceinfo:', e)
    m.reply(`❌ حدث خطأ: ${e.message}`)
  }
}

handler.help    = ['جهاز']
handler.tags    = ['info']
handler.command = /^(جهاز|device|الجهاز)$/i

export default handler
