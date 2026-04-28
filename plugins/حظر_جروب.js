import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isROwner, command, usedPrefix }) => {
  if (!isROwner) return m.reply('❌ هذا الأمر للمطور فقط')

  // ━━━ أمر قائمة المحظورة ━━━
  if (/^(قائمة_محظورة|listbanned)$/i.test(command)) {
    const chats  = global.db.data.chats || {}
    const banned = Object.entries(chats)
      .filter(([_, c]) => c?.isBanned)
      .map(([jid]) => jid)

    if (!banned.length) return m.reply('✅ لا يوجد جروبات محظورة')

    await m.reply('⏳ جاري جلب أسماء الجروبات...')

    const lines = ['🚫 *الجروبات المحظورة:*', '']
    let count = 0

    for (const jid of banned) {
      count++
      let name = 'غير معروف'

      // ── محاولة جلب اسم الجروب ──
      try {
        const metadata = await conn.groupMetadata(jid)
        name = metadata?.subject || 'غير معروف'
      } catch {
        // لو فشل groupMetadata نجرب طرق تانية
        try {
          name = await conn.getName(jid) || 'غير معروف'
        } catch {
          // نجرب من الـ contacts
          try {
            const contact = conn.contacts?.[jid]
            name = contact?.name || contact?.notify || contact?.subject || 'غير معروف'
          } catch {}
        }
      }

      // ── تنظيف الرقم للعرض ──
      const shortJid = jid.replace('@g.us', '')

      lines.push(`*${count}.* ${name}`)
      lines.push(`   📎 \`${shortJid}\``)
      lines.push('')
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`📊 *المجموع:* ${count} جروب محظور`)
    lines.push('')
    lines.push(`> 🤖 ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`)

    // ── إرسال بأزرار ──
    try {
      const nativeFlowPayload = {
        body:   { text: lines.join('\n') },
        footer: { text: `⚙️ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
        header: { hasMediaAttachment: false },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '🔄 تحديث القائمة',
                id: `${usedPrefix}قائمة_محظورة`
              })
            }
          ]
        }
      }

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject(nativeFlowPayload)
          }
        }
      }, { userJid: conn.user.jid, quoted: m })

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    } catch {
      await m.reply(lines.join('\n'))
    }

    return
  }

  // ━━━ أوامر الحظر / فك الحظر ━━━
  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')

  const chat     = global.db.data.chats[m.chat]
  const isBanned = chat?.isBanned || false
  const isOn     = /^(حظر_جروب|banchat)$/i.test(command)
  const isOff    = /^(فك_حظر_جروب|unbanchat)$/i.test(command)

  if (isOn && isBanned)   return m.reply('⚠️ هذا الجروب محظور بالفعل!')
  if (isOff && !isBanned) return m.reply('⚠️ هذا الجروب غير محظور!')

  // ── جلب اسم الجروب ──
  let groupName = m.chat
  try {
    const metadata = await conn.groupMetadata(m.chat)
    groupName = metadata?.subject || m.chat
  } catch {}

  if (isOn) {
    chat.isBanned = true
  } else {
    chat.isBanned = false
  }

  const status = isOn ? '🚫 *تم حظر الجروب*' : '✅ *تم فك حظر الجروب*'
  const desc   = isOn
    ? 'البوت لن يرد على أي أمر في هذا الجروب'
    : 'البوت عاد للعمل في هذا الجروب'

  // ── الرد بأزرار ──
  try {
    const toggleBtnText = isOn ? '✅ فك الحظر' : '🚫 حظر الجروب'
    const toggleBtnId   = isOn ? `${usedPrefix}فك_حظر_جروب` : `${usedPrefix}حظر_جروب`

    const nativeFlowPayload = {
      body: {
        text: [
          status,
          '',
          `📌 ${desc}`,
          `📎 الجروب: *${groupName}*`
        ].join('\n')
      },
      footer: { text: `⚙️ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}` },
      header: { hasMediaAttachment: false },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: toggleBtnText,
              id: toggleBtnId
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '📋 قائمة المحظورة',
              id: `${usedPrefix}قائمة_محظورة`
            })
          }
        ]
      }
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject(nativeFlowPayload)
        }
      }
    }, { userJid: conn.user.jid, quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (e) {
    console.error('[BANCHAT] Button error:', e.message)
    await m.reply(`${status}\n\n📌 ${desc}\n📎 الجروب: *${groupName}*`)
  }
}

handler.command  = /^(حظر_جروب|banchat|فك_حظر_جروب|unbanchat|قائمة_محظورة|listbanned)$/i
handler.help     = ['حظر_جروب', 'فك_حظر_جروب', 'قائمة_محظورة']
handler.tags     = ['owner']
handler.rowner   = true

export default handler