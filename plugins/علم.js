import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

const timeout = 60000
const poin = 2000

let handler = async (m, { conn, command }) => {
  if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = { exp: 0 }
  }

  let user = global.db.data.users[m.sender]

  // ────── 🥭 التعامل مع الإجابات ──────
  if (command.startsWith('answer_')) {
    let id = m.chat
    let Ruby = conn.Ruby?.[id]

    if (!Ruby) {
      return conn.reply(
        m.chat,
        `ㅤ ⃝⃘︢︣֟፝🥭ᩫํ᪶  
❌ *لَا يـوجــد اخــتــبــار نــشــط حــالـيـاً!* ❌  
ᩭ⃟ᨳ᪲⃟₊⁺᪶⭑ꪾ⭒ꪻ⟡`,
        m
      )
    }

    let selectedAnswer = command.replace('answer_', '')
    let isCorrect = Ruby.correctAnswer === selectedAnswer

    if (isCorrect) {
      user.exp += poin
      await conn.reply(
        m.chat,
        `ㅤ ⃝⃘︢︣֟፝🥭ᩫํ᪶  
✅ *إجــابــة صــحــيــحــة!*  
🎉 *ربــحــت ${poin} مــن الـXP!*  
🍷 *تـألـقـت كـعـادتـك... يا مـذهـل!*  
ᩭ⃟ᨳ᪲⃟₊⁺᪶⭑ꪾ⭒ꪻ⟡`,
        m
      )
      clearTimeout(Ruby.timer)
      delete conn.Ruby[id]
    } else {
      Ruby.attempts -= 1
      if (Ruby.attempts > 0) {
        await conn.reply(
          m.chat,
          `ㅤ ⃝⃘︢︣֟፝🥭ᩫํ᪶  
❌ *إجــابــة خــاطــئــة!*  
🔁 *تــبــقــى ${Ruby.attempts} مــحــاولـات.*  
ᩭ⃟ᨳ᪲⃟₊⁺᪶⭑ꪾ⭒ꪻ⟡`,
          m
        )
      } else {
        await conn.reply(
          m.chat,
          `ㅤ ⃝⃘︢︣֟፝🥭ᩫํ᪶  
💀 *انــتــهــت الـمـحـاولات!*  
🎯 *الـإجــابــة الـصـحـيـحـة:* 「 ${Ruby.correctAnswer} 」  
ᩭ⃟ᨳ᪲⃟₊⁺᪶⭑ꪾ⭒ꪻ⟡`,
          m
        )
        clearTimeout(Ruby.timer)
        delete conn.Ruby[id]
      }
    }
  }

  // ────── 🏁 بدء اللعبة ──────
  else {
    try {
      conn.Ruby = conn.Ruby || {}
      let id = m.chat

      if (conn.Ruby[id]) {
        return conn.reply(
          m.chat,
          `ㅤ ⃝⃘︢︣֟፝🥭ᩫํ᪶  
⌛ *لا يـمـكـن بـدء اخـتـبـار جـديـد حـالـيـاً!*  
🔮 *أكـمـل الاخـتـبـار الـقـائـم أولاً...*  
ᩭ⃟ᨳ᪲⃟₊⁺᪶⭑ꪾ⭒ꪻ⟡`,
          m
        )
      }

      const res = await fetch(
        'https://gist.githubusercontent.com/Kyutaka101/799d5646ceed992bf862026847473852/raw/dcbecff259b1d94615d7c48079ed1396ed42ef67/gistfile1.txt'
      )
      const flagsData = await res.json()

      const flagItem = flagsData[Math.floor(Math.random() * flagsData.length)]
      const { img, name } = flagItem

      let options = [name]
      while (options.length < 4) {
        let randomName =
          flagsData[Math.floor(Math.random() * flagsData.length)].name
        if (!options.includes(randomName)) options.push(randomName)
      }
      options.sort(() => Math.random() - 0.5)

      const media = await prepareWAMessageMedia(
        { image: { url: img } },
        { upload: conn.waUploadToServer }
      )

      const interactiveMessage = {
        body: {
          text: `
├ׁ̟̇˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊· ͟͟͞͞➳❥
├ׁ̟̇˚₊· ͟͟͞͞➳❥⏳ *الــوقــت:* ${(timeout / 1000).toFixed(0)} ثـانـيـة  
├ׁ̟̇˚₊· ͟͟͞͞➳❥💎 *الــجــائــزة:* ${poin} XP  
├ׁ̟̇˚₊·₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊·˚₊
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *اخـتـر إسـم الـعـلـم الـصـحـيـح!*  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *اكتـب [.لفل] لــرؤيــة مـسـتـواك* 
├ׁ̟̇˚₊·˚₊· ͟͟͞͞˚₊· ͟͟͞͞˚₊· ͟͟͞͞˚₊· ͟͟͞͞˚₊· ͟͟͞͞ ͟͟͞͞➳❥`,
        },
        footer: { text: '🌸︩⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐' },
        header: {
          hasMediaAttachment: true,
          imageMessage: media.imageMessage,
        },
        nativeFlowMessage: {
          buttons: options.map((option) => ({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: `🥭 ︙${option}︙ 🥭`,
              id: `.answer_${option}`,
            }),
          })),
        },
      }

      const msg = generateWAMessageFromContent(
        m.chat,
        { viewOnceMessage: { message: { interactiveMessage } } },
        { userJid: conn.user.jid, quoted: m }
      )

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

      conn.Ruby[id] = {
        correctAnswer: name,
        options,
        timer: setTimeout(() => {
          if (conn.Ruby[id]) {
            conn.reply(
              m.chat,
              `ㅤ ⃝⃘︢︣֟፝🥭ᩫํ᪶  
⏳ *انــتــهــى الــوقــت!*  
🎯 *الإجــابــة الـصـحـيـحـة كـانـت:* 「 ${name} 」  
ᩭ⃟ᨳ᪲⃟₊⁺᪶⭑ꪾ⭒ꪻ⟡`,
              m
            )
            delete conn.Ruby[id]
          }
        }, timeout),
        attempts: 2,
      }
    } catch (e) {
      console.error(e)
      conn.reply(
        m.chat,
        `ㅤ ⃝⃘︢︣֟፝🥭ᩫํ᪶  
❌ *حــدث خــطــأ فــي الإرســال!*  
ᩭ⃟ᨳ᪲⃟₊⁺᪶⭑ꪾ⭒ꪻ⟡`,
        m
      )
    }
  }
}

handler.command = /^(علم|answer_.+)$/i
export default handler