// 👻 RPG - إعطاء عناصر بأسلوب اوغامي كورليوني 👻
const items = [
  'money','bank','limit','exp','potion','trash','wood','rock','string','petfood','emerald','diamond','gold','iron',
  'common','uncommon','mythic','legendary','pet','chip','anggur','apel','jeruk','mangga','pisang',
  'bibitanggur','bibitapel','bibitjeruk','bibitmangga','bibitpisang','umpan','garam','minyak',
  'gandum','steak','ayam_goreng','ribs','roti','udang_goreng','bacon'
]

// 👻 قائمة الأرقام المسموح لها فقط
const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

let handler = async (m, { conn, args, usedPrefix, command }) => {

  // 👻 التحقق من الرقم المسموح
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply('🚫 👻 هذا الرقم غير مسموح له باستخدام هذا الأمر.\n👻 اتصل بالمالك إذا كنت تريد الوصول.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻')
  }

  // 👻 التحقق من وجود مدخلات
  if (!args[0]) {
    let example = `${usedPrefix}${command} diamond 5 @123456789`
    let explain = `👻 لاستخدام هذا الأمر لإعطاء عنصر في لعبة RPG:\n\n1️⃣ اختر اسم العنصر من القائمة: ${items.join(', ')}\n2️⃣ حدد الكمية المراد إعطاؤها (افتراضي 1)\n3️⃣ قم بتاغ المستخدم أو ضع رقمه\n\n👻 مثال:\n${example}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    return m.reply(explain)
  }

  // 👻 التهيئة
  let type = args[0].toLowerCase()
  if (!items.includes(type)) return m.reply(`📦 👻 هذا العنصر غير موجود!\n👻 العناصر الصالحة:\n${items.map(v => '• ' + v).join('\n')}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)

  let count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, (isNumber(args[1]) ? parseInt(args[1]) : 1))) * 1

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[2] ? (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : ''
  if (!who) return m.reply('🌸 👻 ضع تاغ للمستخدم أو أدخل رقمه\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻')

  if (!(who in global.db.data.users)) return m.reply(`❌ 👻 المستخدم ${who} غير مسجل!\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)

  // 👻 إضافة العنصر
  global.db.data.users[who][type] = (global.db.data.users[who][type] || 0) + count

  m.reply(`*───『 GIVE BERHASIL 👻 』───*
🎁 👻 العنصر: ${type + special(type)} ${global.rpg?.emoticon?.(type) || ''}
🎀 👻 الكمية: ${toRupiah(count)}
📮 👻 المستلم: @${(who || '').replace(/@s\.whatsapp\.net/g, '')}
\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`, null, { mentions: [who] })
}

// 👻 وظائف مساعدة
function special(type) {
  let b = type.toLowerCase()
  return ['common','uncommon','mythic','legendary','pet'].includes(b) ? ' Crate' : ''
}

function isNumber(x) {
  let num = parseInt(x)
  return typeof num === 'number' && isFinite(num)
}

const toRupiah = number => {
  let num = parseInt(number)
  return Math.min(num, Number.MAX_SAFE_INTEGER).toLocaleString('id-ID').replace(/\./g, ",")
}

// 👻 إعدادات الهاندلر
handler.help = ['give','ضيف-عنصر','عنصر']
handler.tags = ['rpg']
handler.command = /^(give|ضيف-عنصر|عنصر)$/i
handler.owner = true
handler.rpg = true

export default handler