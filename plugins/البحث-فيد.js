// 🎬 تحميل فيديو من YouTube 🤖
// 🅾🅶🅰🅼🅸 🅱🅾🆃

import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    let contoh = `${usedPrefix + command} سورة الكهف بصوت ماهر المعيقلي 720 mp4`
    return m.reply(
      `🤖 *كيفية الاستخدام:*\n` +
      `اكتب رابط أو عنوان المقطع مع اختيار الجودة والصيغة (اختياري).\n\n` +
      `📌 *مثال:*\n${contoh}`
    )
  }

  m.react("📹")

  try {
    let args = text.split(' ')
    let lastArg = args[args.length - 1].toLowerCase()
    let secondLastArg = args[args.length - 2]?.toLowerCase()

    let isQuality = /^[0-9]{3,4}p?$/.test(lastArg)
    let isFormat = ['mp4', 'mp3'].includes(lastArg)

    let quality = isQuality ? lastArg.replace(/p$/, '') : (isQuality ? lastArg : '144')
    let format = isFormat ? lastArg : 'mp4'

    if (isQuality && ['mp4', 'mp3'].includes(secondLastArg)) {
      format = secondLastArg
    }

    let query = args
      .filter(x => x !== lastArg && x !== secondLastArg) // إزالة الجودة والصيغة
      .join(' ')
      .trim()

    let urlYT = ''

    // ✅ التحقق من الرابط
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(query)) {
      urlYT = query
    } else {
      // 🔍 البحث باستخدام yt-search
      let search = await yts(query)
      if (!search?.videos?.length) throw '🤖 لم يتم العثور على نتائج.'
      urlYT = search.videos[0].url
    }

    let res = await fetch(`https://api.rapikzyeah.biz.id/api/downloader/donlotyete?url=${encodeURIComponent(urlYT)}&type=${format}&quality=${quality}`)
    let json = await res.json()

    if (!json.downloadUrl) throw '🤖 لم يتم العثور على رابط التنزيل.'

    await conn.sendFile(m.chat, json.downloadUrl, `video.${format}`, 
      `🎞️ *تم تحميل الفيديو بنجاح*\n📄 *العنوان:* ${json.title}\n🎚️ *الدقة:* ${json.quality}\n🧾 *الصيغة:* ${format}\n\n🅾🅶🅰🅼🅸 🅱🅾🆃`, 
      m)

    m.react("✅")

  } catch (e) {
    console.error(e)
    m.reply(`❗ حدث خطأ:\n${e.message || e}`)
  }
}

handler.help = ['ytv <رابط أو عنوان> [الجودة] [mp4/mp3]']
handler.tags = ['downloader']
handler.command = ['ytv', 'فيد']
handler.limit = true

export default handler