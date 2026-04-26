let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) {
    return conn.reply(m.chat, `⚠️ يرجى الرد على *ستيكر* لتحويله إلى صورة.`, m)
  }

  await m.react('🕒')
  let quoted = m.quoted
  let imgBuffer = await quoted.download()

  if (!imgBuffer) {
    await m.react('✖️')
    return conn.reply(m.chat, `❌ فشل في تحميل الستيكر.\n> تأكد أن الرسالة تحتوي على ستيكر صالح.`, m)
  }

  await conn.sendMessage(
    m.chat,
    {
      image: imgBuffer,
      caption: `🖼️ *تم تحويل الستيكر إلى صورة بنجاح!*\n> ⚡ بواسطة نظام DIABLO`
    },
    { quoted: m }
  )

  await m.react('✔️')
}

handler.help = ['toimg']
handler.tags = ['tools']
handler.command = ['toimg', 'jpg', 'img', 'لصورة']

export default handler