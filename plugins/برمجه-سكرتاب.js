import cloudscraper from 'cloudscraper'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`❌ استخدم: ${usedPrefix}${command} <رابط فصل المانجا>`, m.chat, { quoted: m })

    const url = text.trim()
    await m.reply('⏳ جاري جلب الصفحة واستخراج روابط الصور ...', m.chat, { quoted: m })

    // جلب الصفحة (نستخدم user-agent لتقليل الحجب)
    const html = await cloudscraper.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
    const $ = cheerio.load(html)

    // استخراج الصور
    const images = []
    $('img.manga-chapter-img').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
      if (!src) return
      // تصحيح روابط //example.webp و روابط نسبية
      if (src.startsWith('//')) src = 'https:' + src
      if (!/^https?:\/\//i.test(src)) {
        try { src = new URL(src, url).toString() } catch (e) {}
      }
      images.push(src)
    })

    const unique = [...new Set(images)]

    if (!unique.length) return m.reply('⚠️ لم أجد أي صور في الصفحة (عنصر img.manga-chapter-img).', m.chat, { quoted: m })

    // حفظ JSON مؤقت
    const filename = `manga-${Date.now()}.json`
    const filepath = path.join(process.cwd(), filename)
    fs.writeFileSync(filepath, JSON.stringify(unique, null, 2), 'utf-8')

    // رسالة معاينة (أوّل 10 روابط)
    const preview = unique.slice(0, 10).map((u, i) => `${i+1}. ${u}`).join('\n')
    await conn.sendMessage(m.chat, { text: `✅ تم استخراج ${unique.length} صورة.\n\nأمثلة:\n${preview}\n\nأرسلت لك ملف JSON يحتوي على جميع الروابط.` }, { quoted: m })

    // إرسال الملف JSON كوثيقة
    await conn.sendMessage(m.chat, { document: fs.readFileSync(filepath), fileName: filename, mimetype: 'application/json' }, { quoted: m })

    // مسح الملف المؤقت
    try { fs.unlinkSync(filepath) } catch (e) {}

  } catch (err) {
    console.error(err)
    m.reply('❌ حدث خطأ أثناء الاستخراج: ' + (err.message || err), m.chat, { quoted: m })
  }
}

handler.help = ['skrtab <link>']
handler.tags = ['scrape','manga']
handler.command = ['skrtab','سكرتاب'] 
export default handler