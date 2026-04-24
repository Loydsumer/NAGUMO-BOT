let handler = async (m, { conn }) => {
  let vcard = `BEGIN:VCARD
VERSION:3.0
FN:𝐋𝐎𝐘𝐃
ORG:𝐋𝐎𝐘𝐃
TITLE:Metatron Executioner of Michael
EMAIL;type=INTERNET:byzaryws@gmail.com
TEL;type=CELL;waid=4917672339436:+4917672339436
ADR;type=WORK:;;2-chōme-7-5 Fuchūchō;Izumi;Osaka;594-0071;Japan
URL;type=WORK:https://www.instagram.com/g8f4q
X-WA-BIZ-NAME:𝐋𝐎𝐘𝐃
X-WA-BIZ-DESCRIPTION:𝙒𝙝𝙚𝙣 𝙞𝙩 𝙛𝙚𝙚𝙡𝙨 𝙡𝙞𝙠𝙚 𝙖𝙡𝙡 𝙩𝙝𝙚 𝙬𝙤𝙧𝙡𝙙 𝙞𝙨 𝙬𝙚𝙖𝙧𝙞𝙣𝙜 𝙖 𝙛𝙧𝙤𝙬𝙣 𝙋𝙪𝙩 𝙖 𝙨𝙢𝙞𝙡𝙚 𝙤𝙣 𝙖𝙣𝙙 𝙨𝙥𝙧𝙚𝙖𝙙 𝙞𝙩 𝙖𝙧𝙤𝙪𝙣𝙙 𝘄𝗶𝘁𝗵 𝘆𝗼𝘂𝗿 𝘀𝗺𝗶𝗹𝗲 𝘁𝘂𝗿𝗻 𝘁𝗵𝗲 𝘄𝗼𝗿𝗹𝗱 𝘂𝗽𝘀𝗶𝗱𝗲 𝗱𝗼𝘄𝗻
X-WA-BIZ-HOURS:Mo-Su 00:00-23:59
END:VCARD`

  let qkontak = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "𝐋𝐎𝐘𝐃",
        vcard
      }
    }
  }

  // 📌 إرسال الكونتاكت مع externalAdReply
  await conn.sendMessage(
    m.chat,
    {
      contacts: {
        displayName: '𝐋𝐎𝐘𝐃',
        contacts: [{ vcard }]
      },
      contextInfo: {
        externalAdReply: {
          title: '𝑇𝛨𝛯 𝐿𝛩𝛻𝛯𝐿𝑌 𝛩𝑊𝛮𝛯𝑅 𝛩𝐹',
          body: '⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐',
          thumbnailUrl: 'https://files.catbox.moe/5v1e5x.jpg',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    },
    { quoted: qkontak }
  )
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = /^(owner|creator|المطورين|المطور|مطور|مطورك|مطوري|creador)$/i

export default handler