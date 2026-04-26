import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

const timeout = 60000;

let handler = async (m, { conn, command }) => {
    if (command.startsWith('جوابي_')) {
        let id = m.chat;
        let as2al = conn.as2al[id];

        if (!as2al) {
            return conn.reply(m.chat, '*⎔ ⋅ ───━ •﹝🧩﹞• ━─── ⋅ ⎔*\n*_لا توجد لعبة نشطة الآن 📯📍_*\n*⎔ ⋅ ───━ •﹝🧩﹞• ━─── ⋅ ⎔*', m);
        }

        let selectedAnswerIndex = parseInt(command.split('_')[1]);
        if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 1 || selectedAnswerIndex > 4) {
            return conn.reply(m.chat, '*اختيار غير صالح ❌*', m);
        }

        let selectedAnswer = as2al.options[selectedAnswerIndex - 1];
        let isCorrect = as2al.correctAnswer === selectedAnswer;

        if (isCorrect) {
            await conn.reply(m.chat, `*✅ إجابة صحيحة مبروك!*\n*💰 الجائزة: 500xp*`, m);
            global.db.data.users[m.sender].exp += 500;
            clearTimeout(as2al.timer);
            delete conn.as2al[id];
        } else {
            as2al.attempts -= 1;
            if (as2al.attempts > 0) {
                await conn.reply(m.chat, `❌ إجابة خاطئة!\n📉 المحاولات المتبقية: ${as2al.attempts}`, m);
            } else {
                await conn.reply(m.chat, `😢 انتهت محاولاتك!\n✅ الإجابة الصحيحة كانت: 『${as2al.correctAnswer}』`, m);
                clearTimeout(as2al.timer);
                delete conn.as2al[id];
            }
        }
    } else {
        try {
            conn.as2al = conn.as2al || {};
            let id = m.chat;

            if (conn.as2al[id]) {
                return conn.reply(m.chat, '*⎔ ⋅ ───━ •﹝🧩﹞• ━─── ⋅ ⎔*\n*_لعبة قيد التشغيل بالفعل 🧠_*\n*⎔ ⋅ ───━ •﹝🧩﹞• ━─── ⋅ ⎔*', m);
            }

            // تحميل الألغاز من ملف riddles.json
            const riddlesPath = path.join('./plugins', 'riddles.json');
            const riddles = JSON.parse(fs.readFileSync(riddlesPath, 'utf8'));

            const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
            const { question, answer } = randomRiddle;

            // تجهيز 4 اختيارات (من بينها الصحيحة)
            let options = [answer];
            while (options.length < 4) {
                let randomOption = riddles[Math.floor(Math.random() * riddles.length)].answer;
                if (!options.includes(randomOption)) options.push(randomOption);
            }
            options.sort(() => Math.random() - 0.5);

            // تجهيز الصورة الافتراضية
            const media = await prepareWAMessageMedia({ image: { url: 'https://files.catbox.moe/lgphqf.jpg' } }, { upload: conn.waUploadToServer });

            // تجهيز الرسالة التفاعلية بنفس تنسيق الكود الأصلي
            const interactiveMessage = {
                body: {
                    text: `*⎔ ⋅ ───━ •﹝🧩﹞• ━─── ⋅ ⎔*\n*_لعبة الألغاز 🤔_*\n\n❓ *${question}*\n\n*⌝ معلومات اللعبة ⌞ ⇊*\n*🧠┊الوقت┊⇇『60 ثانية』*\n*💰┊الجائزة┊⇇『500xp』*\n*⎔ ⋅ ───━ •﹝🧩﹞• ━─── ⋅ ⎔*`,
                },
                footer: { text: 'BY : SKYLORD BOT' },
                header: {
                    title: 'ㅤ',
                    subtitle: 'اختر الإجابة الصحيحة 👇',
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage,
                },
                nativeFlowMessage: {
                    buttons: options.map((option, index) => ({
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: `┊${index + 1}┊⇇『${option}』`,
                            id: `.جوابي_${index + 1}`
                        })
                    })),
                },
            };

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: { message: { interactiveMessage } },
            }, { userJid: conn.user.jid, quoted: m });

            conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

            conn.as2al[id] = {
                correctAnswer: answer,
                options: options,
                timer: setTimeout(async () => {
                    if (conn.as2al[id]) {
                        await conn.reply(m.chat, `⏰ انتهى الوقت!\n✅ الإجابة الصحيحة: 『${answer}』`, m);
                        delete conn.as2al[id];
                    }
                }, timeout),
                attempts: 2
            };

        } catch (e) {
            console.error(e);
            conn.reply(m.chat, 'حدث خطأ أثناء تشغيل اللعبة.', m);
        }
    }
};

handler.help = ['اسأل'];
handler.tags = ['ألعاب'];
handler.command = /^(اسأل|جوابي_\d+)$/i;

export default handler;