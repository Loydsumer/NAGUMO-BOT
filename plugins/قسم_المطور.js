let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~\n' +
    '║     🪻 قسم المطور 🪻     ║\n' +
    '~*『✦▬▬▬✦┇• 🪻 •┇✦▬▬▬✦』*~\n\n' +
    '🪻│ ' + usedPrefix + 'تست\n' +
    '🪻│ ' + usedPrefix + 'بلوقن لست\n' +
    '🪻│ ' + usedPrefix + 'بلوقن اضف\n' +
    '🪻│ ' + usedPrefix + 'بلوقن حذف <اسم>\n' +
    '🪻│ ' + usedPrefix + 'بلوقن عرض <اسم>\n' +
    '🪻│ ' + usedPrefix + 'ريستارت\n' +
    '🪻│ ' + usedPrefix + 'تقييم <كود>\n' +
    '🪻│ ' + usedPrefix + 'اذاعة <نص>\n' +
    '🪻│ ' + usedPrefix + 'سك\n' +
    '🪻│ ' + usedPrefix + 'مطور\n' +
    '🪻│ ' + usedPrefix + 'تحديث\n' +
    '🪻| ' + usedPrefix + 'وضع\n\n' +    
    '> 🪻 ' + botName + ' 🪻'

  react('🪻')

  const img = (global.images && global.images.owner) ? global.images.owner : null
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

handler.help = ['قسم_المطور']
handler.tags = ['owner']
handler.command = /^(قسم_المطور|قسمالمطور|المطور|owner|dev)$/i
handler.rowner = true

export default handler