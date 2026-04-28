let handler = async (m, { conn, isROwner }) => {
  if (!isROwner) return m.reply('❌ للمطور فقط')

  await conn.sendMessage(m.chat, {
    text: [
      `🔄 *جاري إعادة التشغيل...*`,
      ``,
      `⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'} هيرجع خلال ثواني`,
    ].join('\n')
  }, { quoted: m })

  await new Promise(r => setTimeout(r, 2000))
  process.exit(0)
}

handler.command = /^(ريستارت|restart|اعادة_تشغيل)$/i
handler.help    = ['ريستارت']
handler.tags    = ['owner']
handler.rowner  = true

export default handler