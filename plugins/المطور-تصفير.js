let handler = async (m, { command, usedPrefix }) => {

  // ─────────────── المصرح لهم ───────────────
  const allowedNumbers = [
    '201115546207@s.whatsapp.net', // الرقم الأول
    '963969829657@s.whatsapp.net'  // الرقم الثاني
  ]

  // السماح فقط للأرقام المصرح لها
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply("👻 يا ولدي... هذه الأوامر مخصصة للعائلة فقط، الغرباء لا مكان لهم هنا.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻")
  }

  // تصفير بيانات المحادثات
  let arr = Object.entries(db.data.chats)
    .filter(([_, chat]) => typeof chat === 'object' && 'member' in chat)
    .map(([id]) => id)

  for (let id of arr) {
    db.data.chats[id].member = {}
  }

  // تصفير عداد المستخدمين
  let users = db.data.users
  let count = 0
  for (let id in users) {
    if (typeof users[id].chat !== 'undefined') {
      users[id].chat = 0
      count++
    }
  }

  // تخصيص الشرح حسب الأمر
  let explanation = ''
  if (/^(resetchat)$/i.test(command)) {
    explanation = `👻 يا ولدي... لقد صفّيت بيانات المحادثات كما أردت.
📝 *مثال:*
${usedPrefix + command}`
  } else {
    explanation = `👻 تم تصفير المحادثات لجميع الأعضاء والمجموعات.
📝 *مثال:*
${usedPrefix + command}`
  }

  // رسالة النتيجة
  await m.reply(
`*───『 تصفير المحادثات 』───*
📂 عدد المجموعات المصَفّرة: ${arr.length}
👤 عدد المستخدمين المصَفّرة بياناتهم: ${count}

${explanation}

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
  )
}

handler.help = ['resetchat', 'تصفير']
handler.tags = ['owner']
handler.command = /^(resetchat|تصفير)$/i
handler.owner = true

export default handler