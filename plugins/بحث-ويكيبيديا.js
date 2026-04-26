import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    let ejemplo = `${usedPrefix}${command} اوغامي كورليوني`
    let explicacion = ''

    if (command === 'wiki' || command === 'wikipedia' || command === 'ويكيبيديا' || command === 'بحث') {
      explicacion = `👻 *اسمعني يا صديقي...*\nإذا كنت تريد أن تعرف شيئًا من موسوعة البشر، فقط اكتب ما تبحث عنه بعد الأمر.\n\n📘 *مثال:* \n> ${ejemplo}\n\nوسأجلب لك الحقيقة كما هي، دون تزييف...`
    }

    await conn.reply(m.chat, explicacion, m)
    return
  }

  try {
    await m.react('🕒')
    const link = await axios.get(`https://ar.wikipedia.org/wiki/${encodeURIComponent(text)}`)
    const $ = cheerio.load(link.data)

    let wik = $('#firstHeading').text().trim()
    let contenido = $('#mw-content-text > div.mw-parser-output').find('p').text().trim()

    if (!wik || !contenido) {
      await m.react('✖️')
      return await m.reply(`👻 *ابني... لم أجد شيئًا عن "${text}".*\nجرّب كلمة أخرى.`, m)
    }

    let mensaje = `👻 *ويكيبيديا*\n\n📖 *الموضوع:* ${wik}\n\n${contenido}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`

    await m.reply(mensaje)
    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    await m.reply(`👻 حدث خطأ أثناء تنفيذ الأمر.\n> استخدم *${usedPrefix}ابلغ* لتقديم بلاغ عن المشكلة.\n\n📄 التفاصيل: ${e.message}`, m)
  }
}

handler.help = ['wikipedia', 'wiki', 'ويكيبيديا', 'بحث']
handler.tags = ['tools']
handler.command = ['wiki', 'wikipedia', 'ويكيبيديا', 'بحث']
handler.group = true

export default handler