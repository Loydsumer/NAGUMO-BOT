import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
const exec = promisify(_exec).bind(cp)

// 👻 قائمة الأرقام المسموح لها
const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

const dangerousCommands = [
  'rm -rf /', 'rm -rf *', 'rm --no-preserve-root -rf /',
  'mkfs.ext4', 'dd if=', 'chmod 777 /', 'chown root:root /', 'mv /', 'cp /', 
  'shutdown', 'reboot', 'poweroff', 'halt', 'kill -9 1', '>:(){ :|: & };:'
]

const handler = async (m, { conn, isOwner, command, text, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) return
  if (!isOwner) return

  // 👻 التحقق من الرقم المسموح
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply('🚫 👻 هذا الرقم غير مسموح له باستخدام هذا الأمر.\n👻 اتصل بالمالك إذا كنت تريد الوصول.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻')
  }

  if (!command || !text) {
    let example = `${usedPrefix}${command} ls -la`
    let explain = (command === '$')
      ? `👻 صاحبي... عشان تنفذ أمر شيل، أرسله هكذا:\nمثال: ${example}\n👻 تذكر، فقط للأرقام المسموح لها.`
      : `👻 يا صاح... الأمر العربي ${command} يستخدم بنفس الطريقة:\nمثال: ${example}\n👻 العائلة لا تنتظر.`

    return m.reply(`${explain}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
  }

  if (dangerousCommands.some(cmd => text.trim().startsWith(cmd))) {
    return conn.sendMessage(m.chat, {
      text: `⚠️ 👻 تحذير! 👻\n👻 الأمر الذي تحاول تنفيذه شديد الخطورة وتم منعه لأسباب أمنيّة.`
    })
  }

  let output
  try {
    output = await exec(command.trimStart() + ' ' + text.trimEnd())
  } catch (error) {
    output = error
  } finally {
    const { stdout, stderr } = output
    if (stdout?.trim()) {
      conn.sendMessage(m.chat, { text: `📤 👻 الناتج:\n\`\`\`${stdout.trim()}\`\`\`` })
    }
    if (stderr?.trim()) {
      conn.sendMessage(m.chat, { text: `❗ 👻 خطأ:\n\`\`\`${stderr.trim()}\`\`\`` })
    }
  }
}

handler.help = ['$', 'تثبيت <الأمر>']
handler.tags = ['owner']
handler.customPrefix = /^[$] |^تثبيت /i
handler.command = new RegExp()
handler.mods = true

export default handler