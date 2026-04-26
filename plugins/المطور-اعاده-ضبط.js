let handler = async (m, { conn, command, usedPrefix }) => {

  // ─────────────── المصرح لهم ───────────────
  const allowedNumbers = [
    '201115546207@s.whatsapp.net', // الرقم الأول
    '963969829657@s.whatsapp.net'  // الرقم الثاني
  ]

  // السماح فقط للأرقام المصرح لهم
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply("👻 يا ولدي... هذه الأوامر مخصصة للعائلة فقط، الغرباء لا مكان لهم هنا.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻")
  }

  let users = global.db.data.users
  let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null
  let jumlah = 0

  // إذا فيه منشن → إعادة ضبط لمستخدم واحد
  if (target) {
    if (!(target in users)) {
      return m.reply(`👻 هذا الرجل ليس مسجلاً في سجلات العائلة...\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
    }
    users[target].command = 0
    users[target].commandLimit = 1000
    users[target].cmdLimitMsg = 0
    jumlah = 1

    return m.reply(
`*───『 إعادة ضبط الأوامر 』───*
👤 المستخدم: @${target.replace(/@s\.whatsapp\.net/g, '')}
📉 الحد: 1000
🔄 الاستخدام: 0

👻 يا ولدي... لقد صفّيت حدوده كما أردت.

📝 *مثال:*
${usedPrefix + command} @user

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`, null, { mentions: [target] })
  }

  // إذا بدون منشن → إعادة ضبط للجميع
  for (let id in users) {
    if (typeof users[id] === 'object') {
      users[id].command = 0
      users[id].commandLimit = 1000
      users[id].cmdLimitMsg = 0
      jumlah++
    }
  }

  return m.reply(
`*───『 إعادة ضبط الأوامر 』───*
👥 عدد الأعضاء المصَفّرين: ${jumlah}
📉 الحد: 1000
🔄 الاستخدام: 0

👻 يا ولدي... كما أمرتني، أعدت ضبط أوامر الجميع.

📝 *مثال:*
${usedPrefix + command}

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
  )
}

handler.help = ['resetcommand', 'اعاده-ضبط', 'اعادة-ضبط']
handler.tags = ['owner']
handler.command = /^(resetcommand|اعاده-ضبط|اعادة-ضبط)$/i
handler.owner = true

export default handler