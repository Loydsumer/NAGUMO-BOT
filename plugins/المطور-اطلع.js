// Handler: الخروج من المجموعات (مُعدل — شخصية اوغامي كورليوني)
let handler = async (m, { conn, args, command, text }) => {
  // الأرقام المصرح لها بتنفيذ الأمر
  const allowedNumbers = [
    '201115546207@s.whatsapp.net', // الرقم الأول
    '963969829657@s.whatsapp.net'  // الرقم الثاني
  ]

  // فحص السماح
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply(`👻 سيدي... هذا القرار ليس بيدك.\nفقط رجال العائلة الموثوقون يملكون هذا الامتياز.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
  }

  // تحديد المجموعة الهدف (المكتوبة أو الحالية)
  let group = text ? text : m.chat

  // صياغة رسالة الوداع حسب الأمر المستعمل
  let farewellMsg = ''
  switch (command) {
    case 'leavegc':
    case 'out':
      farewellMsg = `👻 لقد حان وقت الرحيل يا أصدقائي...\nأستودعكم الله.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
      break
    case 'غادر':
    case 'اطلع':
      farewellMsg = `👻 كما يقولون... كل لقاء له نهاية.\nالآن، عليَّ أن أترككم.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
      break
    case 'المجموعات':
      farewellMsg = `👻 يا سيدي، هذا الأمر مخصص لترك المجموعات فقط.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
      break
    default:
      farewellMsg = `👻 وداعًا... سأغادر بهدوء.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
  }

  // إرسال رسالة الوداع
  await conn.reply(group, farewellMsg, null)

  // مغادرة المجموعة (إلا إذا كان الأمر "المجموعات" فهو للعرض فقط)
  if (!/المجموعات/i.test(command)) {
    await conn.groupLeave(group)
  }
}

// المساعدة والأوامر
handler.help = ['leavegc', 'out', 'غادر', 'اطلع', 'المجموعات']
handler.tags = ['owner']
handler.command = /^(leavegc|out|غادر|اطلع)$/i
handler.owner = true

export default handler