let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• 🤖 •┇✦▬▬▬✦』*~\n' +
    '║     🤖 قسم الذكاء الاصطناعي 🤖     ║\n' +
    '~*『✦▬▬▬✦┇• 🤖 •┇✦▬▬▬✦』*~\n\n' +
    '🤖│ ' + usedPrefix + 'youru\n' +
    '🤖│ ' + usedPrefix + 'جيبيتي <سؤال>\n' +
    '🤖│ ' + usedPrefix + 'كلود <سؤال>\n' +
    '🤖│ ' + usedPrefix + 'جيميني <سؤال>\n' +
    '🤖│ ' + usedPrefix + 'صورة <وصف>\n' +
    '🤖│ ' + usedPrefix + 'رسم <وصف>\n' +
    '🤖│ ' + usedPrefix + 'ترجمة <نص>\n\n' +
    '> 🤖 ' + botName + ' 🤖'

  react('🤖')

  const img = (global.images && global.images.ai) ? global.images.ai : null
  if (img) {
    try {
      await conn.sendMessage(m.chat, { image: { url: img }, caption: menuText }, { quoted: m })
    } catch { await m.reply(menuText) }
  } else {
    await m.reply(menuText)
  }
}

handler.help = ['قسم_الذكاء']
handler.tags = ['main']
handler.command = /^(قسم_الذكاء|قسمالذكاء|ذكاء|i)$/i

export default handler