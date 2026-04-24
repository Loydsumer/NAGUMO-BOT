//━━━━━━━━━━━━━━━━━━━━━━━//
// ✦ الكود من تطوير: ˚꒰🩸꒱ ፝͜⁞A͢ʙʏss-ʙᴏᴛ-𝑴𝑫✰⃔⃝🕷
// ✦ وظيفة الكود: إشعارات مزخرفة لتغييرات الجروب (الاسم، الوصف، الإعدادات، المشرفين)
//━━━━━━━━━━━━━━━━━━━━━━━//

const baileys = await import('@whiskeysockets/baileys');
const { proto, generateWAMessage } = baileys.default || baileys;

let handler = m => m;

handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.isGroup) return;

    const fkontak = {
        key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Abyss" },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Abyss;;;\nFN:Abyss\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    let chat = global.db.data.chats[m.chat];
    let usuario = `@${m.sender.split('@')[0]}`;
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg';

    //━━━━━━━━━━━━━━━━━━━━━━━//
    // تغيير اسم الجروب
    //━━━━━━━━━━━━━━━━━━━━━━━//
    if (m.type === 'GROUP_UPDATE_SUBJECT' && chat.detect) {
        let nombre = `*◞🏷️‟⌝╎تـغـيـيـر الاسـم ⸃⤹*\n> *${usuario} غيّر اسم الجروب إلى:* ${m.newSubject}`;
        await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak });
    }

    //━━━━━━━━━━━━━━━━━━━━━━━//
    // تغيير وصف الجروب
    //━━━━━━━━━━━━━━━━━━━━━━━//
    if (m.type === 'GROUP_UPDATE_DESCRIPTION' && chat.detect) {
        let desc = `*◞📝‟⌝╎تـغـيـيـر وصـف الـجـروب ⸃⤹*\n> *${usuario} غيّر وصف الجروب إلى:* ${m.newDescription}`;
        await conn.sendMessage(m.chat, { text: desc, mentions: [m.sender] }, { quoted: fkontak });
    }

    //━━━━━━━━━━━━━━━━━━━━━━━//
    // تغيير صلاحيات الجروب
    //━━━━━━━━━━━━━━━━━━━━━━━//
    if (m.type === 'GROUP_UPDATE_SETTING' && chat.detect) {
        let settings = {
            'announcement': 'فقط المشرفين يمكنهم إرسال الرسائل',
            'not_announcement': 'الكل يمكنه إرسال الرسائل',
            'locked': 'فقط المشرفين يمكنهم تعديل إعدادات الجروب',
            'unlocked': 'الكل يمكنه تعديل إعدادات الجروب'
        };
        let status = `*◞⚙️‟⌝╎تـعـديـل صـلاحـيـات الـجـروب ⸃⤹*\n> *${usuario} غيّر إعدادات الجروب*\n> *الآن:* ${settings[m.newSetting]}`;
        await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak });
    }

    //━━━━━━━━━━━━━━━━━━━━━━━//
    // تحديث المشاركين (إضافة/حذف/ترقية/تنزيل)
    //━━━━━━━━━━━━━━━━━━━━━━━//
    const participantEvents = ['GROUP_PARTICIPANT_ADD','GROUP_PARTICIPANT_REMOVE','GROUP_PARTICIPANT_PROMOTE','GROUP_PARTICIPANT_DEMOTE'];
    if (participantEvents.includes(m.type) && chat.detect2) {
        for (let p of m.messageStubParameters) {
            let msg = '';
            switch (m.type) {
                case 'GROUP_PARTICIPANT_ADD':
                    msg = `*◞🎉‟⌝╎مـشـتـرك جـديـد ⸃⤹*\n> @${p.split('@')[0]} انضم إلى الجروب\n> بواسطة: ${usuario}`;
                    break;
                case 'GROUP_PARTICIPANT_REMOVE':
                    msg = `*◞💀‟⌝╎مـشـتـرك غـادر ⸃⤹*\n> @${p.split('@')[0]} تم إزالته\n> بواسطة: ${usuario}`;
                    break;
                case 'GROUP_PARTICIPANT_PROMOTE':
                    msg = `*◞👑‟⌝╎تـرقية مشرف ⸃⤹*\n> @${p.split('@')[0]} تم ترقيته\n> بواسطة: ${usuario}`;
                    break;
                case 'GROUP_PARTICIPANT_DEMOTE':
                    msg = `*◞⚰️‟⌝╎إزالة مشرف ⸃⤹*\n> @${p.split('@')[0]} تم تنزيله\n> بواسطة: ${usuario}`;
                    break;
            }
            await conn.sendMessage(m.chat, { text: msg, mentions: [usuario, p] }, { quoted: fkontak });
        }
    }
};

export default handler;