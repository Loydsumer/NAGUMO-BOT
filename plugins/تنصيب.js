import pkg from '@whiskeysockets/baileys'
import { xpRange } from '../lib/levelling.js'
const { prepareWAMessageMedia } = pkg

// 🕒 دالة الوقت
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

// 🗂️ الأقسام
const menuCategories = {
  qr: 'التسجل عبر الQr',
  code: 'التسجيل عبر الكود'
};

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🍓', key: m.key } })
    
    const image = 'https://files.catbox.moe/5ltird.jpg'
    let uptime = clockString(process.uptime() * 1000)
    let user = global.db.data.users[m.sender] || {}
    let { role, level, exp } = user
    let mentionId = m.key.participant || m.key.remoteJid
    let rtotalreg = Object.keys(global.db.data.users).length
    let now = new Date()
    let week = now.toLocaleDateString('ar-TN', { weekday: 'long' })
    let time = now.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })

    // 🗂️ إنشاء صفوف الأقسام (rows) مزخرفة
    const rows = Object.entries(menuCategories).map(([id, title], i) => ({
      title,
      description: `⁞🌟⁞ ↯انقر لاختيار ${title}↯ ⁞🌟`,
      id: `.${id}`
    }))

    // 💬 الكابشن المزخرف
    const caption = `*⁞🌟⁞ ↯مـرحبـاً @${mentionId.split('@')[0]}↯ ⁞🌟⁞*
*┃⏰ مدة التشغيل : ${uptime}*
*┃👥 المستخدمين : ${rtotalreg}*
*┃📝 طريقة تسجيل Sub-Bot:*
1 » اضغط على الثلاث نقاط في الأعلى
2 » اختر أجهزة متصلة
3 » ربط مع رقم الهاتف
4 » أدخل الكود لتسجيل الدخول`.trim()

    // 🚀 إرسال القائمة المزخرفة
    await conn.sendMessage(m.chat, {
      product: {
        productImage: { url: image },
        productId: '24529689176623820',
        title: '⁞🌟⁞ ↯SerBot↯ ⁞🌟⁞',
        description: '⁞🌟⁞ ↯قائمة منظمة لجميع طرق تسجيل Sub-Bot↯ ⁞🌟⁞',
        currencyCode: 'USD',
        priceAmount1000: '20',
        retailerId: 'SerBot',
        url: 'https://wa.me/p/24639031392385404/967738512629',
        productImageCount: 1
      },
      businessOwnerJid: '967738512629@s.whatsapp.net',
      caption,
      footer: '⁞🌟⁞ ↯SerBot↯ ⁞🌟⁞',
      mentions: [m.sender],
      interactiveButtons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '⁞🌟⁞ ↯اختر الطريقة↯ ⁞🌟⁞',
            sections: [
              {
                title: '⁞🌟⁞ ↯طرق Sub-Bot↯ ⁞🌟⁞',
                highlight_label: 'SerBot',
                rows
              }
            ]
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: '{"display_text":"⁞🌟⁞ ↯قناة المطور↯ ⁞🌟⁞","url":"https://whatsapp.com/channel/0029Vb6qkXM8V0tvdYh1fJ2g"}'
        },
        {
          name: 'quick_reply',
          buttonParamsJson: '{"display_text":"⁞🌟⁞ ↯الـمـطـور↯ ⁞🌟⁞","id":".المطور"}'
        }
      ]
    })

  } catch (err) {
    console.error('❌ خطأ في عرض القائمة:', err)
    await conn.sendMessage(m.chat, { text: `⚠️ خطأ أثناء عرض القائمة:\n${err.message}` })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['تنصيب', 'فعل']

export default handler