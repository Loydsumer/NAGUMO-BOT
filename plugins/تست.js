import pkg from '@whiskeysockets/baileys'
const { generateWAMessageFromContent } = pkg

let handler = async (m, { conn }) => {
  const jid = m.chat

  // 🔹 مثال بسيط بدون ميديا
  await conn.sendMessage(
    jid,
    {
      text: "📜 هذا مثال على رسالة تفاعلية!",
      title: "🌸 رسالة تجريبية",
      subtitle: "⌯ اضغط أحد الأزرار بالأسفل",
      footer: "⚙️ نظام Ruby-Hoshino",
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "زر رد سريع 💬",
            id: "quick_test"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "رابط خارجي 🌐",
            url: "https://example.com"
          })
        }
      ]
    },
    { quoted: m }
  )

  // 🔹 مثال مع صورة
  await conn.sendMessage(
    jid,
    {
      image: { url: "https://files.catbox.moe/cjm3zw.jpg" }, // الرابط الجديد
      caption: "📜 هذا مثال على رسالة مع صورة!",
      title: "🖼️ عرض بالصورة",
      subtitle: "اضغط أحد الأزرار للتجربة",
      footer: "⚙️ Ruby-Hoshino",
      media: true,
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "رد سريع 💬",
            id: "quick_img"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "زر برابط 🔗",
            url: "https://example.com"
          })
        }
      ]
    },
    { quoted: m }
  )

  // 🔹 مثال مع منتج (Product Message)
  await conn.sendMessage(
    jid,
    {
      product: {
        productImage: { url: "https://files.catbox.moe/cjm3zw.jpg" }, // نفس الصورة
        productImageCount: 1,
        title: "🎁 منتج تجريبي",
        description: "🧩 هذا مثال على رسالة تفاعلية تحتوي على منتج.",
        priceAmount1000: 20000 * 1000,
        currencyCode: "USD",
        retailerId: "Store-Test",
        url: "https://example.com"
      },
      businessOwnerJid: "123456789@s.whatsapp.net",
      caption: "🛍️ جرب الأزرار أدناه!",
      title: "💼 منتج - Ruby System",
      footer: "⚙️ متجر تجريبي",
      media: true,
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "رد سريع 🛒",
            id: "quick_product"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "رابط المتجر 🌐",
            url: "https://example.com"
          })
        }
      ]
    },
    { quoted: m }
  )
}

handler.command = ['test']

export default handler