import fs from 'fs'
import path from 'path'

const consoleDir = './My-Jason_files'
const consolePath = path.join(consoleDir, 'console.json')
const MAX_LOGS = 1000

// تأكد أن المجلد والملف موجودين
if (!fs.existsSync(consoleDir)) fs.mkdirSync(consoleDir, { recursive: true })
if (!fs.existsSync(consolePath)) fs.writeFileSync(consolePath, '[]')

// إصلاح الملف تلقائياً لو تالف
try {
  const test = fs.readFileSync(consolePath, 'utf-8')
  JSON.parse(test)
} catch {
  fs.writeFileSync(consolePath, '[]')
}

const originalConsole = {
  log: console.log,
  error: console.error
}

console.log = (...args) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'LOG',
    message: args.join(' ').replace(/\x1B\[\d+m/g, '')
  }
  updateLogs(logEntry)
  originalConsole.log(...args)
}

console.error = (...args) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    message: args.join(' ').replace(/\x1B\[\d+m/g, '')
  }
  updateLogs(logEntry)
  originalConsole.error(...args)
}

function updateLogs(entry) {
  let logs = []

  try {
    const raw = fs.readFileSync(consolePath, 'utf-8')
    logs = raw.trim() ? JSON.parse(raw) : []
  } catch (err) {
    console.error('❌ خطأ أثناء قراءة أو تحليل console.json:', err.message)
    logs = []
  }

  logs.push(entry)
  if (logs.length > MAX_LOGS) logs = logs.slice(-MAX_LOGS)
  fs.writeFileSync(consolePath, JSON.stringify(logs, null, 2))
}

const handler = async (m, { conn, isROwner }) => {
  if (!isROwner) return

  try {
    const logs = JSON.parse(fs.readFileSync(consolePath))
    if (!logs.length) return m.reply('لا توجد سجلات حاليا')

    const formattedLogs = logs.slice(-100).map(log =>
      `⏰ ${new Date(log.timestamp).toLocaleTimeString('de-EG')}\n` +
      `${log.type === 'ERROR' ? '🔴' : '🔵'} ${log.message}`
    ).join('\n\n――――――――――\n')

    await conn.sendMessage(m.chat, {
      text: `📋 آخر 100 سجل:\n\n${formattedLogs}`,
      contextInfo: { mentionedJid: [m.sender] }
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(consolePath),
      fileName: 'console_logs.json',
      mimetype: 'application/json'
    })

  } catch (e) {
    m.reply('حدث خطأ في استرجاع السجلات')
  }
}

handler.help = ['logs']
handler.tags = ['developer']
handler.command = /^(سجلات|console|كونسول)$/i
handler.owner = true
export default handler