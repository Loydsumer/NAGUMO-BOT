let handler = async (m, { command }) => {
  // السماح فقط لأرقام معينة
  const allowedNumbers = [
    '201115546207@s.whatsapp.net', // الرقم الأول
    '963969829657@s.whatsapp.net'  // الرقم الثاني
  ]

  if (!allowedNumbers.includes(m.sender)) {
    return m.reply('👻 عذرًا... ليس لك صلاحية لتنفيذ هذا الأمر.')
  }

  // استخراج المستخدمين غير المسجلين
  let arr = Object.entries(db.data.users)
    .filter(user => !user[1].registered && !user[1].unreg)
    .map(user => user[0])

  // حذفهم
  for (let x of arr) delete db.data.users[x]

  // رسالة حسب الأمر
  let msg = ''
  if (/resetuser/i.test(command)) {
    msg = `👻 لقد أزلت ${arr.length} مستخدم غير مسجل من السجلات...\n\n*هكذا تُحفظ العائلة نظيفة.*`
  } else if (/إعادة-تعيين|اعاده-تعيين/i.test(command)) {
    msg = `👻 تم حذف ${arr.length} مستخدم غير مسجل.\n\n*لا تنسَ... الولاء للعائلة قبل كل شيء.*`
  }

  // رسالة توضيحية (ديناميكية حسب الأمر المستخدم)
  let usage = ''
  if (/resetuser/i.test(command)) {
    usage = `👻 *طريقة الاستخدام:* اكتب: \n> resetuser\n\n*مثال:* \n> .resetuser`
  } else {
    usage = `👻 *طريقة الاستخدام:* اكتب: \n> ${command}\n\n*مثال:* \n> .${command}`
  }

  await m.reply(`${msg}\n\n${usage}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
}

// الأوامر بدون رموز
handler.help = ['resetuser', 'إعادة-تعيين', 'اعاده-تعيين']
handler.tags = ['owner']
handler.command = /^(resetuser|إعادة-تعيين|اعاده-تعيين)$/i
handler.owner = true

export default handler