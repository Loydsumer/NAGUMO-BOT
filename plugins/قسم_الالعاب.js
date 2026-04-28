let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• 🎮 •┇✦▬▬▬✦』*~\n' +
    '║     🎮 قسم الألعاب 🎮     ║\n' +
    '~*『✦▬▬▬✦┇• 🎮 •┇✦▬▬▬✦』*~\n\n' +
    '🎮│ ' + usedPrefix + 'حظ\n' +
    '🎮│ ' + usedPrefix + 'نرد\n' +
    '🎮│ ' + usedPrefix + 'عملة\n' +
    '🎮│ ' + usedPrefix + 'رقم\n' +
    '🎮│ ' + usedPrefix + 'تخمين\n' +
    '🎮│ ' + usedPrefix + 'سؤال\n' +
    '🎮│ ' + usedPrefix + 'كلمة\n' +
    '🎮│ ' + usedPrefix + 'احجية\n\n' +
    '> 🎮 ' + botName + ' 🎮'

  react('🎮')

  const img = (global.images && global.images.games) ? global.images.games : null
  if (img) {
    try {
      await conn.sendMessage(m.chat, { image: { url: img }, caption: menuText }, { quoted: m })
    } catch { await m.reply(menuText) }
  } else {
    await m.reply(menuText)
  }
}

handler.help = ['قسم_الالعاب']
handler.tags = ['main']
handler.command = /^(قسم_الالعاب|قسمالالعاب|العاب|games)$/i

export default handler