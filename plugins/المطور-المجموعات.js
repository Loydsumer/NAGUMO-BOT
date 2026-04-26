// 👻 عرض قائمة المجموعات النشطة للبوت بأسلوب اوغامي كورليوني 👻
const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

let handler = async (m, { conn }) => {

  // 👻 التحقق من الرقم المسموح
  if (!allowedNumbers.includes(m.sender)) {
    return m.reply('🚫 👻 هذا الرقم غير مسموح له باستخدام هذا الأمر.\n👻 اتصل بالمالك إذا كنت تريد الوصول.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻')
  }

  let now = new Date() * 1

  // 👻 تصفية المجموعات الفعّالة
  let groups = Object.entries(conn.chats)
    .filter(([jid, chat]) =>
      jid.endsWith('@g.us') &&
      chat.isChats &&
      !chat.metadata?.read_only &&
      !chat.metadata?.announce &&
      !chat.isCommunity &&
      !chat.isCommunityAnnounce &&
      !chat?.metadata?.isCommunity &&
      !chat?.metadata?.isCommunityAnnounce
    )
    .map(v => v[0])

  let txt = ''
  let chats = global.db.data.chats

  for (let [jid, chat] of Object.entries(conn.chats)
    .filter(([jid, chat]) =>
      jid.endsWith('@g.us') &&
      chat.isChats &&
      !chat.isCommunity &&
      !chat.isCommunityAnnounce &&
      !chat?.metadata?.isCommunity &&
      !chat?.metadata?.isCommunityAnnounce
    )) {

    // 👻 تهيئة بيانات الجروب إذا غير موجودة
    if (!chats[jid]) chats[jid] = { isBanned: false, welcome: false, antiLink: false, delete: true }

    txt += `🍡 *${await conn.getName(jid)}*\n` +
           `🍬 *${jid} [${chat?.metadata?.read_only ? 'خروج' : 'نشط'}]*\n` +
           `🍰 ${chats[jid].expired ? msToDate(chats[jid].expired - now) : '*⏳ لم يتم تحديد انتهاء صلاحية*'}\n` +
           `*${chats[jid].isBanned ? '🍏' : '🍎'} محظور*\n` +
           `*${chats[jid].welcome ? '🍏' : '🍎'} ترحيب تلقائي*\n` +
           `*${chats[jid].antiLink ? '🍏' : '🍎'} منع الروابط*\n\n`
  }

  m.reply(`🎀 👻 قائمة كل المجموعات النشطة\n🍓 👻 إجمالي المجموعات: ${groups.length}\n\n${txt}\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
}

// 👻 دالة تحويل المللي ثانية إلى أيام وساعات ودقائق
function msToDate(ms) {
  let days = Math.floor(ms / (24 * 60 * 60 * 1000))
  let daysms = ms % (24 * 60 * 60 * 1000)
  let hours = Math.floor(daysms / (60 * 60 * 1000))
  let hoursms = daysms % (60 * 60 * 1000)
  let minutes = Math.floor(hoursms / (60 * 1000))
  return `*${days} أيام* 🍡\n*${hours} ساعات* 🍬\n*${minutes} دقائق* 🍰`
}

// 👻 إعدادات الهاندلر
handler.help = ['grouplist','المجموعات','الجروبات']
handler.tags = ['group']
handler.command = /^(group(s|list)|(s|list)group|المجموعات|الجروبات)$/i
handler.owner = true

export default handler