import axios from 'axios'
import uploadImage from '../lib/uploadImage.js' // تأكد من وجود المكتبة في المسار الصحيح

export async function before(m, { conn }) {
  if (m.mtype === 'imageMessage' || (m.mtype === 'stickerMessage' && !m.isAnimated)) {
    try {
      // 🖼️ تحميل الصورة من الرسالة
      const buffer = await m.download()
      if (!buffer) return

      // ☁️ رفع الصورة للحصول على رابط مباشر
      const imageUrl = await uploadImage(buffer)
      if (!imageUrl) throw new Error('فشل في رفع الصورة.')

      // 🔍 فحص الصورة عبر API
      const res = await axios.get(`https://dark-api-x.vercel.app/api/v1/tools/check_porn?imageUrl=${encodeURIComponent(imageUrl)}`)
      const result = res.data.result

      if (!result || !result.labelName) {
        console.error('استجابة غير متوقعة:', res.data)
        return
      }

      // ⚠️ التحقق من وجود محتوى غير لائق
      const label = result.labelName.toLowerCase()
      const confidence = parseFloat(result.confidence)

      if (label === 'porn' && confidence >= 50) {
        try {
          // حذف الرسالة (إذا كان البوت مشرفًا)
          await conn.sendMessage(m.chat, { delete: m.key })
        } catch (err) {
          console.error('فشل في حذف الرسالة:', err.message)
        }

        // إرسال تحذير دائمًا
        await conn.reply(m.chat, '🚫 تم اكتشاف محتوى غير لائق وتمت محاولة حذفه.', m)
      }

    } catch (e) {
      console.error('⚠️ خطأ أثناء فحص الصورة:', e.message)
    }
  }
}