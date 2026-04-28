import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

// ━━━ تحويل JID لرقم قابل للقراءة ━━━
function jidToPhone(jid = '') {
  // لو LID — شيل الـ @lid وحاول تجيب الرقم من DB
  if (jid.endsWith('@lid')) {
    const lidNum = jid.split('@')[0].split(':')[0]
    // دور على الرقم الحقيقي في قاعدة البيانات
    const users = global.db?.data?.users || {}
    for (const [userJid, data] of Object.entries(users)) {
      if (data?.lid && data.lid === lidNum) {
        return PhoneNumber('+' + userJid.replace('@s.whatsapp.net', '')).getNumber('international') || userJid
      }
    }
    return `LID:${lidNum}` // fallback لو مش لاقيه
  }
  // رقم عادي
  const num = jid.replace('@s.whatsapp.net', '').replace('@s.whatsapp.net', '').split(':')[0]
  if (!num || !/^\d+$/.test(num)) return jid
  try {
    return PhoneNumber('+' + num).getNumber('international') || num
  } catch {
    return num
  }
}

export default async function (m, conn = { user: {} }) {
  let _name = await conn.getName(m.sender)
  let sender = jidToPhone(m.sender) + (_name ? ' ~' + _name : '')
  let chat = await conn.getName(m.chat)
  let img
  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) {
    console.error(e)
  }

  let filesize = (m.msg ?
    m.msg.vcard ? m.msg.vcard.length :
    m.msg.fileLength ? m.msg.fileLength.low || m.msg.fileLength :
    m.msg.axolotlSenderKeyDistributionMessage ? m.msg.axolotlSenderKeyDistributionMessage.length :
    m.text ? m.text.length : 0
    : m.text ? m.text.length : 0) || 0

  let me = jidToPhone(conn.user?.jid || '')
  let time = (m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date).toTimeString().split(' ')[0]
  let type = m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg?.ptt ? 'PTT' : 'Audio').toUpperCase() : 'غير معروف'
  let command = m.text?.startsWith('.') ? m.text.split(/\s+/)[0] : '—'
  let contentPreview = typeof m.text === 'string' ? m.text.trim().slice(0, 60) : ''

  console.log(chalk.cyanBright(`
~*『✦▬▬▬✦┇• NEW MESSAGE •┇✦▬▬▬✦』*~

┏━━━━━━━[ NEW MESSAGE ]━━━━━━━┓
📤 FROM   : ${sender}
🧾 TYPE   : ${type}
💬 CHAT   : ${chat}
🕒 TIME   : ${time}
📦 SIZE   : ${filesize} bytes
⚙️ CMD    : ${command}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

╭─[ MESSAGE CONTENT ]
│ ${contentPreview || '—'}
╰──────────────
`.trim()))

  if (img) console.log(img.trimEnd())

  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')

    let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(?!`)(.+?)\1|```((?:.|[\n\r])+?)```|`([^`]+?)`)(?=\S?(?:[\s\n]|$))/g
    let mdFormat = (depth = 4) => (_, type, text, monospace) => {
      let types = { '_': 'italic', '*': 'bold', '~': 'strikethrough', '`': 'bgGray' }
      text = text || monospace
      let formatted = !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(/`/g, '').replace(mdRegex, mdFormat(depth - 1)))
      return formatted
    }

    log = log.replace(mdRegex, mdFormat(4))
    log = log.split('\n').map(line => {
      if (line.trim().startsWith('>')) return chalk.bgGray.dim(line.replace(/^>/, '┃'))
      else if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) return line.replace(/^(\d+)\./, (_, n) => `${n.length === 1 ? '  ' : ' '}${n}.`)
      else if (/^[-*]\s/.test(line.trim())) return line.replace(/^[*-]/, '  •')
      return line
    }).join('\n')

    if (log.length < 1024)
      log = log.replace(urlRegex, (url, i, text) => {
        let end = url.length + i
        return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url
      })

    log = log.replace(mdRegex, mdFormat(4))
    if (m.mentionedJid && Array.isArray(m.mentionedJid)) for (let u of m.mentionedJid) log = log.replace('@' + u.split`@`[0], chalk.blueBright('@' + await conn.getName(u)))
    console.log(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log)
  }

  if (m.messageStubParameters) console.log(m.messageStubParameters.map(jid => {
    jid = conn.decodeJid(jid)
    let name = conn.getName(jid)
    return chalk.gray(jidToPhone(jid) + (name ? ' ~' + name : ''))
  }).join(', '))

  if (/document/i.test(m.mtype)) console.log(`🗂️ ${m.msg.fileName || m.msg.displayName || 'Document'}`)
  else if (/ContactsArray/i.test(m.mtype)) console.log(`👨‍👩‍👧‍👦`)
  else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`)
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds
    console.log(`${m.msg.ptt ? '🎤 (PTT ' : '🎵 (AUDIO) '} ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`)
  }

  console.log()
}

let file = global.__filename(import.meta.url)
watchFile(file, () => console.log(chalk.redBright("Update 'lib/print.js'")))
