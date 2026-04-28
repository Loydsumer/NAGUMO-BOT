// أكواد الدول مع عدد الأرقام بعد الكود
const countries = [
  { name: '🇪🇬 مصر',         code: '20',  len: 10 },
  { name: '🇸🇦 السعودية',    code: '966', len: 9  },
  { name: '🇦🇪 الإمارات',    code: '971', len: 9  },
  { name: '🇰🇼 الكويت',      code: '965', len: 8  },
  { name: '🇶🇦 قطر',         code: '974', len: 8  },
  { name: '🇧🇭 البحرين',     code: '973', len: 8  },
  { name: '🇴🇲 عُمان',       code: '968', len: 8  },
  { name: '🇯🇴 الأردن',      code: '962', len: 9  },
  { name: '🇱🇧 لبنان',       code: '961', len: 8  },
  { name: '🇲🇦 المغرب',      code: '212', len: 9  },
  { name: '🇩🇿 الجزائر',     code: '213', len: 9  },
  { name: '🇹🇳 تونس',        code: '216', len: 8  },
  { name: '🇹🇷 تركيا',       code: '90',  len: 10 },
  { name: '🇺🇸 أمريكا',      code: '1',   len: 10 },
  { name: '🇬🇧 بريطانيا',    code: '44',  len: 10 },
  { name: '🇩🇪 ألمانيا',     code: '49',  len: 10 },
  { name: '🇫🇷 فرنسا',       code: '33',  len: 9  },
  { name: '🇮🇳 الهند',       code: '91',  len: 10 },
]

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateNumber(len) {
  // الرقم الأول لا يكون صفر
  let num = String(randInt(1, 9))
  for (let i = 1; i < len; i++) {
    num += String(randInt(0, 9))
  }
  return num
}

let handler = async (m, { conn, text }) => {
  // لو كتب اسم دولة أو كود
  let country = null

  if (text) {
    const q = text.trim().toLowerCase()
    country = countries.find(c =>
      c.name.includes(q) ||
      c.code === q.replace(/\+/g, '') ||
      c.name.toLowerCase().includes(q)
    )
    if (!country) return m.reply([
      `❌ الدولة مش موجودة`,
      ``,
      `الدول المتاحة:`,
      countries.map(c => `${c.name} — \`+${c.code}\``).join('\n'),
    ].join('\n'))
  } else {
    // اختار دولة عشوائية
    country = countries[randInt(0, countries.length - 1)]
  }

  const localNum = generateNumber(country.len)
  const fullNum  = `+${country.code}${localNum}`

  await conn.sendMessage(m.chat, {
    text: [
      `📱 *رقم عشوائي*`,
      ``,
      `🌍 الدولة : ${country.name}`,
      `📞 الرقم  : ${fullNum}`,
      ``,
      `> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
    ].join('\n')
  }, { quoted: m })
}

handler.command = /^(رقم|randnum|random_number)$/i
handler.help    = ['رقم', 'رقم <اسم الدولة>']
handler.tags    = ['tools']

export default handler