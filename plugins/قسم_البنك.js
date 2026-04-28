// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 //  🏦 قسم البنك
 //  🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓
 // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• 🏦 •┇✦▬▬▬✦』*~\n' +
    '║     🏦 قسم البنك 🏦     ║\n' +
    '~*『✦▬▬▬✦┇• 🏦 •┇✦▬▬▬✦』*~\n\n' +
    '🏦│ ' + usedPrefix + 'رصيد\n' +
    '🏦│ ' + usedPrefix + 'يومي\n' +
    '🏦│ ' + usedPrefix + 'تحويل\n' +
    '🏦│ ' + usedPrefix + 'لوحة\n\n' +
    '> 🏦 ' + botName + ' 🏦'

  react('🏦')

  const img = (global.images && global.images.economy) ? global.images.economy : null
  if (img) {
    try {
      await conn.sendMessage(m.chat, { image: { url: img }, caption: menuText }, { quoted: m })
    } catch { await m.reply(menuText) }
  } else {
    await m.reply(menuText)
  }
}

handler.help    = ['قسم_البنك']
handler.tags    = ['main']
handler.command = /^(قسم_البنك|قسمالبنك|قسم_الاقتصاد|economy)$/i

export default handler