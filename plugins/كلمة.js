const words = [
  'بيت', 'باب', 'كتاب', 'قلم', 'شمس', 'قمر', 'نجم', 'بحر',
  'جبل', 'نهر', 'سماء', 'ارض', 'ماء', 'نار', 'هواء', 'ورق',
  'طير', 'اسد', 'فيل', 'قطة', 'كلب', 'سمك', 'حصان', 'ثعلب',
  'تفاح', 'برتقال', 'موز', 'عنب', 'خوخ', 'رمان', 'توت', 'ليمون',
  'مدرسة', 'مستشفى', 'مطعم', 'مكتبة', 'مسجد', 'ملعب', 'مطار', 'سوق',
  'حياة', 'موت', 'حرية', 'سلام', 'حرب', 'امل', 'حلم', 'نوم',
  'صديق', 'عدو', 'اخ', 'اخت', 'ام', 'اب', 'جد', 'ابن',
  'بوت', 'هاتف', 'حاسوب', 'شاشة', 'لوحة', 'برنامج', 'انترنت', 'كاميرا',
]

function shuffle(word) {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  // لو الترتيب نفس الكلمة الأصلية — نعيد الخلط
  const result = arr.join('')
  return result === word ? shuffle(word) : result
}

// جلسات نشطة
const activeSessions = {}

let handler = async (m, { conn, usedPrefix }) => {
  const chatId = m.chat

  if (activeSessions[chatId]) {
    return m.reply(`⚠️ في كلمة شغالة دلوقتي!\nاكتب الكلمة أو \`${usedPrefix}تخطي\` عشان تعدي`)
  }

  const word      = words[Math.floor(Math.random() * words.length)]
  const scrambled = shuffle(word)
  const display   = scrambled.split('').join(' ')

  const timeout = setTimeout(async () => {
    if (!activeSessions[chatId]) return
    delete activeSessions[chatId]
    await conn.sendMessage(chatId, {
      text: [
        `⏰ *انتهى الوقت!*`,
        `✅ الكلمة كانت: *${word}*`,
        ``,
        `العب تاني؟ اكتب \`${usedPrefix}كلمة\``,
      ].join('\n')
    })
  }, 60 * 1000)

  activeSessions[chatId] = { word, timeout }

  await conn.sendMessage(chatId, {
    text: [
      `🔤 *لعبة تفكيك الكلمة*`,
      ``,
      `🔀 الكلمة المخلوطة:`,
      `*${display}*`,
      ``,
      `📏 عدد الحروف: ${word.length}`,
      `⏳ عندك دقيقة تفك الكلمة!`,
      `🚫 مش عارف؟ اكتب \`${usedPrefix}تخطي\``,
    ].join('\n')
  }, { quoted: m })
}

handler.all = async function (m) {
  const session = activeSessions[m.chat]
  if (!session) return
  if (!m.text) return

  const text = m.text.trim()

  // تخطي
  if (/^تخطي$/.test(text)) {
    clearTimeout(session.timeout)
    const word = session.word
    delete activeSessions[m.chat]
    return await this.sendMessage(m.chat, {
      text: [
        `🚫 *تخطي!*`,
        `✅ الكلمة كانت: *${word}*`,
      ].join('\n')
    }, { quoted: m })
  }

  if (text.startsWith('.') || text.startsWith('/')) return

  if (text === session.word) {
    clearTimeout(session.timeout)
    delete activeSessions[m.chat]

    await this.sendMessage(m.chat, {
      text: [
        `🎉 *صح!*`,
        ``,
        `✅ الكلمة: *${session.word}*`,
        ``,
        `كلمة تانية؟ اكتب \`.كلمة\``,
      ].join('\n')
    }, { quoted: m })
  }
}

handler.command = /^(كلمة|word|فك_الكلمة)$/i
handler.help    = ['كلمة']
handler.tags    = ['games']

export default handler