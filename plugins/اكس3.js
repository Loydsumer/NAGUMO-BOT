let handler = async (m, { conn, text }) => {
	let room = Object.values(conn.game).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender))
if (room == undefined) return conn.reply(m.chat,`*❏ انت لست في جيم اكس او*`, m)
delete conn.game[room.id]
await conn.reply(m.chat, `*✦┇تم حـذف الـجـيـم بنـجـاح┇✦*`, m)
}
handler.help = ['delttt']
handler.tags = ['game']
handler.command = ['delttt', 'delxo', 'حذففف','حذفاكس','كنسل']

export default handler