var handler = async (m, {conn, groupMetadata }) => {

conn.reply(m.chat, `${await groupMetadata.id}`,   )

}
handler.help = ['اوبيتو']
handler.tags = ['اوبيتو']
handler.command = /^(ايدي-جروب)$/i

handler.group = true
handler.owner = true
export default handler