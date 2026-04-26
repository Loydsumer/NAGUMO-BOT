import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const fecha = new Date().toLocaleDateString("ar-EG", { timeZone: "Africa/Cairo", day: 'numeric', month: 'long', year: 'numeric' })
    const groupSize = groupMetadata.participants.length + 1
    const desc = groupMetadata.desc?.toString() || 'لا يوجد وصف'
    const mensaje = (chat.sWelcome || 'يمكنك تعديل هذه الرسالة باستخدام الأمر "setwelcome"').replace(/{usuario}/g, `${username}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `${desc}`)
    
    const caption = `👻 *مرحباً بك في العائلة!* 👻\n\n` +
                   `🕶️ *المجموعة:* ${groupMetadata.subject}\n` +
                   `👤 *العضو الجديد:* ${username}\n` +
                   `📝 *الرسالة:* ${mensaje}\n` +
                   `👥 *عدد الأعضاء الآن:* ${groupSize}\n` +
                   `📅 *التاريخ:* ${fecha}\n\n` +
                   `*ＯᏀᎯᎷᏆ ᏴᎾᎢ  يرحب بك في مجموعتنا...*\n` +
                   `*استخدم #الاوامر لرؤية الأوامر المتاحة.*\n\n` +
                   `🅾🅶🅰🅼🅸 🅱🅾🆃 👻`
    
    return { pp, caption, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const fecha = new Date().toLocaleDateString("ar-EG", { timeZone: "Africa/Cairo", day: 'numeric', month: 'long', year: 'numeric' })
    const groupSize = groupMetadata.participants.length - 1
    const desc = groupMetadata.desc?.toString() || 'لا يوجد وصف'
    const mensaje = (chat.sBye || 'يمكنك تعديل هذه الرسالة باستخدام الأمر "setbye"').replace(/{usuario}/g, `${username}`).replace(/{grupo}/g, `${groupMetadata.subject}`).replace(/{desc}/g, `*${desc}*`)
    
    const caption = `👻 *وداعاً يا صديقي...* 👻\n\n` +
                   `🕶️ *المجموعة:* ${groupMetadata.subject}\n` +
                   `👤 *العضو المغادر:* ${username}\n` +
                   `📝 *الرسالة:* ${mensaje}\n` +
                   `👥 *عدد الأعضاء الآن:* ${groupSize}\n` +
                   `📅 *التاريخ:* ${fecha}\n\n` +
                   `*ＯᏀᎯᎷᏆ    يتمنى لك حظاً سعيداً...*\n` +
                   `*لا تنسى أن العائلة تنتظر عودتك دائماً.*\n\n` +
                   `🅾🅶🅰🅼🅸 🅱🅾🆃 👻`
    
    return { pp, caption, mentions: [userId] }
}

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return !0
    
    const primaryBot = global.db.data.chats[m.chat].primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw !1
    
    const chat = global.db.data.chats[m.chat]
    const userId = m.messageStubParameters[0]
    
    // ترحيب عند دخول عضو جديد
    if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const { pp, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
        rcanal.contextInfo.mentionedJid = mentions
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, ...rcanal }, { quoted: null })
        try { fs.unlinkSync(img) } catch {}
    }
    
    // توديع عند خروج عضو
    if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        const { pp, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
        rcanal.contextInfo.mentionedJid = mentions
        await conn.sendMessage(m.chat, { image: { url: pp }, caption, ...rcanal }, { quoted: null })
        try { fs.unlinkSync(img) } catch {}
    }
}

export { generarBienvenida, generarDespedida }
export default handler