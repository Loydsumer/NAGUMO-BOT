let handler = async (m, { conn }) => {
  // حساب عدد المستخدمين
  let totalUsers = Object.keys(global.db.data.users).length

  // رسالة الرد
  let message = `
╭─❒ معلومات البوت
│┊ إجمالي مستخدمي البوت: ${totalUsers}
╰❒
  `

  // إرسال الرسالة
  await conn.sendMessage(m.chat, { text: message })
}

handler.help = ['مستخدمين']
handler.tags = ['info']
handler.command = /^(المستخدمين|users)$/i
export default handler