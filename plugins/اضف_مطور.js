import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// config.js دايماً في جذر البوت
const CONFIG_PATH = join(process.cwd(), 'config.js')

function saveOwnerToConfig(num) {
  if (!existsSync(CONFIG_PATH)) throw new Error('config.js مش موجود في: ' + CONFIG_PATH)

  let content = readFileSync(CONFIG_PATH, 'utf-8')

  const ownerRegex = /(owner\s*:\s*\[)([\s\S]*?)(\])/
  const match = content.match(ownerRegex)
  if (!match) throw new Error('مش لاقي owner في config.js')

  if (match[2].includes(`"${num}"`) || match[2].includes(`'${num}'`)) return false

  const newContent = content.replace(
    ownerRegex,
    `$1$2        "${num}",\n    $3`
  )

  writeFileSync(CONFIG_PATH, newContent, 'utf-8')
  return true
}

let handler = async (m, { conn, isROwner }) => {
  if (!isROwner) return m.reply('❌ هذا الأمر للمطور الأصلي فقط')

  let who = null
  if (m.quoted) {
    who = m.quoted.sender
  } else if (m.mentionedJid?.[0]) {
    who = m.mentionedJid[0]
  }

  if (!who) return m.reply('❌ رد على رسالة الشخص أو اعمل منشن @')

  const num = who.replace(/[^0-9]/g, '')

  if (global.owner?.includes(num)) {
    return m.reply(`⚠️ هذا الشخص مطور بالفعل`)
  }

  try {
    if (!global.owner) global.owner = []
    global.owner.push(num)

    saveOwnerToConfig(num)

    await conn.sendMessage(m.chat, {
      text: `✅ تم إضافة @${num} كمطور ⚔️\n💾 تم الحفظ في config.js\n\n> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`,
      mentions: [who]
    }, { quoted: m })

  } catch (e) {
    console.error('addowner error:', e.message)
    m.reply('❌ فشل الحفظ: ' + e.message)
  }
}

handler.command = /^(اضف_مطور|addowner|مطور)$/i
handler.help    = ['اضف_مطور @']
handler.tags    = ['owner']
handler.rowner  = true

export default handler