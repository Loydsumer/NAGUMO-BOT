// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 //  ℹ️ قسم الألقاب
 //  🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓
 // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• ℹ️ •┇✦▬▬▬✦』*~\n' +
    '║     ℹ️ قسم الألقاب ℹ️     ║\n' +
    '~*『✦▬▬▬✦┇• ℹ️ •┇✦▬▬▬✦』*~\n\n' +
    'ℹ️│ ' + usedPrefix + 'لقب\n' +
    'ℹ️│ ' + usedPrefix + 'لقبي\n' +
    'ℹ️│ ' + usedPrefix + 'الألقاب\n' +
    'ℹ️│ ' + usedPrefix + 'حذف_لقب\n\n' +
    '> ℹ️ ' + botName + ' ℹ️'

  react('ℹ️')

  const img = (global.images && global.images.info) ? global.images.info : null
  if (img) {
    try {
      await conn.sendMessage(m.chat, { image: { url: img }, caption: menuText }, { quoted: m })
    } catch { await m.reply(menuText) }
  } else {
    await m.reply(menuText)
  }
}

handler.help    = ['قسم_الالقاب']
handler.tags    = ['main']
handler.command = /^(قسم_الالقاب|قسم_الألقاب|قسمالالقاب|titles)$/i

export default handler