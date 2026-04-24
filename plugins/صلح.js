import { readdirSync, unlinkSync, existsSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { prepareWAMessageMedia } from '@whiskeysockets/baileys';
import fs from 'fs';

const handler = async (m, { conn, usedPrefix, text }) => {
    if (global.conn.user.jid !== conn.user.jid) {
        return conn.sendMessage(m.chat, { text: '[❗] استخدم هذا الأمر في العدد الرئيسي للروبوت فقط!' }, { quoted: m });
    }

    const sessionPath = 'BotSession';
    const databaseFile = 'Database.json';
    const pluginsFolder = './plugins';
    let filesDeleted = 0;
    const imagePath = './media/menus/img1.jpg';

    if (!text) {
        const fake = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                conversation: 'اختر نوع الصيانة'
            },
            participant: '0@s.whatsapp.net'
        };

        const message = `*✨ اختر نوع الصيانة التي تريدها:*`;

        const buttons = [
            { buttonId: `${usedPrefix}صلح جلسة`, buttonText: { displayText: '🗑️ تنظيف الجلسة' }, type: 1 },
            { buttonId: `${usedPrefix}صلح داتا`, buttonText: { displayText: '🗄️ تنظيف قاعدة البيانات' }, type: 1 },
            { buttonId: `${usedPrefix} تنظيف`, buttonText: { displayText: '⚠️  تنظيف الملفات غير ضرورية  ' }, type: 1 }
        ];

        const buttonMessage = {
            [fs.existsSync(imagePath) ? 'image' : 'text']: fs.existsSync(imagePath) ? { url: imagePath } : message,
            caption: fs.existsSync(imagePath) ? message : undefined,
            footer: '𝑀𝐼𝐾𝐸𝑌 𝐵𝛩𝑇 ✨',
            buttons: buttons,
            headerType: 4,
            viewOnce: true
        };

        await conn.sendMessage(m.chat, buttonMessage, { quoted: fake });
        return;
    }

    try {
        text = text.toLowerCase();

        if (text === 'داتا') {
            if (m.sender !== global.owner[0][0] + "@s.whatsapp.net") {
                return conn.sendMessage(m.chat, { text: '❌ هذه العملية متاحة فقط للمطور!' }, { quoted: m });
            }
            if (existsSync(databaseFile)) {
                writeFileSync(databaseFile, '{}', 'utf8');
            }
            await conn.sendMessage(m.chat, { text: '*✅ تم تنظيف "Database.json" بنجاح!*' }, { quoted: m });

        } else if (text === 'جلسة') {
            if (existsSync(sessionPath)) {
                const files = readdirSync(sessionPath);
                for (const file of files) {
                    if (!file.includes('creds.json')) {
                        unlinkSync(path.join(sessionPath, file));
                        filesDeleted++;
                    }
                }
            }
            await conn.sendMessage(m.chat, { text: `*✅ تم حذف [ ${filesDeleted} ] ملف من الجلسة بنجاح!*` }, { quoted: m });

        } else if (text === 'اخطاء') {
            if (!existsSync(pluginsFolder)) {
                return conn.sendMessage(m.chat, { text: '❌ لم يتم العثور على مجلد البلوجن!' }, { quoted: m });
            }

            let errors = [];
            const files = readdirSync(pluginsFolder).filter(file => file.endsWith('.js'));
            for (const file of files) {
                try {
                    const filePath = path.join(pluginsFolder, file);
                    const content = readFileSync(filePath, 'utf8');
                    new Function(content); // تجربة تحليل الكود بدون تنفيذ
                } catch (err) {
                    errors.push(`🔹 *${file}*: ${err.message}`);
                }
            }

            if (errors.length === 0) {
                await conn.sendMessage(m.chat, { text: '✅ لا يوجد أخطاء في ملفات البلوجن!' }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { text: `⚠️ تم العثور على بعض الأخطاء:\n\n${errors.join("\n")}` }, { quoted: m });
            }
        } else {
            await conn.sendMessage(m.chat, { text: '❌ خيار غير صحيح! استخدم: "صلح جلسة" أو "صلح داتا" أو "صلح اخطاء".' }, { quoted: m });
        }
    } catch (err) {
        console.error('❗ خطأ أثناء تنفيذ الأمر:', err);
        await conn.sendMessage(m.chat, { text: '[❗] حدث خطأ أثناء التنفيذ!' }, { quoted: m });
    }
};

handler.help = ['cleanup'];
handler.tags = ['system'];
handler.command = /^(صلح|ds)$/i;

export default handler;