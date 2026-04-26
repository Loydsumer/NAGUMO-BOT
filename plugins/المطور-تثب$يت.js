import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
const exec = promisify(_exec).bind(cp)

// 📝 قائمة الأرقام المسموح لها باستخدام الأمر
const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

const dangerousCommands = [
  'rm -rf /', 'rm -rf *', 'rm --no-preserve-root -rf /',
  'mkfs.ext4', 'dd if=', 'chmod 777 /', 'chown root:root /', 'mv /', 'cp /', 
  'shutdown', 'reboot', 'poweroff', 'halt', 'kill -9 1', '>:(){ :|: & };:'
]

const handler = async (m, { conn, isOwner, command, text }) => {
  // تحقق أن المستخدم ضمن allowedNumbers
  if (!allowedNumbers.includes(m.sender)) return conn.sendMessage(m.chat, { text: '⚠️ *أنت غير مسموح لك باستخدام هذا الأمر!* 👻' })

  if (global.conn.user.jid !== conn.user.jid) return
  if (!isOwner) return
  if (!command || !text) return
  if (dangerousCommands.some(cmd => text.trim().startsWith(cmd))) {
    return conn.sendMessage(m.chat, { text: `⚠️ *تحذير!*\n*الأمر الذي تحاول تنفيذه خطير جدًا وتم حظره لأسباب الأمان.* 👻` })
  }

  let output
  try {
    output = await exec(command.trimStart() + ' ' + text.trimEnd())
  } catch (error) {
    output = error
  } finally {
    const { stdout, stderr } = output
    if (stdout?.trim()) {
      conn.sendMessage(m.chat, { text: `📤 *الناتج:*\n\`\`\`${stdout.trim()}\`\`\` 👻` })
    }
    if (stderr?.trim()) {
      conn.sendMessage(m.chat, { text: `❗ *خطأ:*\n\`\`\`${stderr.trim()}\`\`\` 👻` })
    }
  }
}

handler.help = ['$']
handler.tags = ['owner']
handler.customPrefix = /^[$] /
handler.command = new RegExp()
handler.mods = true

export default handler