const questions = [
  // جغرافيا
  { q: '🌍 ما هي عاصمة اليابان؟', a: ['طوكيو', 'tokyo'], cat: '🌍 جغرافيا' },
  { q: '🌍 ما هي أكبر دولة في العالم من حيث المساحة؟', a: ['روسيا', 'russia'], cat: '🌍 جغرافيا' },
  { q: '🌍 على أي نهر تقع القاهرة؟', a: ['النيل', 'nile'], cat: '🌍 جغرافيا' },
  { q: '🌍 ما هي عاصمة البرازيل؟', a: ['برازيليا', 'brasilia'], cat: '🌍 جغرافيا' },
  { q: '🌍 كم عدد قارات العالم؟', a: ['7', 'سبع', 'سبعة'], cat: '🌍 جغرافيا' },

  // علوم
  { q: '🔬 ما هو أسرع حيوان على الأرض؟', a: ['الفهد', 'cheetah'], cat: '🔬 علوم' },
  { q: '🔬 كم تبعد الشمس عن الأرض تقريباً بالكيلومتر؟', a: ['150 مليون', '150000000'], cat: '🔬 علوم' },
  { q: '🔬 ما هو الغاز الأكثر وفرة في الغلاف الجوي؟', a: ['النيتروجين', 'nitrogen'], cat: '🔬 علوم' },
  { q: '🔬 ما هو أثقل عنصر في الجدول الدوري؟', a: ['أوغانيسون', 'oganesson'], cat: '🔬 علوم' },
  { q: '🔬 كم عدد أسنان الإنسان البالغ؟', a: ['32', 'اثنان وثلاثون'], cat: '🔬 علوم' },

  // تاريخ
  { q: '📜 في أي عام بنى الفراعنة الهرم الأكبر تقريباً؟', a: ['2560', '2560 قبل الميلاد'], cat: '📜 تاريخ' },
  { q: '📜 من هو مؤسس الإسلام؟', a: ['محمد', 'النبي محمد'], cat: '📜 تاريخ' },
  { q: '📜 في أي عام سقط الاتحاد السوفيتي؟', a: ['1991'], cat: '📜 تاريخ' },
  { q: '📜 من هو أول إنسان يصل إلى القمر؟', a: ['نيل أرمسترونج', 'neil armstrong'], cat: '📜 تاريخ' },
  { q: '📜 في أي عام اخترع ألفريد نوبل الديناميت؟', a: ['1867'], cat: '📜 تاريخ' },

  // رياضة
  { q: '⚽ كم مدة مباراة كرة القدم الرسمية؟', a: ['90 دقيقة', '90'], cat: '⚽ رياضة' },
  { q: '⚽ كم عدد لاعبي فريق كرة القدم في الملعب؟', a: ['11', 'أحد عشر'], cat: '⚽ رياضة' },
  { q: '⚽ في أي دولة أُقيمت أول كأس عالم؟', a: ['الأوروغواي', 'uruguay'], cat: '⚽ رياضة' },
  { q: '⚽ كم مرة فازت البرازيل بكأس العالم؟', a: ['5', 'خمس', 'خمسة'], cat: '⚽ رياضة' },

  // تكنولوجيا
  { q: '💻 من هو مؤسس شركة Apple؟', a: ['ستيف جوبز', 'steve jobs'], cat: '💻 تكنولوجيا' },
  { q: '💻 ما هو اسم نظام تشغيل الهواتف الذكية من Google؟', a: ['أندرويد', 'android'], cat: '💻 تكنولوجيا' },
  { q: '💻 في أي عام تأسست شركة Microsoft؟', a: ['1975'], cat: '💻 تكنولوجيا' },
  { q: '💻 ما هي لغة البرمجة التي طوّرها Guido van Rossum؟', a: ['بايثون', 'python'], cat: '💻 تكنولوجيا' },

  // ثقافة عامة
  { q: '🎭 من كتب مسرحية روميو وجولييت؟', a: ['شكسبير', 'shakespeare'], cat: '🎭 ثقافة' },
  { q: '🎭 كم عدد ألوان قوس قزح؟', a: ['7', 'سبعة', 'سبع'], cat: '🎭 ثقافة' },
  { q: '🎭 ما هي أطول رواية في التاريخ؟', a: ['الحرب والسلام', 'war and peace'], cat: '🎭 ثقافة' },
  { q: '🎭 في أي مدينة يوجد برج إيفل؟', a: ['باريس', 'paris'], cat: '🎭 ثقافة' },
]

// جلسات الأسئلة النشطة
// key: chatId, value: { answer, timeout }
const activeSessions = {}

let handler = async (m, { conn, usedPrefix }) => {
  const chatId = m.chat

  if (activeSessions[chatId]) {
    return m.reply(`⚠️ في سؤال شغال دلوقتي!\nاجاوب أو اكتب \`${usedPrefix}تخطي\` عشان تعدي`)
  }

  const q = questions[Math.floor(Math.random() * questions.length)]

  // خزّن الإجابة
  const timeout = setTimeout(async () => {
    if (!activeSessions[chatId]) return
    const ans = activeSessions[chatId].answer
    delete activeSessions[chatId]
    await conn.sendMessage(chatId, {
      text: [
        `⏰ *انتهى الوقت!*`,
        ``,
        `✅ الإجابة الصحيحة: *${ans[0]}*`,
        ``,
        `العب تاني؟ اكتب \`${usedPrefix}سؤال\``,
      ].join('\n')
    })
  }, 60 * 1000) // دقيقة

  activeSessions[chatId] = { answer: q.a, timeout }

  await conn.sendMessage(chatId, {
    text: [
      `${q.cat}`,
      ``,
      `❓ *${q.q}*`,
      ``,
      `⏳ عندك دقيقة للإجابة!`,
      `🚫 مش عارف؟ اكتب \`${usedPrefix}تخطي\``,
    ].join('\n')
  }, { quoted: m })
}

// ━━━ مراقبة الإجابات ━━━
handler.all = async function (m) {
  const session = activeSessions[m.chat]
  if (!session) return
  if (!m.text) return

  const text = m.text.trim().toLowerCase()

  // تخطي
  if (/^تخطي$/.test(text)) {
    clearTimeout(session.timeout)
    const ans = session.answer[0]
    delete activeSessions[m.chat]
    return await this.sendMessage(m.chat, {
      text: [
        `🚫 *تخطي!*`,
        ``,
        `✅ الإجابة كانت: *${ans}*`,
      ].join('\n')
    }, { quoted: m })
  }

  // إجابة غلط على الأمر نفسه
  if (text.startsWith('.') || text.startsWith('/')) return

  // تحقق من الإجابة
  const isCorrect = session.answer.some(a =>
    text === a.toLowerCase() ||
    text.includes(a.toLowerCase()) && text.length <= a.length + 5
  )

  if (isCorrect) {
    clearTimeout(session.timeout)
    delete activeSessions[m.chat]

    await this.sendMessage(m.chat, {
      text: [
        `🎉 *إجابة صح!*`,
        ``,
        `✅ *${session.answer[0]}*`,
        ``,
        `سؤال تاني؟ اكتب \`.سؤال\``,
      ].join('\n')
    }, { quoted: m })
  }
}

handler.command = /^(سؤال|question|quiz|تخطي)$/i
handler.help    = ['سؤال']
handler.tags    = ['games']

export default handler