let handler = async (m, { conn, isAdmin, isROwner }) => {

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')

  try {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    react('🔓')
    await m.reply('🔓 تم فتح المجموعة\n\nالكل يقدر يبعت رسائل ⚡')
  } catch (e) {
    react('❌')
    m.reply('❌ فشل: ' + e.message)
  }
}

handler.help = ['فتح']
handler.tags = ['group']
handler.command = /^(فتح|open|unlock|افتح)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler