import fetch from 'node-fetch'

export async function before(m, { conn }) {
let img = await (await fetch(`https://raw.githubusercontent.com/LOYD-SOLO/uploads1/main/files/e65418-1776631134734.jpg`)).buffer()

  const canales = [
    {
      id: "120363402804601196@newsletter",
      nombre: "𓏲ׄ 𝐋𝐎𝐘𝐃⏤͟͟͞͞🪻 ָ ۫𝐒𝐎𝐋𝐎 ࣪𖥔¹",
    },
    {
      id: "120363377374711810@newsletter",
      nombre: "𓏲ׄ 𝐋𝐎𝐘𝐃⏤͟͟͞͞🪻 ָ ۫𝐒𝐎𝐋𝐎 ࣪𖥔²",
    },
  ]

  const canalSeleccionado = canales[Math.floor(Math.random() * canales.length)]

  global.rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canalSeleccionado.id,
        serverMessageId: 100,
        newsletterName: canalSeleccionado.nombre,
      },
    },
  }

 global.adReply = {
	    contextInfo: { 
             forwardingScore: 9999, 
                 isForwarded: false, 
                    externalAdReply: {
				    showAdAttribution: true,
					title: botname,
					body: textbot,
					mediaUrl: null,
					description: null,
					previewType: "PHOTO",
					thumbnailUrl: "https://raw.githubusercontent.com/LOYD-SOLO/uploads1/main/files/e65418-1776631134734.jpg",
                    thumbnail: "https://raw.githubusercontent.com/LOYD-SOLO/uploads1/main/files/e65418-1776631134734.jpg",
		           sourceUrl: canal,
		           mediaType: 1,
                   renderLargerThumbnail: true
				}
			}
		}
}