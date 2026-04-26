let handler = async (m, { conn, text }) => {
  let tagme = `https://wa.me/+${m.sender.replace(`+`)}/?text=𝑮𝒉𝒆𝒕𝒕𝒐-𝐁𝐎𝐓-𝐕𝟐`
  let mylink = [m.sender]
  conn.reply(m.chat, tagme, m, { contextInfo: { mylink }})
}
handler.help = ['منشني']
handler.tags = ['group']
handler.command = /^رابطي|لينكي$/i

handler.group = false

export default handler