let handler = async (m, { conn, usedPrefix }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const botName = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'

  const menuText = '~*『✦▬▬▬✦┇• 🔗 •┇✦▬▬▬✦』*~\n' +
    '║     🔗 قسم التحميلات 🔗     ║\n' +
    '~*『✦▬▬▬✦┇• 🔗 •┇✦▬▬▬✦』*~\n\n' +
    '🔗│ ' + usedPrefix + 'تيك <رابط>\n' +
    '🔗│ ' + usedPrefix + 'اديت <اسم شخصية>\n' +
    '🔗│ ' + usedPrefix + 'يوتيوب <رابط>\n' +
    '🔗│ ' + usedPrefix + 'احكي>\n' +
    '🔗│ ' + usedPrefix + 'بحث <كلمة>\n' +
    '🔗│ ' + usedPrefix + 'ساوند <اسم اغنية>\n' +
    '🔗│ ' + usedPrefix + 'انستا <رابط>\n' +
    '🔗│ ' + usedPrefix + 'فيس <رابط>\n' +
    '🔗│ ' + usedPrefix + 'تويتر <رابط>\n' +
    '🔗│ ' + usedPrefix + 'بنترست <بحث>\n\n' +
    '🔗│ ' + usedPrefix + 'تحميل\n\n' +    
    '> 🔗 ' + botName + ' 🔗'

  react('🔗')

  const img = (global.images && global.images.downloader) ? global.images.downloader : null
  if (img) {
    try {
      await conn.sendMessage(m.chat, { image: { url: img }, caption: menuText }, { quoted: m })
    } catch { await m.reply(menuText) }
  } else {
    await m.reply(menuText)
  }
}

handler.help = ['قسم_التحميلات']
handler.tags = ['main']
handler.command = /^(قسم_التحميلات|قسمالتحميلات|تحميلات|download|dl)$/i

export default handler