let handler = async (m, { conn, usedPrefix, text, isAdmin, isOwner }) => {
if (!isAdmin && !isOwner) return conn.reply(m.chat, '*[❗] هذا الأمر مخصص للمشرفين فقط!*', m)

if (isNaN(text) && !text.match(/@/g)) {

} else if (isNaN(text)) {
var number = text.split`@`[1]
} else if (!isNaN(text)) {
var number = text
}

if (!text && !m.quoted) return conn.reply(m.chat, `*[❗] الاستخدام الصحيح:*\n\n*┯┷*\n*┠≽ ${usedPrefix}ترقيه مشرف @منشن*\n*┠≽ ${usedPrefix}ترقيه مشرف (بالرد على رسالة)*\n*┷┯*`, m)
if (number.length > 13 || (number.length < 11 && number.length > 0)) return conn.reply(m.chat, `*[ ⚠️ ] الرقم غير صحيح، الرجاء إدخال رقم صالح!*`, m)

try {
if (text) {
var user = number + '@s.whatsapp.net'
} else if (m.quoted.sender) {
var user = m.quoted.sender
} else if (m.mentionedJid) {
var user = number + '@s.whatsapp.net'
} 
} catch (e) {
console.error(e)
} finally {
conn.groupParticipantsUpdate(m.chat, [user], 'promote')
conn.reply(m.chat, `✅ تمت ترقية المستخدم بنجاح إلى مشرف!`, m)
}}

handler.help = ['ترقيه @منشن', 'ترقيه (بالرد)'].map(v => v)
handler.tags = ['group']
handler.command = /^(ترقيه|ترقية|ارفع)$/i
handler.group = true
handler.botAdmin = true

export default handler