let handler = async (m, { conn, isROwner }) => {
  if (!isROwner) return m.reply('❌ هذا الأمر للمطور فقط')

  let who = null
  if (m.quoted) {
    who = m.quoted.sender
  } else if (m.mentionedJid?.[0]) {
    who = m.mentionedJid[0]
  }

  if (!who) return m.reply('❌ رد على رسالة الشخص أو اعمل منشن @')

  // مش نحجب نفسنا أو الأونر
  const num = who.replace(/[^0-9]/g, '')
  if (global.owner?.includes(num)) return m.reply('❌ مش هتحجب مطور!')

  try {
    await conn.updateBlockStatus(who, 'block')
    await conn.sendMessage(m.chat, {
      text: [
        `🚫 *تم الحجب*`,
        ``,
        `👤 @${num}`,
        `📛 تم حجبه بنجاح`,
        ``,
        `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
      ].join('\n'),
      mentions: [who]
    }, { quoted: m })
  } catch (e) {
    console.error('block error:', e.message)
    m.reply('❌ فشل الحجب: ' + e.message)
  }
}

handler.command = /^(احجيه|احجبه|احجية|block)$/i
handler.help    = ['احجيه @']
handler.tags    = ['owner']
handler.rowner  = true

export default handler