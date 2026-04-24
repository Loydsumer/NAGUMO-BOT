let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
    let isEnable = /true|enable|(turn)?on|1/i.test(command);
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];
    let bot = global.db.data.settings[conn.user.jid] || {};
    let type = (args[0] || '').toLowerCase();
    let isAll = false, isUser = false;

    switch (type) {
        case 'الترحيب':
            if (!m.isGroup) {
                if (!isOwner) return global.dfail('group', m, conn);
            } else if (!isAdmin) {
                return global.dfail('admin', m, conn);
            }
            chat.welcome = isEnable;
            break;

        case 'antipv':
            isAll = true;
            if (!isOwner) return global.dfail('rowner', m, conn);
            bot.antiPrivate = isEnable;
            break;

        case 'التقييد':
            isAll = true;
            if (!isOwner) return global.dfail('rowner', m, conn);
            bot.restrict = isEnable;
            break;

        case 'autolevelup':
            if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
            chat.autolevelup = isEnable;
            break;

        case 'منع البوتات':
            if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
            chat.antiBot = isEnable;
            break;

        case 'رد تلقائي':
            if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
            chat.autoresponder = isEnable;
            break;

        case 'قراءة تلقائية':
            isAll = true;
            if (!isROwner) return global.dfail('rowner', m, conn);
            global.opts['autoread'] = isEnable;
            break;

        case 'رؤية مرة واحدة':
            if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
            chat.antiver = isEnable;
            break;

        case 'التفاعل بالرموز':
            if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
            chat.reaction = isEnable;
            break;

        case 'الرسائل الصوتية':
            if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
            chat.audios = isEnable;
            break;

        case 'antilink':
            if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
            chat.antiLink = isEnable;
            break;

        case 'المحتوى الحساس':
            if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
            chat.nsfw = isEnable;
            break;

        default:
            return conn.reply(m.chat, `❌ *الخيار غير موجود!*\n\n⚙️ *الإعدادات المتاحة:*\n- الترحيب\n- antipv\n- التقييد\n- autolevelup\n- منع البوتات\n- رد تلقائي\n- قراءة تلقائية\n- رؤية مرة واحدة\n- التفاعل بالرموز\n- الرسائل الصوتية\n- antilink\n- المحتوى الحساس\n\nاستخدم:\n*${usedPrefix + command} <الخيار>*\nمثال: *${usedPrefix + command} الترحيب*`, m);
    }

    await conn.sendMessage(m.chat, {
        text: `✅ *تم ${isEnable ? 'تفعيل' : 'إلغاء'} ${type}*`,
        footer: '🔹 إعدادات البوت 🔹',
        buttons: [
            { buttonId: isEnable ? `.off ${type}` : `.on ${type}`, buttonText: { displayText: isEnable ? '❌ إيقاف' : '✅ تشغيل' } },
            { buttonId: ".menu", buttonText: { displayText: '📜 القائمة' } }
        ],
        viewOnce: true,
        headerType: 1
    }, { quoted: m });
}

handler.help = ['enable <الخيار>', 'disable <الخيار>', 'on <الخيار>', 'off <الخيار>', '1', '0'];
handler.tags = ['الإعدادات'];
handler.command = ['enable', 'disable', 'on', 'off', '1', '0'];

export default handler;