import { join } from 'path'
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn }) => {
  const proses = 'جاري ارسال دعم البوت'
  await conn.sendMessage(m.chat, { text: proses }, { quoted: m })

 
  async function createImage() {
    try {
 
      const { imageMessage } = await generateWAMessageContent({ 
        image: { url: 'https://files.catbox.moe/rip3zx.jpg' }  
      }, {
        upload: conn.waUploadToServer
      });
      return imageMessage;
    } catch (error) {
      console.error('حدث خطا اثناء تحميل الصوره:', error);
      throw error;
    }
  }
  const groups = [
    {
      name: '𝑭𝒖𝒓𝒊𝒏𝒂¦🍓¦𝐁𝐎𝐓',
      desc: 'جروب الدعم خاص بي البوت',
      buttons: [
        { name: 'اضغط لي الانضمام', url: 'https://chat.whatsapp.com/C5POy45VSoiDtnXlOlgeP1' } 
      ]
    },
    {
      name: '𝑭𝒖𝒓𝒊𝒏𝒂|𝐔𝐏𝐃𝐀𝐓𝐄𝐃',
      desc: 'قناه الخاصه بي تحديثات البوت',
      buttons: [
        { name: 'اضغط لي متابعت القناه', url: 'https://whatsapp.com/channel/0029Vb6qkXM8V0tvdYh1fJ2g' }
      ]
    }
  ]

  let cards = []

 
  const imageMsg = await createImage()

  for (const group of groups) {
    const formattedButtons = group.buttons.map(btn => ({
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: btn.name,
        url: btn.url
      })
    }))

    cards.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `🪴 *${group.name}*\n${group.desc}`
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: '> الدعم الخاص بي البوت'
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        hasMediaAttachment: true,
        imageMessage: imageMsg
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: formattedButtons
      })
    })
  }

  const slideMessage = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: 'جروبات و قنوات بوت فورينا'
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: 'الي برا دول مليش مسؤليه بيه'
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards
          })
        })
      }
    }
  }, {})

  await conn.relayMessage(m.chat, slideMessage.message, { messageId: slideMessage.key.id })
  

  await m.react('✅')
}

handler.help = ['grupos']
handler.tags = ['info']
handler.command = ['جروبات', 'الدعم', 'القناه']

export default handler