let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• 👥 •┇✦▬▬▬✦』*~\n' +
    '║     👥 قسم المجموعات 👥     ║\n' +
    '~*『✦▬▬▬✦┇• 👥 •┇✦▬▬▬✦』*~\n\n' +
    '👥│ ' + usedPrefix + 'تاق_الكل\n' +
    '👥│ ' + usedPrefix + 'رابط\n' +
    '👥│ ' + usedPrefix + 'ترقية <@>\n' +
    '👥│ ' + usedPrefix + 'تنزيل <@>\n' +
    '👥│ ' + usedPrefix + 'طرد <@>\n' +
    '👥│ ' + usedPrefix + 'اضافة <رقم>\n' +
    '👥│ ' + usedPrefix + 'قفل\n' +
    '👥│ ' + usedPrefix + 'فتح\n' +
    '👥│ ' + usedPrefix + 'اعضاء\n' +
    '👥│ ' + usedPrefix + 'كشف\n' +
    '👥│ ' + usedPrefix + 'بوتات\n' +
    '👥│ ' + usedPrefix + 'حذف\n\n' + 
    '> 👥 ' + botName + ' 👥'

  react('👥')

  const img = (global.images && global.images.group) ? global.images.group : null
  if (img) {
    try {
      await conn.sendMessage(m.chat, { image: { url: img }, caption: menuText }, { quoted: m })
    } catch { 
      await m.reply(menuText) 
    }
  } else {
    await m.reply(menuText)
  }
}

handler.help = ['قسم_المجموعات']
handler.tags = ['main']
handler.command = /^(قسم_المجموعات|قسمالمجموعات|مجموعات|groups)$/i

export default handler