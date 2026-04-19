let handler = async (m, { conn }) => {

  let who

  if (m.isGroup) {
    who = m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : m.quoted 
        ? m.quoted.sender 
        : m.sender
  } else {
    who = m.chat
  }

  try {
    let lid = 'غير متوفر'

    // الطريقة 1 (رسمية)
    let check = await conn.onWhatsApp(who)
    if (check && check[0] && check[0].lid) {
      lid = check[0].lid
    }

    // الطريقة 2 (احتياط من الرسالة)
    if (lid === 'غير متوفر' && m.quoted) {
      let q = m.quoted
      if (q.key?.participant?.includes('@lid')) {
        lid = q.key.participant
      }
    }

    let teks = `╭━〔 🆔 LID INFO 〕━╮
┃ 👤 المستخدم: @${who.split('@')[0]}
┃ 🔢 LID: ${lid}
╰━━━━━━━━━━━━━━╯

> 𝐍𝐀𝐆𝐔𝐌𝐎 𝐁𝐎𝐓 ⋅ 𝐁𝐘 𝐋𝐎𝐘𝐃`

    await conn.sendMessage(m.chat, {
      text: teks,
      mentions: [who]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ ما قدرت أجيب الـ LID', m)
  }

}

handler.command = /^(lid|ايدي)$/i
handler.group = true

export default handler