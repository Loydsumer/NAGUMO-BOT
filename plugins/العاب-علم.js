import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const timeout = 60000;

let handler = async (m, { conn, command }) => {
    if (command.startsWith('اجاب_')) {
        let id = m.chat;
        let obito = conn.obito[id];

        if (!obito) {
            return conn.reply(m.chat, '*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*_لا توجد لعبة نشطة الان 📯📍_*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*', m);
        }

        let selectedAnswerIndex = parseInt(command.split('_')[1]);
        if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 1 || selectedAnswerIndex > 4) {
            return conn.reply(m.chat, '*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*_اختيار غير صالح يا اخي ❌_*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*', m);
        }

        let selectedAnswer = obito.options[selectedAnswerIndex - 1];
        let isCorrect = obito.correctAnswer === selectedAnswer;

        if (isCorrect) {
            await conn.reply(m.chat, `*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*_إجابة صحيحة مبروك 🧞‍♀️✅_*\n*💰┊الجائزة┊⇇『500xp』*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`, m);
            global.db.data.users[m.sender].exp += 500;
            clearTimeout(obito.timer);
            delete conn.obito[id];
        } else {
            obito.attempts -= 1;
            if (obito.attempts > 0) {
                await conn.reply(m.chat, `*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*_إجابة خاطئة يا اخي 🛠️❌_*\n*_عدد المحاولات التي باقية لك هي ${obito.attempts} 🙂📯_*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`, m);
            } else {
                await conn.reply(m.chat, `*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*_إجابة خاطئة 😢_*\n*_انتهت محاولاتك 📯📍_*\n*🧞‍♀️┊الإجابة الصحيحة┊⇇『${obito.correctAnswer}』*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`, m);
                clearTimeout(obito.timer);
                delete conn.obito[id];
            }
        }
    } else {
        try {
            conn.obito = conn.obito || {};
            let id = m.chat;

            if (conn.obito[id]) {
                return conn.reply(m.chat, '*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*_لا يمكن لك بدأ لعبة جديد وعلما انك بدأت لعبة ولم تنتهي ❌🧞‍♀️_*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*', m);
            }

            const response = await fetch('https://raw.githubusercontent.com/ze819/game/master/src/game.js/luffy1.json');//هنا رابط الجيت الاسئله
            const obitoData = await response.json();

            if (!obitoData) {
                throw new Error('*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*فشل الحصول على المعلومات كلم اوبيتو*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*');
            }

            const obitoItem = obitoData[Math.floor(Math.random() * obitoData.length)];
            const { img, name } = obitoItem;

            let options = [name];
            while (options.length < 4) {
                let randomItem = obitoData[Math.floor(Math.random() * obitoData.length)].name;
                if (!options.includes(randomItem)) {
                    options.push(randomItem);
                }
            }
            options.sort(() => Math.random() - 0.5);

            const media = await prepareWAMessageMedia({ image: { url: img } }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                body: {
                    text: `*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*_لعبة تعرف على اسم علم الدولة🇲🇦_*\n\n*⌝ معلومات العبة ┋🪄⌞ ⇊*\n*🧞‍♀️┊الوقت┊⇇『60.00 ثانية』*\n*🧞‍♀️┊الجائزة┊⇇『500xp』*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`,
                },
                footer: { text: 'BY : obito' },
                header: {
                    title: 'ㅤ',
                    subtitle: 'المرجو اختيار اسم لاعب من هذه الاختيارات ⇊',
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage,
                },
                nativeFlowMessage: {
                    buttons: options.map((option, index) => ({
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: `┊${index + 1}┊⇇『${option}』`,
                            id: `.اجاب_${index + 1}`
                        })
                    })),
                },
            };

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: { interactiveMessage },
                },
            }, { userJid: conn.user.jid, quoted: m });

            conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

            conn.obito[id] = {
                correctAnswer: name,
                options: options,
                timer: setTimeout(async () => {
                    if (conn.obito[id]) {
                        await conn.reply(m.chat, `*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*⌛┊⇇ انتهى الوقت*\n*🧞‍♀️┊الإجابة الصحيحة┊⇇『${name}』*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`, m);
                        delete conn.obito[id];
                    }
                }, timeout),
                attempts: 2
            };

        } catch (e) {
            console.error(e);
            conn.reply(m.chat, 'حدث خطأ في إرسال الرسالة.', m);
        }
    }
};

handler.help = ['اوبيتو'];
handler.tags = ['اوبيتو'];
handler.command = /^(علم|اعلام|اجاب_\d+)$/i;

export default handler;