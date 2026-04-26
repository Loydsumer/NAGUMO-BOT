var handler = async (m, { conn, usedPrefix, command, text, groupMetadata }) => {

    // تحديد الشخص المذكور أو الذي تم الرد عليه
    let mentionedJid = await m.mentionedJid
    let user = mentionedJid && mentionedJid.length 
        ? mentionedJid[0] 
        : m.quoted && await m.quoted.sender 
            ? await m.quoted.sender 
            : null

    if (!user) return conn.reply(m.chat, `❀ يجب أن تقوم بمنشن شخص ليمكنك تنزيله من الأدمنية.`, m)

    try {
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

        if (user === conn.user.jid)
            return conn.reply(m.chat, `ꕥ لا يمكنك تنزيل البوت من الأدمنية.`, m)

        if (user === ownerGroup)
            return conn.reply(m.chat, `ꕥ لا يمكنك تنزيل منشئ المجموعة.`, m)

        if (user === ownerBot)
            return conn.reply(m.chat, `ꕥ لا يمكنك تنزيل مالك البوت.`, m)

        await conn.groupParticipantsUpdate(m.chat, [user], 'demote')

        conn.reply(m.chat, `❀ تم تنزيله من الأدمنية بنجاح.`, m)

    } catch (e) {
        conn.reply(
            m.chat,
            `⚠︎ حدثت مشكلة.\n> استخدم الأمر *${usedPrefix}report* للإبلاغ عنها.\n\n${e.message}`,
            m
        )
    }
}

handler.help = ['demote']
handler.tags = ['grupo']
handler.command = ['demote', 'degradar']
handler.group = true            // يعمل في الجروب فقط  
handler.admin = true            // لا يعمل إلا للمشرفين  
handler.botAdmin = true         // لازم البوت يكون أدمن  

export default handler