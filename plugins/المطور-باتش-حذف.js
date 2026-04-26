import cp, { exec as _exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const exec = promisify(_exec).bind(cp);
const basePath = 'plugins';

// قائمة الأرقام المسموح لها بالتنفيذ
const allowedNumbers = [
    '201226033056@s.whatsapp.net', // الرقم الأول
    '201115546207@s.whatsapp.net'  // الرقم الثاني
];

// حذف ملف معين
let deleteFile = async (filename) => {
    let filePath = path.join(basePath, filename);

    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (err) {
        throw new Error(`الملف ${filename} غير موجود.`);
    }

    try {
        await fs.promises.unlink(filePath);
        return `✅ تم حذف الملف: ${filename}`;
    } catch (err) {
        throw new Error(`فشل في حذف الملف ${filename}: ${err.message}`);
    }
};

// قراءة الملفات في المجلد
const listFilesInDirectory = async () => {
    try {
        const files = await fs.promises.readdir(basePath);
        return files.filter((file) => file.endsWith('.js'));
    } catch (err) {
        throw new Error('فشل في قراءة محتويات المجلد plugins.');
    }
};

const handler = async (m, { conn, text }) => {
    if (!allowedNumbers.includes(m.sender)) {
        await conn.sendMessage(m.chat, { text: `🛑 ليس لديك صلاحية حذف الأكواد.` }, { quoted: m });
        return;
    }

    try {
        const files = await listFilesInDirectory();

        if (!text) {
            if (files.length === 0) {
                m.reply('📂 المجلد plugins فارغ.');
                return;
            }

            const fileList = files
                .map((file, index) => `${index + 1}. ${file}`)
                .join('\n');
            m.reply(`📂 عدد الملفات: ${files.length}\n\n${fileList}\n\n🗑️ اختر ملفًا للحذف باستخدام رقمه.`);
            return;
        }

        const index = parseInt(text.trim()) - 1;
        if (isNaN(index) || index < 0 || index >= files.length) {
            m.reply('❌ الرقم غير صحيح. اختر رقمًا من القائمة.');
            return;
        }

        const filename = files[index];
        const result = await deleteFile(filename);
        m.reply(result);
    } catch (e) {
        console.error(e.message);
        m.reply(`❌ حدث خطأ: ${e.message}`);
    }
};

handler.help = ['deleteplugin'];
handler.tags = ['owner'];
handler.command = /^(deleteplugin|حذف-كود|gb|باتش-حذف)$/i;
handler.rowner = true;

export default handler;