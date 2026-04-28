// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 //  🖼️ قسم الصور والستيكر
 //  🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓
 // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• 🖼️ •┇✦▬▬▬✦』*~\n' +
    '║     🖼️ قسم الصور 🖼️     ║\n' +
    '~*『✦▬▬▬✦┇• 🖼️ •┇✦▬▬▬✦』*~\n\n' +
    '🖼️│ ' + usedPrefix + 'ستيكر\n' +
    '🖼️│ ' + usedPrefix + 'ستيكر_صورة\n' +
    '🖼️│ ' + usedPrefix + 'ستيكر_فيديو\n' +
    '🖼️│ ' + usedPrefix + 'صورة_ستيكر\n\n' +
    '> 🖼️ ' + botName + ' 🖼️'

  react('🖼️')

  const img = (global.images && global.images.tools) ? global.images.tools : null
  if (img) {
    try {
      await conn.sendMessage(m.chat, { image: { url: img }, caption: menuText }, { quoted: m })
    } catch { await m.reply(menuText) }
  } else {
    await m.reply(menuText)
  }
}

handler.help    = ['قسم_الصور']
handler.tags    = ['main']
handler.command = /^(قسم_الصور|قسم_الستيكر|قسمالصور|stickers)$/i

export default handler