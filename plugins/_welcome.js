import {WAMessageStubType} from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, {conn, participants, groupMetadata}) {
  if (!m.messageStubType || !m.isGroup) return !0;
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://raw.githubusercontent.com/LOYD-SOLO/uploads1/main/files/e65418-1776631134734.jpg')
  let img = await (await fetch(`${pp}`)).buffer()
  let chat = global.db.data.chats[m.chat]

  if (chat.bienvenida && m.messageStubType == 27) {
    let bienvenida = `منور🐦🪻\n@${m.messageStubParameters[0].split`@`[0]} 」\n 🐦 شايف ايه؟ ${groupMetadata.subject}\n`
    
await conn.sendAi(m.chat, botname, textbot, bienvenida, img, img, canal, estilo)
  }
  
  if (chat.bienvenida && m.messageStubType == 28) {
    let bye = `مع سلامة🐦👋\n @${m.messageStubParameters[0].split`@`[0]} `
await conn.sendAi(m.chat, botname, textbot, bye, img, img, canal, estilo)
  }
  
  if (chat.bienvenida && m.messageStubType == 32) {
    let kick = `ههههههههههههههههه بلع طرد البوت🐦🫵\n@${m.messageStubParameters[0].split`@`[0]}`
await conn.sendAi(m.chat, botname, textbot, kick, img, img, canal, estilo)
}} 