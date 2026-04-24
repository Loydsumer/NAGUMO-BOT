/*
• @David-Chian + تحويل العرض إلى بطاقات تفاعلية بواسطة Felix
• تعديل: البحث تلقائيًا عن خلفيات أنمي
*/

import fetch from 'node-fetch'
import baileys from '@whiskeysockets/baileys'

const { generateWAMessageContent, generateWAMessageFromContent, proto } = baileys

const animeBackgrounds = async (m, { conn, usedPrefix, command }) => {
  const text = '4K anime wellpaper'; // البحث تلقائيًا عن خلفيات أنمي

  await m.react('⏳')
  conn.reply(m.chat, '⏱️ *جارٍ تحميل خلفيات الانمي ...*', m)

  async function createImageMessage(url) {
    const { imageMessage } = await generateWAMessageContent(
      { image: { url } },
      { upload: conn.waUploadToServer }
    )
    return imageMessage
  }

  try {
    const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`)
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      await m.react('❌')
      return conn.reply(m.chat, '❌ لم يتم العثور على خلفيات كافية.', m)
    }

    // نأخذ أول 6 صور فقط لعرضها كبطاقات
    const images = data.slice(0, 6).map(item => item.image_large_url || item.image)
    let counter = 1
    let cards = []

    for (let imageUrl of images) {
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `📌 *خلفية أنمي رقم:* ${counter++}`
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          hasMediaAttachment: true,
          imageMessage: await createImageMessage(imageUrl)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🔗 فتح  ',
                url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`
              })
            },
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: '📋 نسخ ',
                copy_code: imageUrl
              })
            }
          ]
        })
      })
    }

    const finalMessage = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: '> 🔍 *تم تحميل خلفيات أنمي رائعة لك!*'
              }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards
              })
            })
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id })
    await m.react('✅')
  } catch (error) {
    console.error(error)
    await m.react('❌')
    conn.reply(m.chat, '⚠️ حدث خطأ أثناء الحصول على الخلفيات من Pinterest.', m)
  }
}

animeBackgrounds.help = ['خلفيات']
animeBackgrounds.tags = ['anime', 'wallpaper']
animeBackgrounds.command = /^(خلفيات|خلفيه)$/i
animeBackgrounds.register = true

export default animeBackgrounds