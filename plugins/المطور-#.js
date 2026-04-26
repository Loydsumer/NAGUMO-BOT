import { Client } from 'ssh2'

// 👻 قائمة الأرقام المسموح لها فقط
const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

const handler = async (m, { conn, usedPrefix, command }) => {
  if (global.conn.user.jid !== conn.user.jid) return

  // 👻 التحقق من الرقم المسموح له
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply('🚫 👻 هذا الرقم غير مسموح له باستخدام هذا الأمر.\n👻 اتصل بالمالك إذا كنت تريد الوصول.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻')
  }

  const cmdText = m.text.slice(usedPrefix.length).trim()
  if (!cmdText) {
    let example = `${usedPrefix}${command} ls -la /`
    let explain = `👻 أنت تعرف ما يجب فعله، لا تضيّع وقتنا.\n👻 لتنفيذ أمر على VPS، أرسل الأمر بعد # كما يلي:\nمثال: ${example}\n👻 فقط للأرقام المسموح لها.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    return m.reply(explain)
  }

  const ssh = new Client()
  ssh.on('ready', () => {
    ssh.exec(cmdText, (err, stream) => {
      if (err) return m.reply(`❌ 👻 خطأ في تنفيذ الأمر: ${err.message}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
      let output = ''
      stream.on('data', data => output += data.toString())
      stream.stderr.on('data', data => output += data.toString())
      stream.on('close', () => {
        ssh.end()
        if (!output.trim()) return
        m.reply(`👻 هذا هو الناتج، انتبه لما تراه 👀:\n\`\`\`${output.trim()}\`\`\`\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
      })
    })
  })
  ssh.on('error', (err) => m.reply(`❌ 👻 فشل الاتصال بالسيرفر: ${err.message}\n👻 تحقق من بيانات VPS.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`))
  ssh.connect({
    host: global.config.VPS.host,
    port: global.config.VPS.port,
    username: global.config.VPS.username,
    password: global.config.VPS.password
  })
}

handler.help = ['# <الأمر>']
handler.tags = ['owner']
handler.customPrefix = /^# /i
handler.command = new RegExp()
handler.mods = true

export default handler