let handler = async (m, { conn, isAdmin, isROwner, isOwner }) => {
  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner && !isOwner) return m.reply('❌ للأدمن فقط')

  const chat = global.db.data.chats[m.chat]
  chat.humanAI = !chat.humanAI
  await global.db.write()

  await conn.sendMessage(m.chat, {
    text: chat.humanAI
      ? `✅ *تم تفعيل وضع الإنسان الذكي*\n\nيورو هيشارك في المحادثة بشكل طبيعي`
      : `❌ *تم إيقاف وضع الإنسان الذكي*`,
  }, { quoted: m })
}

handler.help    = ['يورو_تفعيل']
handler.tags    = ['ai']
handler.command = /^(يورو_تفعيل|human_ai|تفعيل_يورو|yoru_on|يورو_ايقاف|yoru_off)$/i
handler.group   = true

export default handler