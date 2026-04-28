let handler = async (m, { conn, isAdmin, isROwner, isBotAdmin }) => {
  if (!m.quoted) return m.reply('❌ رد على الرسالة اللي عايز تحذفها')

  const isOwnerMsg = m.quoted.fromMe

  // ━━━ شروط الحذف ━━━
  if (!isOwnerMsg) {
    if (m.isGroup && !isBotAdmin) return m.reply('❌ البوت مش أدمن')
    if (m.isGroup && !isAdmin && !isROwner) return m.reply('❌ الأمر للأدمن فقط')
  }

  try {
    // ━━━ بنبني الـ key بشكل صح ━━━
    const botNum    = (conn.user?.id || conn.user?.jid || '').replace(/:[0-9]+@/, '@')
    const botLidJid = global.botLid ? global.botLid + '@lid' : null
    const sender    = m.quoted.sender || ''

    const isFromBot = sender === botNum ||
                      (botLidJid && sender === botLidJid) ||
                      sender.split('@')[0] === (botNum.split('@')[0]) ||
                      m.quoted.fromMe

    const deleteKey = {
      remoteJid: m.chat,
      fromMe: isFromBot,
      id: m.quoted.id,
      ...(m.isGroup ? { participant: m.quoted.sender } : {})
    }

    await conn.sendMessage(m.chat, { delete: deleteKey })



  } catch (err) {
    console.error('delete:', err.message)
    m.reply(`❌ فشل الحذف: ${err.message}`)
  }
}

handler.help    = ['حذف']
handler.tags    = ['group']
handler.command = /^(حذف|del|delete|مسح)$/i

export default handler