let WAMessageStubType = (await import('@whiskeysockets/baileys')).default

export async function before(m, { conn }) {

    if (!m.messageStubType || !m.isGroup) return

    // تحديث الـvCard
    let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${m.pushName || 'User'}
ORG:${m.pushName || 'User'}
TEL;type=CELL;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}
END:VCARD`

    let qkontak = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: m.pushName || 'User',
                vcard
            }
        }
    }

    let chat = global.db.data.chats[m.chat]
    let usuario = `@${m.sender.split`@`[0]}`
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://github.com/LOYD-SOLO/uploads1/blob/main/files/e65418-1776631134734.jpg')

    // الرسائل المزخرفة
    let nombre = `*╮═『⛩️┃تغيير اسم الجروب┃⛩️』═╭*
*┇🏮👤 الفاعل:〘${usuario}〙*
*┇🏮📢 الحدث:〘تم تغيير اسم الجروب〙*
*┇🏮📝 الاسم الجديد:〘${m.messageStubParameters[0]}〙*
*╯✯≼══━━﹂⛩️﹁━━══≽✯*`

    let foto = `*╮═『⛩️┃تغيير صورة الجروب┃⛩️』═╭*
*┇🏮👤 الفاعل:〘${usuario}〙*
*┇🏮📢 تم تغيير صورة الجروب بنجاح*
*╯✯≼══━━﹂⛩️﹁━━══≽✯*`

    let edit = `*╮═『⛩️┃تغيير إعدادات الجروب┃⛩️』═╭*
*┇🏮👤 الفاعل:〘${usuario}〙*
*┇🏮📢 الحدث:〘${m.messageStubParameters[0] == 'on' ? 'الأدمن فقط' : 'الجميع'}〙*
*╯✯≼══━━﹂⛩️﹁━━══≽✯*`

    let newlink = `*╮═『⛩️┃تغيير رابط الجروب┃⛩️』═╭*
*┇🏮👤 الفاعل:〘${usuario}〙*
*┇🏮📢 تم تغيير الرابط بنجاح*
*╯✯≼══━━﹂⛩️﹁━━══≽✯*`

    let status = edit

    let admingp = `*╮═『⛩️┃ترقية عضو إلى أدمن┃⛩️』═╭*
*┇🏮👤 العضو:〘@${m.messageStubParameters[0].split('@')[0]}〙*
*┇🏮👤 الفاعل:〘${usuario}〙*
*┇🏮📢 مبروك، أصبحت أدمن! 🔥*
*╯✯≼══━━﹂⛩️﹁━━══≽✯*`

    let noadmingp = `*╮═『⛩️┃تنزيل عضو من منصب أدمن┃⛩️』═╭*
*┇🏮👤 العضو:〘@${m.messageStubParameters[0].split('@')[0]}〙*
*┇🏮👤 الفاعل:〘${usuario}〙*
*┇🏮📢 تم تنزيل العضو من منصبه 😔*
*╯✯≼══━━﹂⛩️﹁━━══≽✯*`

    // دالة لإرسال الرسائل مع externalAdReply
    async function sendWithAdReply(content, isImage = false) {
        let message = isImage ? { image: { url: pp }, caption: content } : { text: content }
        message.contextInfo = {
            externalAdReply: {
                title: '𝐋𝐎𝐘𝐃',
                body: '𝐍𝐀𝐆𝐔𝐌𝐎 𝐁𝐎𝐓',
                thumbnailUrl: pp,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
        message.mentions = [m.sender]
        await conn.sendMessage(m.chat, message, { quoted: qkontak })
    }

    // إرسال الرسائل حسب نوع الحدث
    if (!chat.detect) return
    if (m.messageStubType == 21) await sendWithAdReply(nombre)
    else if (m.messageStubType == 22) await sendWithAdReply(foto, true)
    else if (m.messageStubType == 23) await sendWithAdReply(newlink)
    else if (m.messageStubType == 25) await sendWithAdReply(edit)
    else if (m.messageStubType == 26) await sendWithAdReply(status)
    else if (m.messageStubType == 29) await sendWithAdReply(admingp)
    else if (m.messageStubType == 30) await sendWithAdReply(noadmingp)
    else console.log({
        messageStubType: m.messageStubType,
        messageStubParameters: m.messageStubParameters,
        type: WAMessageStubType[m.messageStubType]
    })
}