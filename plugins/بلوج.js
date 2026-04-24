import fs from 'fs'; import path from 'path'; import { exec } from 'child_process';

const handler = async (m, { conn }) => { try { const pluginsFolderPath = path.join(process.cwd(), 'plugins'); const zipFilePath = path.join(process.cwd(), 'plugins.zip');

// إرسال رسالة تفيد ببدء العملية
    let initialMessage = await conn.sendMessage(m.chat, { text: `📂 جاري ضغط ملفات البلوجن...` }, { quoted: m });

    // التحقق من وجود مجلد البلوجن
    if (!fs.existsSync(pluginsFolderPath)) {
        await conn.sendMessage(m.chat, { text: `❌ مجلد البلوجن غير موجود!`, edit: initialMessage.key }, { quoted: m });
        return;
    }

    // تنفيذ أمر ضغط المجلد إلى ملف ZIP
    const zipCommand = `zip -r "${zipFilePath}" plugins`;
    exec(zipCommand, async (error, stdout, stderr) => {
        if (error) {
            await conn.sendMessage(m.chat, { text: `❌ خطأ أثناء ضغط الملفات: ${error.message}`, edit: initialMessage.key }, { quoted: m });
            return;
        }

        // إرسال الملف المضغوط
        let sendingMessage = await conn.sendMessage(m.chat, { text: `✅ تم ضغط الملفات بنجاح. يتم الآن إرسال الملف...`, edit: initialMessage.key }, { quoted: m });
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(zipFilePath),
            mimetype: 'application/zip',
            fileName: 'plugins.zip'
        }, { quoted: m });

        // حذف الملف بعد الإرسال
        fs.unlink(zipFilePath, async (err) => {
            if (!err) {
                await conn.sendMessage(m.chat, { text: `🗑️ تم حذف ملف ZIP بعد الإرسال.`, edit: sendingMessage.key }, { quoted: m });
            }
        });
    });
} catch (err) {
    await conn.sendMessage(m.chat, { text: `❌ فشل في معالجة ملفات البلوجن: ${err.message}` }, { quoted: m });
}

};

handler.help = ['بلوج']; handler.tags = ['owner']; handler.command = /^بلوج$/i; handler.rowner = true;

export default handler;