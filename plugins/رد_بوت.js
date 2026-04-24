import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let audioUrl = 'https://files.catbox.moe/j66nlc.opus'
    let thumbnailUrl = 'https://files.catbox.moe/2m78dh.jpg'

    let res = await fetch(thumbnailUrl)
    if (!res.ok) throw new Error(`فشل تحميل الصورة: ${res.statusText}`)

    let thumbnail = Buffer.from(await res.arrayBuffer())

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4', // استخدم 'audio/ogg; codecs=opus' لو الصوت بصيغة opus حقيقية
      ptt: true,
      fileName: 'RADIO-DEMON.mp3',
      contextInfo: {
        externalAdReply: {
          title: "𝑅𝐴𝐷𝐼𝛩 𝐷𝐸𝑀𝛩𝑁",
          body: "𝐅υׁׅ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭",
          thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          mediaUrl: "https://wa.me/201500564191",
          sourceUrl: "https://wa.me/201500564191"
        }
      }
    }, {
      quoted: m,
      buttons: [
        { buttonId: '.الاوامر', buttonText: { displayText: '🧾 عرض الأوامر' }, type: 1 }
      ],
      headerType: 1
    })
  } catch (err) {
    console.error(err)
    m.reply('❌ حدث خطأ أثناء إرسال الرد الصوتي.')
  }
}

handler.customPrefix = /^(بوت|يا بوت)$/i
handler.command = new RegExp // يسمح له بالعمل دون أمر صريح، فقط على النداء
export default handler