import axios from 'axios'
import baileys from '@whiskeysockets/baileys'
const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys

// 🧠 قائمة الشخصيات (عربي ⇢ إنجليزي)
const characters = {
  "غوجو": "Gojo Satoru",
  "كانيكي": "Kaneki Ken",
  "اليا": "Alia",
  "سوكونا": "Sukuna",
  "الاستور": "Alastor",
  "انيا": "Anya Forger",
  "ميكاسا": "Mikasa Ackerman",
  "ارمين": "Armin Arlert",
  "ايرين": "Eren Yeager",
  "ايتادوري": "Itadori Yuji",
  "كيرا": "Light Yagami",
  "ماكيما": "Makima",
  "باور": "Power",
  "دينجي": "Denji"
}

async function createImageMessage(conn, url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) return null
  const media = await prepareWAMessageMedia(
    { image: { url } },
    { upload: conn.waUploadToServer }
  )
  return media.imageMessage || null
}

// 🧩 دالة رئيسية للبحث عن الصور
async function searchAndSend(m, conn, query, displayName) {
  const searchTerm = `${query} 4K anime icons`
  await m.react('🔮')
  await conn.reply(m.chat, `> 📸 جاري البحث عن صور *${displayName}*...`, m)

  let images = []
  try {
    const res = await axios.get('https://dark-api-x.vercel.app/api/v1/search/pinterest', {
      params: { query: searchTerm }
    })
    images = res.data.pins?.map(pin => pin.image).filter(Boolean).slice(0, 10)
  } catch (e) {
    console.error(`⚠️ خطأ في API: ${e.message}`)
  }

  if (images.length === 0) {
    await m.react("❌")
    return m.reply(`❌ لم يتم العثور على نتائج لـ *"${displayName}"*.`)
  }

  let imagesList = []
  let counter = 1
  for (let imageUrl of images) {
    let imageMessage = await createImageMessage(conn, imageUrl)
    if (!imageMessage) continue

    imagesList.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `✨ *${displayName}* - 📸 صورة رقم ${counter++}`
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        hasMediaAttachment: true,
        imageMessage
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [{
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "🔗 عرض على Pinterest",
            url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchTerm)}`
          })
        }]
      })
    })
  }

  const finalMessage = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: "> 💫 تم العثور على صور بجودة 4K للشخصية المطلوبة!"
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: imagesList
          })
        })
      }
    }
  }, { quoted: m })

  await m.react("✅")
  await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id })
}

// 🧱 إنشاء handlers تلقائيًا لكل شخصية
let handlers = []
for (let [arabicName, englishName] of Object.entries(characters)) {
  let h = async (m, { conn }) => {
    await searchAndSend(m, conn, englishName, arabicName)
  }
  h.help = [arabicName]
  h.tags = ['شخصيات']
  h.command = new RegExp(`^(${arabicName})$`, 'i')
  h.register = true
  h.limit = 1
  handlers.push(h)
}

// ✅ تصدير جميع الشخصيات كأوامر مستقلة
export default handlers