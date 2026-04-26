// 🎵 تحميل صوت من YouTube 🤖
// 🅾🅶🅰🅼🅸 🅱🅾🆃

import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    let contoh = `${usedPrefix + command} سورة الكهف بصوت ماهر المعيقلي`
    return m.reply(
      `🤖 *كيفية الاستخدام:*\n` +
      `اكتب رابط أو عنوان المقطع الصوتي الذي تريد تحميله.\n\n` +
      `📌 *مثال:*\n${contoh}`
    )
  }

  m.react("🎧")

  let url
  let query = text.trim()

  if (query.startsWith('http')) {
    url = query
  } else {
    let search = await yts(query)
    if (!search.videos.length) throw '❗ لم يتم العثور على نتائج.'
    url = search.videos[0].url
  }

  try {
    m.reply(`🔊 *جاري تحميل الصوت بأعلى جودة...\nيرجى الانتظار 🤖*`)

    let res = await fetch(`https://api.rapikzyeah.biz.id/api/downloader/donlotyete?url=${encodeURIComponent(url)}&type=mp3&quality=256`)
    let json = await res.json()

    if (!json.downloadUrl) throw '🤖 لم يتم العثور على رابط التنزيل.'

    await conn.sendMessage(m.chat, {
      audio: { url: json.downloadUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: m })

    await m.reply(`🎶 *تم تحميل الصوت بنجاح*\n📄 *العنوان:* ${json.title}\n🎚️ *الجودة:* 256kbps\n\n🅾🅶🅰🅼🅸 🅱🅾🆃`)
  } catch (e) {
    m.reply(`❗ حدث خطأ أثناء التحميل:\n${e.message}`)
  }

  m.react("✅")
}

handler.help = ['تحميل-صوت <رابط أو عنوان>']
handler.tags = ['downloader']
handler.command = ['yta', 'صوتوي']
handler.register = true

export default handler