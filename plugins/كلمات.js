import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`🎵 *الاستخدام:* ${usedPrefix + command} <اسم الأغنية>\n📌 مثال: ${usedPrefix + command} 505`)

    const api = `https://dark-api-x.vercel.app/api/v1/search/lyrics?text=${encodeURIComponent(text)}`
    const { data } = await axios.get(api)

    if (!data.status) return m.reply('❌ لم يتم العثور على كلمات لهذه الأغنية.')

    const { title, artist, lyrics, message } = data

    let caption = `🎶 *${title}* — *${artist}*\n\n${lyrics}\n\n${message}`

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: `🎵 ${title} - ${artist}`,
          body: '⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐',
          thumbnailUrl: 'https://i.imgur.com/2nCt3Sbl.jpg', // يمكنك تغيير الصورة
          mediaUrl: `https://chat.whatsapp.com/KOSYkTDnY7H6ar8mLKosZf?mode=ems_copy_t`,
          mediaType: 2,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('⚠️ حدث خطأ أثناء جلب كلمات الأغنية.')
  }
}

handler.help = ['lyric <اسم الأغنية>']
handler.tags = ['music']
handler.command = /^(lyric|lyrics|كلمات|كلمات-اغنيه)$/i
export default handler