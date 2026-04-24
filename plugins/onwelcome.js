import fs from 'fs'

let handler = async (m, { conn, command }) => {
    let chat = global.db.data.chats[m.chat]

    if (command === 'onwelcome') {
        chat.welcome = true
        return m.reply('*✔ تم تشغيل الترحيب بنجاح*')
    }

    if (command === 'offwelcome') {
        chat.welcome = false
        return m.reply('*✖ تم إيقاف الترحيب بنجاح*')
    }
}

handler.before = async function (m, { conn }) {
    if (!m.isGroup) return
    if (!global.db.data.chats[m.chat].welcome) return
    if (!m.messageStubType) return

    let id = m.chat
    let action = ''
    let participants = m.messageStubParameters
    let chat = global.db.data.chats[id] || {}

    if (m.messageStubType === 27) action = 'add'
    if (m.messageStubType === 28) action = 'remove'
    if (!action) return

    let groupMetadata = await conn.groupMetadata(id)

    for (let user of participants) {
        let pp = global.gataImg
        try { pp = await conn.profilePictureUrl(user, 'image') } catch { }

        let file = await getFile(pp)

        let text = ''
        let tag = '@' + user.split('@')[0]
        let membersCount = groupMetadata.participants.length
        let groupName = groupMetadata.subject

        // ===========================
        //      ★ نص الترحيب ★
        // ===========================
        if (action === 'add') {

            text = `
*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼‏❆⧽~*
*🧭┊⪼• ◈╷${groupName} ⥏🧭⥑ 𝑮𝑹𝑶𝑼𝑷╵◈*
*¦ ⌗╎عــدد الأعــضــاء╎⌗ ¦*
> *~『◈˼‏${membersCount} عــضــو˹◈』~*

*~˼‏※⸃─┉┈┈⥏🧭⥑┈┈┉─⸂※ ˹~*
*⸂┊˼‏الـمُــنــضــم الجــديــد ↓⸃*
> *${tag}*
> *⌝˼‏نــورت جــروب: ${groupName}˹⌞*
> *❖ أتــمــنــى لــك وقــتــاً ممتــعــاً بــيــنــنــا*

*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼‏❆⧽~*
`.trim()
        }

        // ===========================
        //      ★ نص المغادرة ★
        // ===========================
        if (action === 'remove') {

            text = `
*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼‏❆⧽~*
*🧭┊⪼• ◈╷${groupName} ⥏🧭⥑ 𝑮𝑹𝑶𝑼𝑷╵◈*
*¦ ⌗╎عــدد الأعــضــاء╎⌗ ¦*
> *~『◈˼‏${membersCount} عــضــو˹◈』~*

*~˼‏※⸃─┉┈┈⥏🧭⥑┈┈┉─⸂※ ˹~*
*⸂┊˼‏الـمُــغــادر ↓⸃*
> *${tag}*
> *⌝˼‏غــادر الجــروب ${groupName}˹⌞*
> *❖ نــتــمــنــى لــه الــتــوفــيــق*

*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼‏❆⧽~*
`.trim()
        }

        // ============= إرسال الرسالة =============
        let quotedContact = {
            "key": {
                "participants": "0@s.whatsapp.net",
                "remoteJid": "status@broadcast",
                "fromMe": false,
                "id": "Halo"
            },
            "message": {
                "contactMessage": {
                    "vcard":
`BEGIN:VCARD
VERSION:3.0
N:Sy;User;;;
FN:User
item1.TEL;waid=${tag.replace('@', '')}:${tag.replace('@', '')}
item1.X-ABLabel:Ponsel
END:VCARD`
                }
            }
        }

        await conn.sendMessage(id, {
            image: file.data,
            caption: text,
            mentions: [user],
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: '𝔸𝔹𝕐𝕊𝕊 𝔹𝕆𝕋',
                    thumbnail: file.data,
                    mediaType: 1,
                }
            }
        }, { quoted: quotedContact })

    }
}

// =======================
//  الدوال الناقصة
// =======================

function decodeJid(jid) {
    return jid?.replace(/:[0-9]+@/gi, '@')
}

async function getFile(url) {
    let buffer = await (await fetch(url)).arrayBuffer()
    return { data: Buffer.from(buffer) }
}

global.gataImg = 'https://i.imgur.com/0eQd1.jpg'
global.wm = 'Abyss Bot'

handler.help = ['onwelcome', 'offwelcome']
handler.tags = ['group']
handler.command = ['onwelcome', 'offwelcome']

export default handler