import acrcloud from "acrcloud"

const acr = new acrcloud({
  host: "identify-ap-southeast-1.acrcloud.com",
  access_key: "ee1b81b47cf98cd73a0072a761558ab1",
  access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI"
})

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m

  if (!q.mimetype || (!q.mimetype.includes("audio") && !q.mimetype.includes("video"))) {
    let ejemplo = `${usedPrefix}${command} 🎵`
    let explicacion = ''

    if (command === 'whatmusic' || command === 'shazam' || command === 'ماالأغنية' || command === 'ماهي-الأغنية' || command === 'تعرف-الأغنية') {
      explicacion = `👻 *اسمعني جيدًا يا صديقي...*\nأرسل لي مقطعًا صوتيًا أو رُدَّ على صوت، وسأخبرك باسم الأغنية كما لو أنني شازام نفسه.\n\n🎧 *مثال:*\n> ${ejemplo}\n\nولا تُضِع وقتي في الصمت...`
    }

    await conn.reply(m.chat, explicacion, m)
    return
  }

  let buffer = await q.download()
  try {
    await m.react('🕒')
    let data = await whatmusic(buffer)

    if (!data.length) {
      await m.react('✖️')
      return m.reply("👻 لم أجد شيئًا يخص هذه الأغنية، يبدو أنها نادرة كذكرياتي القديمة...")
    }

    let cap = `👻 *تعرّف على الأغنية*\n\n`

    for (let result of data) {
      const enlaces = Array.isArray(result.url) ? result.url.filter(x => x) : []
      cap += `🎵 *العنوان:* ${result.title}\n`
      cap += `🎤 *الفنان:* ${result.artist}\n`
      cap += `🕒 *المدة:* ${result.duration}\n`
      cap += `🌐 *الروابط:* ${enlaces.map(i => `\n${i}`).join("\n")}\n`
      if (enlaces.length) cap += "••••••••••••••••••••••••••••••••••••••\n"
    }

    cap += `\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`

    await conn.relayMessage(m.chat, {
      extendedTextMessage: {
        text: cap,
        contextInfo: {
          externalAdReply: {
            title: '👻 OGAMI • What Music 👻',
            body: 'حينما يُريد العرّاب معرفة اللحن...',
            mediaType: 1,
            previewType: 0,
            renderLargerThumbnail: true,
            thumbnail: await (await fetch('https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742781294508.jpeg')).buffer(),
            sourceUrl: 'https://open.spotify.com'
          }
        }
      }
    }, { quoted: m })

    await m.react('✔️')

  } catch (error) {
    await m.react('✖️')
    m.reply(`👻 حدث خطأ أثناء التعرف على الأغنية.\n> استخدم *${usedPrefix}ابلغ* إذا أردت رفع شكوى.\n\n📄 التفاصيل: ${error.message}`)
  }
}

handler.help = ["whatmusic", "shazam", "ماالأغنية", "ماهي-الأغنية", "تعرف-الأغنية"]
handler.tags = ["tools"]
handler.command = ["whatmusic", "shazam", "ماالأغنية", "ماهي-الأغنية", "تعرف-الأغنية"]
handler.group = true

export default handler

// 🧠 دالة التعرف على الموسيقى
async function whatmusic(buffer) {
  let res = await acr.identify(buffer)
  let data = res?.metadata
  if (!data || !Array.isArray(data.music)) return []
  return data.music.map(a => ({
    title: a.title,
    artist: a.artists?.[0]?.name || "غير معروف",
    duration: toTime(a.duration_ms),
    url: Object.keys(a.external_metadata || {}).map(i =>
      i === "youtube" ? "https://youtu.be/" + a.external_metadata[i].vid :
      i === "deezer" ? "https://www.deezer.com/track/" + a.external_metadata[i].track.id :
      i === "spotify" ? "https://open.spotify.com/track/" + a.external_metadata[i].track.id : ""
    ).filter(Boolean)
  }))
}

// ⏱️ تحويل الوقت
function toTime(ms) {
  if (!ms || typeof ms !== "number") return "00:00"
  let m = Math.floor(ms / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [m, s].map(v => v.toString().padStart(2, "0")).join(":")
}