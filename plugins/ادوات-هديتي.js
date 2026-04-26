let handler = async (m, { command, conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let currentDate = new Date().toLocaleDateString(); // تاريخ اليوم

    // التحقق إذا كانت الهدية قد تم استلامها اليوم
    if (user.lastGiftDate === currentDate) {
        return await conn.reply(m.chat, `🚫 *لقد أخذت هديتك اليومية بالفعل! يمكنك الحصول عليها غدًا.*`, m)
    }

    // منح 15 ماسة هدية للمستخدم
    user["ماسة"] = (user["ماسة"] || 0) + 15;
    user.lastGiftDate = currentDate; // تسجيل التاريخ الذي حصل فيه على الهدية

    return await conn.reply(m.chat, `🎁 *هديتك اليومية: 15 ماسة!*`, m)
}

handler.help = ['هدية', 'هديتي']
handler.tags = ['rpg']
handler.command = /^(هدية|هديتي)$/i

export default handler