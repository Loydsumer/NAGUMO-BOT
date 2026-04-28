// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🔘 زراير / تواصل — Contact Card Style
//  𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let handler = async (m, { conn }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }) } catch {}
    }
    await react('⏳')

    const botName  = global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'
    const botDev   = global.botDev  || '♡Jana♡'
    const ownerNum = (global.owner?.[0] || '').replace(/[^0-9]/g, '')
    const chLink   = global.links?.channel || ''
    const grpLink  = global.links?.group   || ''
    const suppLink = global.links?.support || ''
    const thumb    = global.images?.owner  || 'https://file.garden/aauvg01sjleV_ic1/2.jpg'

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

    const text = [
        `╔═══「 🤖 ${botName} 」═══╗`,
        `│`,
        `│ 👑 المطور: ${botDev}`,
        chLink   ? `│ 📢 القناة: ${chLink}`   : '',
        grpLink  ? `│ 👥 الجروب: ${grpLink}`  : '',
        suppLink ? `│ 🛠️ الدعم: ${suppLink}`  : '',
        `│ 💬 المطور: https://wa.me/${ownerNum}`,
        `│`,
        `╚══════════════════════╝`
    ].filter(Boolean).join('\n')

    try {
        await conn.sendMessage(m.chat, {
            contacts: { displayName: botDev, contacts: [{ vcard }] },
            contextInfo: {
                externalAdReply: {
                    title: botName,
                    body: `by ${botDev}`,
                    thumbnailUrl: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: qkontak })

        // رسالة الروابط بعدها
        await conn.sendMessage(m.chat, { text }, { quoted: m })
        await react('✅')
    } catch (e) {
        console.error('[buttons]', e.message)
        await react('❌')
        m.reply(text)
    }
}

handler.help    = ['زراير']
handler.tags    = ['main']
handler.command = /^(زراير|buttons|تواصل|contact)$/i

export default handler