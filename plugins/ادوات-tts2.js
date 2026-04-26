/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

import axios from 'axios'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  
  // النص الذي أرسله المستخدم
  let teks = m.quoted ? m.quoted.text : text
  let idd = args[0] ? args[0] : 'id_001'  // إذا لم يتم توفير id نستخدم id_001 كقيمة افتراضية
  let id = text.split('|')[0]  // تحديد id الصوت
  let tekss = teks.split('|')[1]  // النص الذي سيتم تحويله إلى صوت
  
  // رسالة توضيح للمستخدم حول كيفية الاستخدام الصحيح
  let input = `[!] *الإدخال خاطئ!*
  
مثال: 
  ${usedPrefix + command} id|النص 
  مثال: ${usedPrefix + command} en_us_001|مرحبًا، كيف حالك؟

معلومات:
    - male: صوت ذكر
    - female: صوت أنثى
    
  *قائمة معرّفات الأصوات*:
  
   معرّف: 'en_us_001', •> أنثوي 
   معرّف: 'en_us_006', •> ذكر 1 
   معرّف: 'en_us_007', •> ذكر 2 
   معرّف: 'en_us_009', •> ذكر 3 
   معرّف: 'en_us_010', •> ذكر 4
   
   *الإنجليزية (UK)*:
   معرّف: 'en_uk_001', •> ذكر 1 
   معرّف: 'en_uk_003', •> ذكر 2
   
   *الإنجليزية (أستراليا)*:
   معرّف: 'en_au_001', •> أنثوي 
   معرّف: 'en_au_002', •> ذكر
   
   *الفرنسية*:
   معرّف: 'fr_001', •> ذكر 1 
   معرّف: 'fr_002', •> ذكر 2 
   
   *الألمانية*:
   معرّف: 'de_001', •> أنثوي 
   معرّف: 'de_002', •> ذكر 
   
   *الإسبانية*:
   معرّف: 'es_002', •> ذكر 
   
   *الإسبانية (المكسيك)*:
   معرّف: 'es_mx_002', •> ذكر 1 
   معرّف: 'es_male_m3', •> ذكر 2 
   معرّف: 'es_female_f6', •> أنثوي 1 
   معرّف: 'es_female_fp1', •> أنثوي 2 
   معرّف: 'es_mx_female_supermom', •> أنثوي 3
  
   *الأصوات الخاصة (مثل Transformers)*:
   معرّف: 'es_mx_male_transformer', •> Optimus Prime (Transformers)
  
   *البرتغالية*:
   معرّف: 'br_003', •> أنثوي 2 
   معرّف: 'br_004', •> أنثوي 3 
   معرّف: 'br_005', •> ذكر 
   
   *الإندونيسية*:
   معرّف: 'id_001', •> أنثوي 
   
   *اليابانية*:
   معرّف: 'jp_001', •> أنثوي 1 
   معرّف: 'jp_003', •> أنثوي 2 
   معرّف: 'jp_005', •> أنثوي 3 
   معرّف: 'jp_006', •> ذكر 
   
   *الكورية*:
   معرّف: 'kr_002', •> ذكر 1 
   معرّف: 'kr_004', •> ذكر 2 
   معرّف: 'kr_003', •> أنثوي 
   
   *شخصيات*:
   معرّف: 'en_us_ghostface', •> Ghostface (Scream) 
   معرّف: 'en_us_chewbacca', •> Chewbacca (Star Wars) 
   معرّف: 'en_us_c3po', •> C3PO (Star Wars) 
   معرّف: 'en_us_stitch', •> Stitch (Lilo & Stitch) 
   معرّف: 'en_us_stormtrooper', •> Stormtrooper (Star Wars) 
   معرّف: 'en_us_rocket', •> Rocket (Guardians of the Galaxy) 
   
   *غنائي*:
   معرّف: 'en_female_f08_salut_damour', •> Alto 
   معرّف: 'en_male_m03_lobby', •> Tenor 
   معرّف: 'en_male_m03_sunshine_soon', •> Sunshine Soon 
   معرّف: 'en_female_f08_warmy_breeze', •> Warmy Breeze 
   معرّف: 'en_female_ht_f08_glorious', •> Glorious 
   معرّف: 'en_male_sing_funny_it_goes_up', •> It Goes Up 
   معرّف: 'en_male_m2_xhxs_m03_silly', •> Chipmunk 
   معرّف: 'en_female_ht_f08_wonderful_world', •> Dramatic
	`
  
  // إذا لم يتم توفير النص أو المعرف الصوتي، يظهر للمستخدم الإرشادات
  if (!tekss) return m.reply(input)
  if (!id) return m.reply(input)
  
  // إرسال الطلب إلى API لتحويل النص إلى صوت
  const { data } = await axios.post("https://tiktok-tts.weilnet.workers.dev/api/generation", {
    "text": tekss,
    "voice": id
  })

  // إرسال الصوت الناتج للمستخدم عبر WhatsApp
  conn.sendMessage(m.chat, { audio: Buffer.from(data.data, "base64"), mimetype: "audio/mp4" }, { quoted: m })
}

handler.help = ['tts2']
handler.tags = ['tools']
handler.command = /^(tts2)$/i
handler.limit = true
handler.premium = true

export default handler