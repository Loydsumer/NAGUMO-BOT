// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 //  🛡️ قسم الحماية
 //  🤖 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓
 // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• 🛡️ •┇✦▬▬▬✦』*~\n' +
    '║     🛡️ قسم الحماية 🛡️     ║\n' +
    '~*『✦▬▬▬✦┇• 🛡️ •┇✦▬▬▬✦』*~\n\n' +
    '🛡️│ ' + usedPrefix + 'ضد_لينك\n' +
    '🛡️│ ' + usedPrefix + 'ضد_بوت\n' +
    '🛡️│ ' + usedPrefix + 'مضاد_سبام\n' +
    '🛡️│ ' + usedPrefix + 'كيك_غير_فاعل\n' +
    '🛡️│ ' + usedPrefix + 'جهاز\n' +
    '🛡️│ ' + usedPrefix + 'وضع\n\n' +    
    '> 🛡️ ' + botName + ' 🛡️'

  react('🛡️')

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

handler.help = ['قسم_الحماية']
handler.tags = ['main']
handler.command = /^(قسم_الحماية|قسمالحماية|protection)$/i

export default handler