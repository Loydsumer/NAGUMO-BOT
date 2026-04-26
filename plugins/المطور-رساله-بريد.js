let handler = async (m, { conn, text, usedPrefix, command }) => {
  
const allowedNumbers = [
  '201115546207@s.whatsapp.net', // الرقم الأول
  '963969829657@s.whatsapp.net'  // الرقم الثاني
]

function no(number) {
  return number.replace(/\s/g, '').replace(/([@+-])/g, '')
}

let [number, pesan] = text.split `|`
let mention = m.mentionedJid[0] 
  ? m.mentionedJid[0] 
  : m.quoted 
  ? m.quoted.sender 
  : number 
  ? number.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
  : false

if (!number) return conn.reply(m.chat, `👻 *أعطني الرقم يا صاحبي...*\n\n📌 مثال:\n${usedPrefix + command} 201234567890|السلام عليكم`, m)

if (!pesan) return conn.reply(m.chat, `👻 *أين الرسالة التي تريد إيصالها؟*\n\n📌 مثال:\n${usedPrefix + command} 201234567890|أريد أن أراك الليلة`, m)

if (text.length > 1000) return conn.reply(m.chat, '👻 *رسالتك طويلة جدًا يا صاحبي... (الحد الأقصى 1000 حرف)*', m)

let pengirim = m.sender
let penerima = mention
let isi = `
👻 *「 رسالة بريد 」* 👻

📨 *من: @${pengirim.replace(/@.+/, '')}*
💬 *الرسالة:*
${pesan.trim()}

──────
ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻
`

await conn.reply(penerima, isi, null, { mentions: [pengirim] })

let logs = `👻 *تم إرسال الرسالة بنجاح إلى @${number.split('@')[0]}*`
conn.reply(m.chat, logs, m)

}

handler.help = ['email', 'رساله-بريد']
handler.tags = ['owner']
handler.command = /^(email|رساله-بريد)$/i
handler.owner = true

export default handler