import axios from "axios"
import FormData from "form-data"

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    
    // إصلاح: التحقق من وجود m.body بشكل آمن
    const command = m.body ? m.body.split(' ')[0].toLowerCase() : usedPrefix + 'تحليل'
    
    if (!mime.startsWith('image/')) {
      return conn.reply(m.chat, 
        `👻 *اسمع يا ولدي*... الصورة وينها؟ 🤌\n\n` +
        `• ارسل لي الصورة واكتب: *${usedPrefix}تحليل*\n` +
        `• او رد على الصورة واكتب الامر\n\n` +
        `*طريقة الاستخدام الصحيحة:*\n` +
        `1. ارسل صورة اولاً\n` +
        `2. ثم ارد عليها ب *${usedPrefix}تحليل*\n\n` +
        `*اوغامي ما بيقبل الا الصور الحقيقية* 📸\n\n` +
        `🅥🅘🅣🅞 🅒🅞🅡🅛🅔🅞🅝🅔 👻`, m)
    }
    
    await m.react('🕒')
    await conn.reply(m.chat, `👻 *اصبر شوي يا حبيبي*... جاري فحص الصورة 🔍\n*العائلة بتشتغل على طلبك* 👨‍👩‍👧‍👦`, m)
    
    const buffer = await q.download()
    const form = new FormData()
    form.append("file", buffer, { filename: "image.jpg" })
    
    let { data } = await axios.post("https://be.neuralframes.com/clip_interrogate/", form, {
      headers: {
        ...form.getHeaders(),
        "Accept": "application/json, text/plain, */*",
        "Authorization": "Bearer uvcKfXuj6Ygncs6tiSJ6VXLxoapJdjQ3EEsSIt45Zm+vsl8qcLAAOrnnGWYBccx4sbEaQtCr416jxvc/zJNAlcDjLYjfHfHzPpfJ00l05h0oy7twPKzZrO4xSB+YGrmCyb/zOduHh1l9ogFPg/3aeSsz+wZYL9nlXfXdvCqDIP9bLcQMHiUKB0UCGuew2oRt",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
        "Referer": "https://www.neuralframes.com/tools/image-to-prompt"
      }
    })
    
    await m.react('✅')
    
    // إصلاح: استخدام command بشكل آمن
    let actionType = 'تحليل'
    if (command.includes('وصف') || command.includes('describe')) {
      actionType = 'وصف'
    }
    
    const message = `👻 *اسمع جيدا يا ولدي*... هذا ${actionType} صورتك 📝\n\n` +
                    `*النتيجة:*\n"${data.prompt}"\n\n` +
                    `*العائلة دائما تقدم الدقة والوضوح* 💎\n\n` +
                    `🅥🅘🅣🅞 🅒🅞🅡🅛🅔🅞🅝🅔 👻`
    
    await conn.reply(m.chat, message, m)
    
  } catch (e) {
    await m.react('❌')
    
    // رسالة خطأ محسنة مع إرشادات أوضح
    let errorMessage = `👻 *مشكلة في النظام يا حبيبي*... 🤌\n\n`
    
    if (e.message.includes('split')) {
      errorMessage += `*المشكلة:* الأمر ما انكتب بشكل صحيح\n\n`
    } else {
      errorMessage += `*الخطأ:* ${e.message}\n\n`
    }
    
    errorMessage += `*طريقة الاستخدام الصحيحة:*\n` +
                    `1. ارسل الصورة اولاً\n` +
                    `2. ارد عليها ب *${usedPrefix}تحليل*\n\n` +
                    `*او استعمل:* ${usedPrefix}بلاغ *لإبلاغ عن مشكلة*\n` +
                    `*العائلة ما بتقبل الإهمال* ⚠️\n\n` +
                    `🅥🅘🅣🅞 🅒🅞🅡🅛🅔🅞🅝🅔 👻`
    
    await conn.reply(m.chat, errorMessage, m)
  }
}

// الأوامر العربية والإنجليزية
handler.help = ['تحليل', 'topromt', 'وصف']
handler.command = ['تحليل', 'topromt', 'وصف', 'describe']
handler.tags = ['ai']

export default handler