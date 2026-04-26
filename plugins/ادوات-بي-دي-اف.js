import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let query = `📌 استخدم الأمر كالتالي:\nمثال: *.${command}* مرحبًا بالعالم\n<الأمر> <النص>`;
    let text;
    
    if (args.length >= 1) {
        text = args.join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else throw query;
    
    await m.reply('⏳ يتم إنشاء ملف PDF...');
    try {
        let pdf = await textToPDFBuffer(text);
        await conn.sendMessage(m.chat, {
            document: pdf,
            mimetype: "application/pdf",
            fileName: `المستند الخاص بـ ${m.name}.pdf`
        }, {
            quoted: m
        });
    } catch (e) {
        await m.reply('❌ حدث خطأ أثناء إنشاء الملف');
    }
};

handler.help = ['texttopdf', 'بي-دي-اف'];
handler.tags = ['tools'];
handler.command = /^(texttopdf|بي-دي-اف)$/i;
export default handler;

async function textToPDFBuffer(text) {
    return new Promise((resolve, reject) => {
        const buffers = [];
        const streamBuffer = new Writable({
            write(chunk, encoding, next) {
                buffers.push(chunk);
                next();
            },
        });

        const doc = new PDFDocument();

        doc.pipe(streamBuffer);
        doc.text(text);
        doc.end();

        streamBuffer.on('finish', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });

        streamBuffer.on('error', reject);
    });
}