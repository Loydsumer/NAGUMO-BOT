/* 
• الإضافة: البحث عن أفلام 🎬
• المصدر: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• تجميع البيانات من: https://filmfinder.ai
*/

import axios from 'axios'

async function sfilm(query) {
  try {
    const sessid = Array.from({ length: 21 }, () =>
      'abcdefghijklmnopqrstuvwxyz0123456789'[
        Math.floor(Math.random() * 36)
      ]
    ).join('')

    const res = await axios.post('https://filmfinder.ai/api/main', {
      query,
      sessionId: sessid
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://filmfinder.ai/',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    })

    return res.data
  } catch (er) {
    throw new Error(er.message)
  }
}

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    throw `🧞‍♀️ طريقة الاستخدام:\n\nاكتب الأمر *${command}* متبوعًا بنوع الفيلم أو اسم معين.\n\nمثال:\n*${command} أكشن*\n*${command} batman*\n\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`
  }

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🎥',
        key: m.key
      }
    })

    const data = await sfilm(text)
    if (!data || !Array.isArray(data) || data.length === 0) {
      return conn.sendMessage(m.chat, { text: `🧞‍♀️ لم يتم العثور على نتائج لهذا البحث.` }, { quoted: m })
    }

    const hasil = data.slice(0, 10).map((film, i) => {
      return `🧞‍♀️ *${i + 1}. ${film.title || 'بدون عنوان'}* (${film.year || 'غير معروف'})`
    }).join('\n\n')

    await conn.sendMessage(m.chat, { text: `${hasil}\n\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ` }, { quoted: m })
  } catch (err) {
    conn.sendMessage(m.chat, { text: `🧞‍♀️ حدث خطأ أثناء جلب البيانات:\n${err.message}` }, { quoted: m })
  }
}

handler.command = /^sfilm|افلام|أفلام$/i
handler.help = ['sfilm', 'افلام', 'أفلام'].map(cmd => `${cmd} <النوع أو الاسم>`)
handler.tags = ['بحث', 'افلام']

export default handler