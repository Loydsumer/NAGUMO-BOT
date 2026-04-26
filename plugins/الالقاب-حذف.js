const handler = async (m, { conn, text, usedPrefix, command }) => {
    const Reg = /(?:@([^\s]+))/i;

    let mentionedJid;

    if (m.quoted && m.quoted.sender) {
        // إذا كان الرد على رسالة
        mentionedJid = m.quoted.sender;
    } else if (Reg.test(text)) {
        // إذا كان هناك tag@
        mentionedJid = text.match(Reg)[1] + '@s.whatsapp.net';
    } else {
        throw `֎╎الاستخـدام الصحيـح.☁️\n\n${usedPrefix + command} @منشـن العضـو أو الـرد علـى رسالـة العضـو.`;
    }

    if (!mentionedJid) throw '֎╎يجـب توجيـه منشـن للعضـو الـذي تـريد حـذف لقبه أو الـرد علـى رسالتـه.';

    let user = global.db.data.users[mentionedJid];
    if (!user || !user.groups || !user.groups[m.chat]) {
        throw '֎╎هـذا العضـو غيـر مسجـل.';
    }

    const groupId = m.chat;
    const oldName = user.groups[groupId].name;

    if (!oldName) throw '֎╎هـذا العضـو لا يملـك أي لقـب للحـذف.';

    // حذف اللقب
    delete user.groups[groupId].name;

    // حفظ التغييرات في قاعدة البيانات
    global.db.data.users[mentionedJid] = user;

    const caption = `֎╎تـم حـذف اللقـب بنجـاح:
╭──────────────
├✶ اللقـب المحـذوف: *${oldName}*
╰──────────────`;

    await conn.reply(m.chat, caption, m);
};

handler.admin = true;
handler.group = true;
handler.botAdmin = true;
handler.command = /^(حذف-لقب|حذف_لقب)$/i;

export default handler;