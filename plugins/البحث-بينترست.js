// ==============================
// 🤖 BY TAEB-VETO BOT
// 🌐 عرض 10 صور من Pinterest بشكل منظم - RTL
// ==============================

import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text)
    return m.reply(`⚠️ يرجى كتابة كلمة البحث.\n\n📌 مثال:\n.pint أنمي`)

  try {
    await m.react('🕐')

    let apiUrl = `https://api-tyson-md.vercel.app/api/download/pinterest?q=${encodeURIComponent(text)}`
    let res = await fetch(apiUrl)
    let data = await res.json()

    if (!data || !data.status || data.status !== "نجاح ✅") {
      await m.react('❌')
      return m.reply(`❌ لم يتم العثور على نتائج لكلمة *${text}*`)
    }

    let pins = data.pins.slice(0, 10) // 👈 10 صور كما طلبت
    if (!pins.length) {
      await m.react('❌')
      return m.reply(`❌ لا توجد صور لنتائج البحث عن *${text}*`)
    }

    // تنسيق العنوان الرئيسي
    let captionHeader = `
📸 *نتائج البحث عن:* ${text}
🖼️ *عدد الصور:* 10
🤖 *BY TAEB-VETO BOT*
━━━━━━━━━━━━━━━
    `.trim()

    // إرسال الرسالة الأولى مع العنوان
    await conn.sendMessage(m.chat, {
      text: captionHeader
    }, { quoted: m })

    // إرسال جميع الصور (10 صور)
    for (let i = 0; i < pins.length; i++) {
      let pin = pins[i]
      
      let caption = `
🎯 *العنوان:* ${pin.title || '— بدون عنوان —'}
👤 *الرفع بواسطة:* ${pin.uploader?.full_name || 'مجهول'}
🔗 *الرابط:* ${pin.pin_url || '—'}
📊 *الصورة ${i + 1} من ${pins.length}*
🤖 *BY TAEB-VETO BOT*
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: pin.image },
        caption: caption
      }, { quoted: m })

      // تأخير بين كل صورة لتجنب الحظر
      if (i < pins.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    // رسالة الختام
    await conn.sendMessage(m.chat, {
      text: `✅ *تم الانتهاء من عرض ${pins.length} صورة*\n🤖 BY TAEB-VETO BOT`
    }, { quoted: m })

    await m.react('✅')

  } catch (err) {
    console.error(err)
    await m.react('❌')
    m.reply('⚠️ حدث خطأ أثناء جلب النتائج، يرجى المحاولة لاحقًا.')
  }
}

handler.help = ['pint <كلمة>']
handler.tags = ['tools']
handler.command = /^(pint|بينتر|بينترست|بين)$/i

export default handler