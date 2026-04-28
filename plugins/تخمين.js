// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  قاموس الشخصيات — اسم + وصف + تلميحات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const characters = [
  {
    name: 'ناروتو أوزوماكي',
    hints: [
      'شخصية من أنمي نينجا مشهور جداً',
      'يحمل في جسمه وحشاً بتسعة أذناب',
      'شعره أصفر وعيونه زرقاء',
      'حلمه إنه يبقى هوكاج للقرية',
    ],
    desc: 'نينجا صغير من قرية كونوها، مشهور بإصراره وحبه لراحة أصحابه',
    anime: 'Naruto'
  },
  {
    name: 'ليتش لايت',
    hints: [
      'شخصية من أنمي نفسي وغموضي',
      'وجد دفتراً يقدر يقتل بيه أي شخص',
      'طالب عبقري في المدرسة',
      'هدفه إنه يخلق عالم خالي من الجريمة',
    ],
    desc: 'شاب عبقري وجد دفتر الموت وقرر إنه يصبح إله العالم الجديد',
    anime: 'Death Note'
  },
  {
    name: 'غوكو',
    hints: [
      'شخصية من أنمي قتال أسطوري',
      'شعره أسود وقائم طول الوقت',
      'يحب الأكل بشكل مجنون',
      'ذيله كان مشكلة في صغره',
    ],
    desc: 'محارب سايان أُرسل للأرض وهو طفل، وكرّس حياته لإتقان فنون القتال',
    anime: 'Dragon Ball'
  },
  {
    name: 'لوفي',
    hints: [
      'شخصية من أنمي قراصنة مشهور',
      'جسمه مطاط بسبب فاكهة شيطانية',
      'يلبس قبعة قش',
      'حلمه إنه يلاقي الـ One Piece ويبقى ملك القراصنة',
    ],
    desc: 'قرصان شاب بجسم مطاط يقود طاقمه في رحلة بحث عن الكنز الأعظم',
    anime: 'One Piece'
  },
  {
    name: 'تانجيرو كاميادو',
    hints: [
      'شخصية من أنمي قتال حديث ومشهور جداً',
      'يحمل أخته على ظهره في صندوق',
      'يقاتل الشياطين بسيف',
      'حاسة شمه قوية جداً',
    ],
    desc: 'شاب يسعى للانتقام لعائلته وإنقاذ أخته من لعنة الشيطان',
    anime: 'Demon Slayer'
  },
  {
    name: 'إيرين ييغر',
    hints: [
      'شخصية من أنمي أكشن ودراما',
      'يعيش خلف جدران عملاقة',
      'يكره العمالقة بشكل مجنون',
      'لديه قوة التحول لعملاق',
    ],
    desc: 'شاب يعيش في عالم تحاصره العمالقة ويحمل سراً ضخماً في جسمه',
    anime: 'Attack on Titan'
  },
  {
    name: 'ساتورو غوجو',
    hints: [
      'شخصية من أنمي جوجوتسو',
      'عيونه زرقاء ومميزة جداً',
      'يغطي عيونه بعصابة',
      'أقوى ساحر في العالم',
    ],
    desc: 'مدرس ساحر يُعتبر الأقوى في عالمه بسبب قدرته على التحكم في اللانهاية',
    anime: 'Jujutsu Kaisen'
  },
  {
    name: 'إيزوكو ميدوريا',
    hints: [
      'شخصية من أنمي أبطال خارقين',
      'شعره أخضر ومجعد',
      'وُلد من غير قوة خارقة في البداية',
      'يعشق البطل All Might',
    ],
    desc: 'ولد بلا قوة في عالم مليان أبطال، لكن إصراره جعله يحمل أعظم قوة',
    anime: 'My Hero Academia'
  },
  {
    name: 'كيلوا زولديك',
    hints: [
      'شخصية من أنمي مغامرات',
      'شعره فضي أبيض',
      'من عائلة قتلة محترفين',
      'يستخدم قوة الكهرباء',
    ],
    desc: 'فتى من عائلة قتلة هرب من بيته ليعيش حياة طبيعية ويجد صديقاً حقيقياً',
    anime: 'Hunter x Hunter'
  },
  {
    name: 'روروانوا زورو',
    hints: [
      'شخصية من أنمي قراصنة',
      'يحمل ثلاثة سيوف — حتى بفمه',
      'شعره أخضر',
      'يضيع في أي مكان يروحه',
    ],
    desc: 'محارب بالسيوف هدفه يبقى أقوى سيّاف في العالم، ومشهور بإنه بيتوه دايماً',
    anime: 'One Piece'
  },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  جلسات اللعب النشطة
//  key: m.chat  value: { name, hints, step, msgId }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const activeSessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  const chatId = m.chat

  // ━━━ أمر تخمين — يبدأ لعبة جديدة ━━━
  if (/^(تخمين|guess)$/i.test(command)) {
    const char = characters[Math.floor(Math.random() * characters.length)]

    activeSessions[chatId] = {
      name:  char.name.toLowerCase().replace(/\s/g, ''),
      full:  char.name,
      hints: char.hints,
      step:  0,
      anime: char.anime,
      desc:  char.desc,
    }

    const session = activeSessions[chatId]

    await conn.sendMessage(chatId, {
      text: [
        `🎮 *لعبة تخمين الشخصية*`,
        ``,
        `📝 *الوصف:*`,
        `_${char.desc}_`,
        ``,
        `💡 التلميح 1/${char.hints.length}:`,
        `▸ ${char.hints[0]}`,
        ``,
        `⏳ عندك 4 تلميحات — اكتب اسم الشخصية!`,
        `❓ مش عارف؟ اكتب \`${usedPrefix}تلميح\``,
        `🏳️ استسلمت؟ اكتب \`${usedPrefix}استسلم\``,
      ].join('\n')
    }, { quoted: m })
    return
  }

  // ━━━ طلب تلميح إضافي ━━━
  if (/^تلميح$/i.test(command)) {
    const session = activeSessions[chatId]
    if (!session) return m.reply(`❌ مفيش لعبة شغالة — ابدأ بـ \`${usedPrefix}تخمين\``)

    session.step++
    if (session.step >= session.hints.length) {
      return m.reply([
        `😅 خلصت التلميحات!`,
        ``,
        `💀 الإجابة كانت: *${session.full}*`,
        `🎬 الأنمي: ${session.anime}`,
      ].join('\n'))
    }

    await m.reply([
      `💡 التلميح ${session.step + 1}/${session.hints.length}:`,
      `▸ ${session.hints[session.step]}`,
      ``,
      `🎯 لسه عندك ${session.hints.length - session.step - 1} تلميح تاني`,
    ].join('\n'))
    return
  }

  // ━━━ استسلام ━━━
  if (/^استسلم$/i.test(command)) {
    const session = activeSessions[chatId]
    if (!session) return m.reply(`❌ مفيش لعبة شغالة`)

    const full = session.full
    const anime = session.anime
    delete activeSessions[chatId]

    await m.reply([
      `🏳️ *استسلمت!*`,
      ``,
      `✅ الإجابة كانت: *${full}*`,
      `🎬 الأنمي: ${anime}`,
      ``,
      `العب تاني؟ اكتب \`${usedPrefix}تخمين\``,
    ].join('\n'))
    return
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  plugin.all — بيراقب كل رسالة للإجابة
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
handler.all = async function (m) {
  const session = activeSessions[m.chat]
  if (!session) return
  if (!m.text || m.text.startsWith('.') || m.text.startsWith('/')) return

  const answer  = m.text.trim().toLowerCase().replace(/\s/g, '')
  const correct = session.name

  // ━━━ تحقق من الإجابة ━━━
  if (answer === correct || correct.includes(answer) && answer.length >= 3) {
    delete activeSessions[m.chat]

    const hintsUsed = session.step + 1
    let stars = hintsUsed === 1 ? '⭐⭐⭐' : hintsUsed === 2 ? '⭐⭐' : '⭐'

    await this.sendMessage(m.chat, {
      text: [
        `🎉 *إجابة صح!*`,
        ``,
        `✅ الشخصية: *${session.full}*`,
        `🎬 الأنمي: ${session.anime}`,
        `💡 استخدمت ${hintsUsed} تلميح ${stars}`,
        ``,
        `العب تاني؟ اكتب \`.تخمين\``,
      ].join('\n')
    }, { quoted: m })
  }
}

handler.command = /^(تخمين|guess|تلميح|استسلم)$/i
handler.help    = ['تخمين']
handler.tags    = ['games']

export default handler