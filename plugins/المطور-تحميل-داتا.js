import fs from 'fs'

// 👻 قائمة الأرقام المسموح لها فقط
const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

let handler = async (m, { conn, command, usedPrefix }) => {

  // 👻 التحقق من الرقم المسموح
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply('🚫 👻 هذا الرقم غير مسموح له باستخدام هذا الأمر.\n👻 اتصل بالمالك إذا كنت تريد الوصول.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻')
  }

  // 👻 التحقق من وجود نص إضافي (لشرح الاستخدام)
  if (!command) {
    let example = `${usedPrefix}getdb`
    let explain = `👻 لتنزيل نسخة من قاعدة بيانات البوت، استخدم الأمر هكذا:\nمثال: ${example}\n👻 فقط للأرقام المسموح لها.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    return m.reply(explain)
  }

  // 👻 إخطار المستخدم بالانتظار
  m.reply('👻 انتظر قليلاً، جارٍ تحميل ملف قاعدة البيانات...\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻')

  try {
    let sesi = fs.readFileSync('./database.json')
    await conn.sendMessage(
      m.chat, 
      { document: sesi, mimetype: 'application/json', fileName: 'database.json' }, 
      { quoted: m }
    )
  } catch (e) {
    m.reply(`❌ 👻 حدث خطأ أثناء تحميل الملف: ${e.message}\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
  }
}

handler.help = ['getdb', 'تحميل-داتا']
handler.tags = ['owner']
handler.command = /^(getdb|تحميل-داتا)$/i
handler.mods = true

export default handler