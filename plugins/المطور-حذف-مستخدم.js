let handler = async (m, { conn, usedPrefix, command, text }) => {

const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

function no(number) {
  return number.replace(/\s/g, '').replace(/([@+-])/g, '')
}

if (!text && !m.quoted && !m.mentionedJid.length)
  return conn.reply(m.chat, `👻 "يا بني... لازم تشير لرقم، أو ترد على شخص، أو تكتب رقمه بوضوح."  

📝 *مثال:*  
${usedPrefix + command} 2010xxxxxxx`, m)

let number = text 
  ? no(text) 
  : m.quoted?.sender?.split('@')[0] 
  || m.mentionedJid[0]?.split('@')[0]

if (!number) 
  return conn.reply(m.chat, `👻 "الرقم الذي أدخلته غير صالح يا بني."`, m)

let user = number + '@s.whatsapp.net'

if (!global.db.data.users[user])
  return conn.reply(m.chat, `👻 "هذا الرجل... لا أجد له أثراً في سجلات العائلة."`, m)

delete global.db.data.users[user]

let pp = await conn.profilePictureUrl(user, 'image').catch(_ => "https://telegra.ph/file/24fa902ead26340f3df2c.png")

let caption = `👻 "لقد تم حذف ${conn.getName(user)} من سجلات العائلة...  
لا مكان للخونة بيننا."  

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`

conn.sendFile(m.chat, pp, 'pp.jpg', caption, m)
}

handler.help = ['deleteuser', 'حذف-مستخدم', 'مسح-عضو']
handler.tags = ['owner']
handler.command = /^(deleteuser|hapususer|deluser|حذف-مستخدم|مسح-عضو)$/i
handler.owner = true

export default handler