import fetch from 'node-fetch'

const timeout = 60000
const poin    = 500

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakbendera = conn.tebakbendera || {}
  const id = m.chat

  if (id in conn.tebakbendera) {
    return conn.sendMessage(m.chat, {
      text: '*⌬ ❛╏لم يتم الاجابة على السؤال بعد ┃❌ ❯*'
    }, { quoted: conn.tebakbendera[id][0] })
  }

  try {
    const src  = await fetch('https://gist.githubusercontent.com/Kyutaka101/4e01c190b7d67225ad7a86d388eeedf6/raw/67f0de059cea4b965a3f3bf211c12fc9c48043e5/gistfile1.txt')
    const data = await src.json()
    const json = data[Math.floor(Math.random() * data.length)]

    const caption = [
      `*╭──────『 🚩 خمّن العلم 🚩 』──────╮*`,
      `*┆ ⏳ الوقت: ${(timeout / 1000).toFixed(0)} ثانية*`,
      `*┆ 💰 الجائزة: ${poin} نقطة*`,
      `*┆ ↩️ اكتب "انسحب" للانسحاب*`,
      `*┆ 💡 اكتب "تلميح" لطلب تلميح*`,
      `*╰──────『 🚩 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'} 🚩 』──────╯*`,
    ].join('\n')

    const sentMsg = await conn.sendMessage(m.chat, {
      image: { url: json.img },
      caption
    }, { quoted: m })

    conn.tebakbendera[id] = [
      sentMsg,
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakbendera[id]) {
          conn.sendMessage(m.chat, {
            text: `*❮ ⌛ انتهى الوقت ⌛❯*\n*الإجابة ✅ ${json.name}*`
          }, { quoted: conn.tebakbendera[id][0] })
        }
        delete conn.tebakbendera[id]
      }, timeout)
    ]

  } catch (e) {
    console.error('flag-game:', e.message)
    m.reply('❌ فشل تحميل اللعبة: ' + e.message)
  }
}

handler.all = async function (m) {
  if (!this.tebakbendera) return
  const id      = m.chat
  const session = this.tebakbendera[id]
  if (!session) return
  if (!m.text)  return
  if (m.text.startsWith('.') || m.text.startsWith('/')) return

  const text = m.text.trim().toLowerCase()
  const json  = session[1]

  // انسحاب
  if (text === 'انسحب') {
    clearTimeout(session[3])
    await this.sendMessage(m.chat, {
      text: `🏳️ *انسحبت!*\n✅ الإجابة كانت: *${json.name}*`
    }, { quoted: session[0] })
    delete this.tebakbendera[id]
    return
  }

  // تلميح
  if (text === 'تلميح') {
    const name = json.name || ''
    const hint = name.split('').map((c, i) => i === 0 || i === name.length - 1 ? c : '_').join(' ')
    await this.sendMessage(m.chat, {
      text: `💡 *تلميح:* ${hint}`
    }, { quoted: session[0] })
    return
  }

  // تحقق من الإجابة
  const answers = [json.name, ...(json.aliases || [])].map(a => a?.toLowerCase())
  if (answers.some(a => a && text.includes(a))) {
    clearTimeout(session[3])

    const user = global.db?.data?.users?.[m.sender]
    if (user) user.coin = (user.coin || 0) + poin

    await this.sendMessage(m.chat, {
      text: [
        `🎉 *إجابة صحيحة!*`,
        `✅ العلم: *${json.name}*`,
        `💰 ربحت *${poin}* نقطة!`,
      ].join('\n')
    }, { quoted: session[0] })
    delete this.tebakbendera[id]
  }
}

handler.help    = ['عين']
handler.tags    = ['games']
handler.command = /^عين$/i

export default handler