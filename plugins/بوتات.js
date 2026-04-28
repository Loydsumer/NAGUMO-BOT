let handler = async (m, { conn, isROwner }) => { if (!isROwner) return
  if (!m.isGroup) return m.reply('❌ للمجموعات فقط')
  if (!isAdmin && !isROwner) return m.reply('❌ للأدمن فقط')

  await m.reply('⏳ *جاري فحص الأجهزة...*')

  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants  = groupMetadata.participants || []
    const jids = participants.map(p => p.jid || p.id).filter(Boolean)

    // ━━━ اطلب الأجهزة لكل الأعضاء ━━━
    let devicesData = []
    try {
      devicesData = await conn.getUSyncDevices(jids, false, false) || []
    } catch (e) {
      console.log('getUSyncDevices failed:', e.message)
    }

    // ━━━ اجمع الأجهزة لكل رقم ━━━
    const devicesMap = {}
    for (const device of devicesData) {
      const jid = device?.user
      if (!jid) continue
      const num = jid.split('@')[0].split(':')[0]
      if (!devicesMap[num]) devicesMap[num] = []
      devicesMap[num].push(device)
    }

    // ━━━ فلتر اللي عندهم أكتر من جهاز ━━━
    const multiDevices = Object.entries(devicesMap)
      .filter(([_, devices]) => devices.length > 1)
      .map(([num, devices]) => ({ num, count: devices.length - 1 }))

    if (!multiDevices.length) {
      return conn.sendMessage(m.chat, {
        text: `✅ *مافيش أي عضو عنده أجهزة مرتبطة* 👌\n\n> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
      }, { quoted: m })
    }

    const deviceList = multiDevices.map(({ num, count }) =>
      `│┊ 📡 @${num} ⌯ الأجهزة: ${count}`
    ).join('\n')

    await conn.sendMessage(m.chat, {
      text: [
        `╭━━━━━━━━━━━━━━━━━━━━╮`,
        `┃  📡 *الأجهزة المرتبطة*`,
        `┃  👥 العدد: ${multiDevices.length}`,
        `┃━━━━━━━━━━━━━━━━━━━━`,
        deviceList,
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
        ``,
        `> ⚡ ${global.botName || '𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓'}`
      ].join('\n'),
      mentions: multiDevices.map(d => d.num + '@s.whatsapp.net')
    }, { quoted: m })

  } catch (err) {
    console.error('bots cmd:', err)
    m.reply(`❌ حصل خطأ: ${err.message}`)
  }
}

handler.help    = ['بوتات']
handler.tags    = ['group']
handler.command = /^(بوتات|bots|الاجهزة|multi)$/i
handler.group   = true
handler.admin   = true

export default handler