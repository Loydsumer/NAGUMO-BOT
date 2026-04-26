import fetch from 'node-fetch'
import baileys from '@whiskeysockets/baileys'

async function sendAlbumMessage(jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`)
  if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Minimum 2 media required")
  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video")) throw new TypeError(`Invalid media type: ${media.type}`)
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) throw new TypeError(`Invalid media data`)
  }

  const caption = options.text || options.caption || ""
  const delay = !isNaN(options.delay) ? options.delay : 500
  delete options.text
  delete options.caption
  delete options.delay

  const album = baileys.generateWAMessageFromContent(jid, {
    messageContextInfo: {},
    albumMessage: {
      expectedImageCount: medias.filter(m => m.type === "image").length,
      expectedVideoCount: medias.filter(m => m.type === "video").length,
      ...(options.quoted ? { contextInfo: { remoteJid: options.quoted.key.remoteJid, fromMe: options.quoted.key.fromMe, stanzaId: options.quoted.key.id, participant: options.quoted.key.participant || options.quoted.key.remoteJid, quotedMessage: options.quoted.message }} : {}),
    },
  }, {})

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })
  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i]
    const mediaMsg = await baileys.generateWAMessage(album.key.remoteJid, { [type]: data, ...(i === 0 ? { caption } : {}) }, { upload: conn.waUploadToServer })
    mediaMsg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key }, }
    await conn.relayMessage(mediaMsg.key.remoteJid, mediaMsg.message, { messageId: mediaMsg.key.id })
    await baileys.delay(delay)
  }
  return album
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const example = `
⚜️ *طريقة الاستخدام:*
اكتب الأمر متبوعًا بالكلمة التي تريد البحث عنها.

مثال:
> *${usedPrefix}${command} قطة*

سيقوم البوت بجلب لك ألبوم من صور أو مقاطع GIF من Tenor 🎬

ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    return m.reply(example)
  }

  try {
    await m.react('🕒')

    const res = await fetch(`${global.APIs.delirius.url}/search/tenor?q=${text}`)
    const json = await res.json()
    const gifs = json.data

    if (!gifs || gifs.length < 2) {
      await m.react('✖️')
      return m.reply(`🚫 لم يتم العثور على نتائج للكلمة: *${text}*.\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
    }

    const maxItems = Math.min(gifs.length, 10)
    const medias = gifs.slice(0, maxItems).map(gif => ({ type: 'video', data: { url: gif.mp4 } }))

    let caption = ''

    if (command.toLowerCase() === 'tenor' || command.toLowerCase() === 'tenorsearch') {
      caption = `🎬 *نتائج البحث من Tenor:*\n\n🔍 الكلمة: ${text}\n📦 النتائج: ${maxItems}\n\n> ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    } else if (command.toLowerCase() === 'بحث_عن_صور' || command.toLowerCase() === 'بحث_عن_متحركات') {
      caption = `🖼️ *تم العثور على نتائج البحث:*\n\n🔎 الكلمة: ${text}\n📸 عدد النتائج: ${maxItems}\n\n> ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`
    }

    await sendAlbumMessage(m.chat, medias, { caption, quoted: m })
    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    m.reply(`⚠️ حدث خطأ أثناء البحث.\n> حاول مرة أخرى لاحقًا.\n\n🧩 التفاصيل: ${e.message}\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻`)
  }
}

handler.help = ['tenor', 'بحث_عن_صور', 'بحث_عن_متحركات']
handler.tags = ['tools']
handler.command = ['tenorsearch', 'tenor', 'بحث_عن_صور', 'بحث_عن_متحركات']

export default handler