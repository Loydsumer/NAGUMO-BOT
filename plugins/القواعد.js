import fetch from 'node-fetch'

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

let handler = async (m, { conn }) => {
  try {
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0]

    // تحميل الصورة من الرابط
    let img = await (await fetch('https://files.catbox.moe/uq9an4.jpg')).buffer()

    let str = `
*╮═『⛩️┃𝐅υׁ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭┃⛩️』═╭*
*┇🏮👋 أهلاً بـ〘${taguser}〙*
*┇◞⛩️بِسْمِ اللّٰه الرَّحْمٰنِ الرَّحِيم⛩️◜*
*┇◞{يرجى الالتزام بالقوانين لتجنب العقوبات}◜*
*╯✯≼══━━﹂⛩️﹁━━══≽✯*

*╮═『⛩️┃📝 قوانين البوت┃⛩️』═╭*
*┇🏮📌║مخالفات التنبيه:*  
*① التحدث بلغة غير العربية*  
*② مضايقة الأعضاء*  
*③ الرسائل الصوتية المزعجة*  
*④ الرسائل التافهة*  
*⑤ تنبيه غير مدون إذا لزم الأمر*  
*⑥ تنبيهين = إنذار*  
*╯✯≼══━━﹂⛩️﹁━━══≽✯*

*╮═『⛩️┃⚠️ مخالفات الإنذار┃⛩️』═╭*
*┇🏮📌║① الحرق المتعمد*  
*┇🏮📌║② الاعتراض على قرار المشرف*  
*┇🏮📌║③ إرسال 5 رسائل متتالية بدون فائدة*  
*┇🏮📌║④ التحدث عن الهانتاي*  
*┇🏮📌║⑤ التشفير قد يتضاعف*  
*┇🏮📌║⑥ الإيموجيات المزعجة*  
*╯✯≼══━━﹂⛩️﹁━━══≽✯*

*╮═『⛩️┃🔥 مخالفات المؤبد┃⛩️』═╭*
*┇🏮📌║① شتم عضو أو مشرف بطريقة مباشرة*  
*┇🏮📌║② سب الدين أو السياسة بشكل عام*  
*┇🏮📌║③ سرقة أعضاء أو نشر روابط*  
*┇🏮📌║④ السب/الشتم أو إرسال أي محتوى فاحش*  
*┇🏮📌║⑤ الاحتكاك في الجنس الآخر*  
*╯✯≼══━━﹂⛩️﹁━━══≽✯*

*⏤͟͞ू⃪ 𝐅υׁ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭🌺⃝𖤐*
`.trim()

    let buttonMessage = {
      image: img,
      caption: str,
      footer: '⏤͟͞ू⃪ 𝐅υׁ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭',
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: '2',
          mediaUrl: 'https://chat.whatsapp.com/C5POy45VSoiDtnXlOlgeP1',
          title: '『👑┃𝐅υׁ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭┃👑』',
          body: '『⛩️┃دعـم الـبـوت┃⛩️』',
          thumbnail: img
        }
      }
    }

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } })

  } catch (err) {
    console.error(err)
    m.reply('[❗INFO❗] حدث خطأ أثناء عرض القوانين، يرجى الإبلاغ للمالك.')
  }
}

handler.help = ['القوانين']
handler.tags = ['main']
handler.command = /^(rules|rule|القوانين|القواعد)$/i

export default handler