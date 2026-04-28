const linkRegex = /(?:https?:\/\/|www\.|t\.me\/|wa\.me\/|chat\.whatsapp\.com\/)[^\s]*/i

let handler = async (m, { conn, chat, isAdmin, isROwner, command }) => {
  if (!m.isGroup)            return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')

  const isOn = /^(ضد_لينك|antilink)$/i.test(command)

  chat.antiLink = isOn

  await conn.sendMessage(m.chat, {
    text: isOn
      ? `✅ *تم تفعيل ضد اللينكات*\n\n🔗 أي لينك هيتحذر صاحبه\n⚠️ بعد 3 تحذيرات هيتطرد\n\n> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
      : `❌ *تم إيقاف ضد اللينكات*\n\n> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
  }, { quoted: m })
}

// ━━━ مراقب كل رسالة ━━━
handler.all = async function (m, { chat, isAdmin, isROwner, isBotAdmin }) {
  if (!m.isGroup)      return
  if (!chat?.antiLink) return
  if (isAdmin || isROwner) return
  if (!m.text)         return
  if (!linkRegex.test(m.text)) return
  if (!isBotAdmin)     return

  const sender = m.sender
  const users  = global.db.data.users
  if (!users[sender]) users[sender] = {}
  users[sender].warn = (users[sender].warn || 0) + 1
  const warns = users[sender].warn

  // احذف الرسالة
  try { await this.sendMessage(m.chat, { delete: m.key }) } catch {}

  if (warns >= 3) {
    users[sender].warn = 0
    try {
      await this.groupParticipantsUpdate(m.chat, [sender], 'remove')
      await this.sendMessage(m.chat, {
        text: `🚫 *تم طرد @${sender.split('@')[0]}*\nالسبب: إرسال لينكات (3 تحذيرات)`,
        mentions: [sender]
      })
    } catch {
      await this.sendMessage(m.chat, {
        text: `⚠️ @${sender.split('@')[0]} وصل لـ 3 تحذيرات!\n(البوت محتاج صلاحية أدمن للطرد)`,
        mentions: [sender]
      })
    }
  } else {
    await this.sendMessage(m.chat, {
      text: [
        `⚠️ *تحذير لـ @${sender.split('@')[0]}*`,
        `🔗 ممنوع اللينكات في المجموعة!`,
        `📊 تحذيراتك: ${warns}/3`,
        warns === 2 ? `❗ تحذير أخير — التالي طرد!` : '',
      ].filter(Boolean).join('\n'),
      mentions: [sender]
    })
  }
}

handler.command = /^(ضد_لينك|antilink|ايقاف_ضد_لينك|antilink_off)$/i
handler.help    = ['ضد_لينك', 'ايقاف_ضد_لينك']
handler.tags    = ['group']
handler.group   = true
handler.admin   = true

export default handler