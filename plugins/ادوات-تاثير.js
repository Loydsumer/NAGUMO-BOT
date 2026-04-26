import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const effects = {
    1: { name: 'طبيعي', options: [] },
    2: { name: 'صدى', options: ['-af', 'aecho=0.8:0.9:1000:0.3'] },
    3: { name: 'تسريع', options: ['-filter:a', 'atempo=1.5'] },
    4: { name: 'إبطاء', options: ['-filter:a', 'atempo=0.5'] },
    5: { name: 'تردد', options: ['-af', 'areverb'] },
    6: { name: 'عكس', options: ['-filter_complex', 'areverse'] },
    7: { name: 'تضخيم', options: ['-filter:a', 'volume=1.5'] },
    8: { name: 'خفض الصوت', options: ['-filter:a', 'volume=0.5'] },
    9: { name: 'تردد مرتفع', options: ['-filter:a', 'asetrate=44100*1.5,aresample=44100'] },
    10: { name: 'تردد منخفض', options: ['-filter:a', 'asetrate=44100*0.5,aresample=44100'] },
    11: { name: 'الدبة', options: ['-af', 'bass=g=20'] },
    12: { name: 'عزل الموسيقى', options: ['-af', 'highpass=f=300,lowpass=f=3000'] },
    13: { name: 'عزل الصوت ويبقي الموسيقى', options: ['-af', 'highpass=f=0,lowpass=f=0'] },
    14: { name: 'تأثير الرجل الآلي', options: ['-filter:a', 'asetrate=44100*1.2,aresample=44100'] },
    15: { name: 'تأثير الطفل', options: ['-filter:a', 'asetrate=44100*1.5,aresample=44100'] },
    16: { name: 'تأثير رجل الفضاء', options: ['-af', 'aecho=0.9:0.9:1000:0.5,areverb'] },
    17: { name: 'تأثير الفتاة', options: ['-filter:a', 'asetrate=44100*1.3,aresample=44100'] },
    18: { name: 'تأثير السنجاب', options: ['-filter:a', 'asetrate=44100*1.6,aresample=44100'] },
    19: { name: 'تأثير اللهجة المغربية', options: ['-filter:a', 'asetrate=44100*2.1,aresample=44100'] }
};

let handler = async (m, { conn, text }) => {
    let q = m.quoted || m;
    let mime = (q.msg || q).mimetype || '';

    if (!m.quoted) return conn.reply(m.chat, 'قم برد على مقطع صوتياً.', m);

    let effectList = Object.entries(effects).map(([key, { name }]) => `${key}. ${name}`).join('\n');
    
    if (!text) {
        return conn.reply(m.chat, `اختر مؤثرًا باستخدام الرقم من القائمة:\n${effectList}`, m);
    }

    let effectNumber = parseInt(text.trim());
    
    if (!effects[effectNumber]) {
        return conn.reply(m.chat, 'رقم مؤثر غير صالح. حاول مرة أخرى.', m);
    }

    if (!/audio/.test(mime)) return conn.reply(m.chat, 'حدد ملف صوت فقط', m);

    let media = await q.download?.();

    if (!media) throw 'خطأ في تحميل الملف.';

    let inputFilePath = path.join(__dirname, 'input-audio.mp3');
    let outputFilePath = path.join(__dirname, 'output-audio.mp3');
    
    fs.writeFileSync(inputFilePath, media);

    let selectedEffect = effects[effectNumber].options;

    let { key } = await conn.sendMessage(m.chat, { text: `بدأت عملية تطبيق المؤثر "${effects[effectNumber].name}"...` }, { quoted: m });

    ffmpeg(inputFilePath)
        .outputOptions(selectedEffect)
        .output(outputFilePath)
        .on('progress', async (progress) => {
            await conn.sendMessage(m.chat, { text: `جاري معالجة الملف... ${Math.round(progress.percent)}%`, edit: key }, { quoted: m });
        })
        .on('end', async () => {
            await conn.sendMessage(m.chat, { text: 'تم تطبيق المؤثر بنجاح! يتم الآن إرساله...', edit: key }, { quoted: m });
let modifiedAudio = fs.readFileSync(outputFilePath);

// تحديد مدة الصوت لتكون مشابهة للميديا المسجلة
const audioStats = fs.statSync(outputFilePath);
const audioDuration = (audioStats.size / 1024 / 1024).toFixed(2); // تقريب الحجم (في MB) لمساعدتك في تحديد مدة تقريبية (استخدم الطريقة المناسبة للحصول على مدة الصوت الفعلية)

// إرسال الصوت كـ "ميديا مسجلة"
await conn.sendMessage(m.chat, { 
    audio: modifiedAudio, 
    mimetype: 'audio/mpeg', 
    fileName: 'output-audio.mp3', 
    ptt: true,  // "ptt" تعني "Push-to-Talk" أو الصوت المسجل
    caption: `📝 الصوت تم تسجيله. الحجم: ${audioDuration}MB`  // يمكنك إضافة تفاصيل مثل الحجم أو الوقت هنا
}, { quoted: m });

// حذف الملفات بعد إرسالها
fs.unlinkSync(inputFilePath);
fs.unlinkSync(outputFilePath);

        })
        .on('error', async (err) => {
            console.error(err);
            await conn.sendMessage(m.chat, { text: 'حدث خطأ أثناء تطبيق المؤثر.', edit: key }, { quoted: m });
        })
        .run();
};

handler.command = /^(تاثير)$/i;

export default handler;