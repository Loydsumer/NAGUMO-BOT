
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }
    await react('⏳')

    const botName  = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    const botDev   = global.botDev  || ''
    const ownerNum = (global.owner?.[0] || '').replace(/[^0-9]/g, '')
    const imgUrl   = 'https://files.catbox.moe/bo0swt.jpg'
    let thumb = null
    try {
        const res = await fetch(imgUrl)
        thumb = await res.buffer()
    } catch {}

    const vcard = [
        `BEGIN:VCARD`,
        `VERSION:3.0`,
        `FN:${botDev}`,
        `ORG:${botName}`,
        `TITLE:مطور ${botName}`,
        `TEL;type=CELL;waid=${ownerNum}:+${ownerNum}`,
        `X-WA-BIZ-NAME:${botName}`,
        `X-WA-BIZ-DESCRIPTION:${botName} — بوت واتساب متكامل`,
        `END:VCARD`
    ].join('\n')

    const qkontak = {
        key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
        message: { contactMessage: { displayName: botDev, vcard } }
    }

    try {
        await conn.sendMessage(m.chat, {
            contacts: { displayName: botDev, contacts: [{ vcard }] },
            contextInfo: {
                externalAdReply: {
                    title: ` ${botDev}`,
                    body: `مطور ${botName}`,
                    thumbnailUrl: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: qkontak })
        await react('✅')
    } catch (e) {
        console.error('[owner]', e.message)
        await react('❌')
        m.reply(` *المطور:* ${botDev}\n +${ownerNum}`)
    }
}

handler.help    = ['مطور']
handler.tags    = ['main']
handler.command = /^(مطور|owner|creator|المطور|مطوري|مطورك)$/i

export default handler