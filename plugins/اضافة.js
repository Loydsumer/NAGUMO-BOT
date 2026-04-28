let handler = async (m, { conn, args, isAdmin, isROwner, participants }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')

  if (!args[0]) {
    await react('❌')
    return m.reply('❌ اكتب رقم الشخص\n\nمثال: .اضافة 201234567890')
  }

  const number = args.join('').replace(/[^0-9]/g, '')  // join عشان يدعم مسافات زي +20 12 25286082
  const jid    = number + '@s.whatsapp.net'

  if (!number || number.length < 7) {
    return m.reply('❌ رقم غير صالح')
  }

  // ━━━ هل الرقم موجود في الجروب؟ ━━━
  const alreadyIn = participants.some(p =>
    (p.jid || p.id || '').split('@')[0] === number
  )
  if (alreadyIn) {
    await react('⚠️')
    return m.reply(`⚠️ @${number} موجود في الجروب بالفعل!`, m.chat, { mentions: [jid] })
  }

  // ━━━ هل الرقم على واتساب؟ ━━━
  try {
    const exists = await conn.onWhatsApp(number)
    if (!exists?.length || !exists[0]?.exists) {
      await react('❌')
      return m.reply(`❌ الرقم *${number}* مش على واتساب`)
    }
  } catch {}

  await react('⏳')

  try {
    const result = await conn.groupParticipantsUpdate(m.chat, [jid], 'add')
    const status = result?.[0]?.status

    console.log('[ADD] status:', status)

    if (status === '200' || status === 200) {
      await react('✅')
      await conn.sendMessage(m.chat, {
        text: `✅ *تم إضافة @${number} بنجاح* ⚡`,
        mentions: [jid]
      }, { quoted: m })

    } else if (status === '403') {
      await react('📨')
      await conn.sendMessage(m.chat, {
        text: [
          `📨 *@${number} فعّل خاصية منع الإضافة*`,
          ``,
          `✅ تم إرسال طلب دعوة له — ينتظر قبوله`
        ].join('\n'),
        mentions: [jid]
      }, { quoted: m })

    } else if (status === '408') {
      await react('⚠️')
      await conn.sendMessage(m.chat, {
        text: `⚠️ *@${number} موجود في الجروب بالفعل*`,
        mentions: [jid]
      }, { quoted: m })

    } else if (status === '409') {
      await react('❌')
      await conn.sendMessage(m.chat, {
        text: `❌ *فشل الإضافة* — الجروب ممتلئ`,
      }, { quoted: m })

    } else {
      await react('❌')
      m.reply(`❌ فشل الإضافة — كود: ${status}`)
    }

  } catch (e) {
    await react('❌')
    m.reply(`❌ فشل الإضافة: ${e.message}`)
  }
}

handler.help     = ['اضافة <رقم>']
handler.tags     = ['group']
handler.command  = /^(اضافة|اضافه|add)$/i
handler.group    = true
handler.admin    = true
handler.botAdmin = true

export default handler