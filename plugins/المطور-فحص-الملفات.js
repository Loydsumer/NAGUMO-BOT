import fs from 'fs'
import path from 'path'

var handler = async (m, { usedPrefix, command, conn }) => {
  try {
    await m.react('🕒')
    conn.sendPresenceUpdate('composing', m.chat)

    const pluginsDir = './plugins'
    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))
    let response = `🕵️‍♂️ *فحص ملفات النظام عن أخطاء البرمجة...*\n\n`
    let hasErrors = false

    for (const file of files) {
      try {
        await import(path.resolve(pluginsDir, file))
      } catch (error) {
        hasErrors = true
        response += `⚠️ *خطأ في الملف:* ${file}\n\n🩸 *الرسالة:* ${error.message}\n\n───────────────\n`
      }
    }

    if (!hasErrors) {
      response += `✨ كل شيء على ما يرام يا دون كورليوني.\nلم يتم العثور على أي أخطاء في الملفات.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    } else {
      response += `\n🩸 *تم الانتهاء من الفحص.*\nراجع الأخطاء أعلاه بعناية، فحتى أعظم العائلات قد تخطئ...\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    }

    await conn.reply(m.chat, response, m)
    await m.react('✔️')

  } catch (err) {
    await m.react('✖️')
    await conn.reply(m.chat, `⚠️ حدث خطأ أثناء تنفيذ الفحص.\n> جرب مرة أخرى أو بلّغ عن المشكلة.\n\n📜 *الرسالة:* ${err.message}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`, m)
  }
}

handler.help = ['syntax', 'فحص-الملفات']
handler.tags = ['tools']
handler.command = ['syntax', 'detectar', 'errores', 'فحص', 'فحص-الملفات']
handler.rowner = true

export default handler