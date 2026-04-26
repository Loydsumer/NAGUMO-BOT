import { googleImage } from '@bochilteam/scraper'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
`⚠️🧞‍♀️ *يجب عليك إدخال عدد + كلمة للبحث عن الصور!*  
🔎 *مثال:*  
\`${usedPrefix + command} 5 قطة\`  
ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`
    )
  }

  const prohibited = [
    'إباحية', 'جنس', 'قتل', 'دم', 'تحرش', 'اغتصاب', 'ميا خليفة',
    'عري', 'نيك', 'سكس', 'xxx', 'هنتاي', 'بورن', 'زوفليا',
    'بيدوفيليا', 'نودز', 'porn', 'hentai',
    'الاباحيه', 'مايا خليفه', 'سكس', 'السكس', 'اباحيه', 'اباحية'
  ]
  if (prohibited.some(word => text.toLowerCase().includes(word))) {
    return m.reply('⚠️🧞‍♀️ *يمنع البحث عن محتوى غير لائق!*')
  }

  try {
    let [countStr, ...queryArr] = text.trim().split(' ')
    let count = parseInt(countStr)
    let query = queryArr.join(' ')

    if (isNaN(count) || count <= 0) {
      count = 5 // عدد افتراضي
      query = text.trim()
    }

    if (count > 15) count = 15 // الحد الأقصى للصور

    if (!query) {
      return m.reply(
`⚠️🧞‍♀️ *يجب عليك كتابة كلمة للبحث!*  
🔎 *مثال:*  
\`${usedPrefix + command} 3 كلب\``
      )
    }

    const res = await googleImage(query)
    let images = [...res]

    if (!images || images.length === 0) {
      return m.reply(`❌🧞‍♀️ *لم يتم العثور على نتائج لـ:* ${query}`)
    }

    let selected = []
    for (let i = 0; i < count && images.length > 0; i++) {
      let img = images.getRandom()
      selected.push(img)
      images = images.filter(v => v !== img) // منع التكرار
    }

    for (let [index, link] of selected.entries()) {
      await conn.sendFile(
        m.chat,
        link,
        `image_${index + 1}.jpg`,
        `✨🧞‍♀️ *[${index + 1}/${count}] صورة لـ:* ${query}\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`,
        m
      )
      await delay(2000) // تأخير 2 ثانية بين كل صورة
    }
  } catch (e) {
    console.log(`❗❗🧞‍♀️ *حدث خطأ أثناء البحث عن الصور!*`)
    console.log(e)
    m.reply('❌🧞‍♀️ حدث خطأ أثناء جلب الصور، حاول مرة أخرى لاحقًا.')
  }
}

handler.help = ['صورة <عدد> <بحث>', 'صوره <عدد> <بحث>', 'image <عدد> <بحث>']
handler.tags = ['بحث', 'أدوات']
handler.command = /^(صورة|صوره|image|gimage|imagen|jpg)$/i

export default handler