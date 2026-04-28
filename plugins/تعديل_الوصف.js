let handler = async (m, { conn, text, isAdmin, isROwner }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')

  if (!text) {
    react('❌')
    return m.reply('❌ اكتب الوصف الجديد\n\nمثال: .تعديل_الوصف وصف جديد')
  }

  try {
    await conn.groupUpdateDescription(m.chat, text)
    react('✅')
    await m.reply('✅ تم تغيير وصف المجموعة ⚡')
  } catch (e) {
    react('❌')
    m.reply('❌ فشل: ' + e.message)
  }
}

handler.help = ['تعديل_الوصف <وصف>']
handler.tags = ['group']
handler.command = /^(تعديل_الوصف|تعديلالوصف|setdesc|وصف)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler