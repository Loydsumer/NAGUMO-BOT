function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms % 3600000 / 60000);
    let s = Math.floor(ms % 60000 / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;

const handler = async (m, { conn, usedPrefix }) => {
    try {
        let user = global.db.data.users[m.sender];
        if (!user) {
            return await conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 لم يتم العثور على بيانات المستخدم\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 جاري تسجيلك في النظام...\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m);
        }
        
        let name = conn.getName(m.sender);
        let { bank = 0, exp = 0, health = 1000 } = user;
        
        let wealth = '🪙 *مفلس* 😭';
        if (bank > 3000) wealth = '💼 *فقير* 😞';
        if (bank > 6000) wealth = '🧑‍💼 *موظف حكومي*';
        if (bank > 100000) wealth = '🤴🏼 *رجل أعمال*';
        if (bank > 1000000) wealth = '💸 *غني*';
        if (bank > 10000000) wealth = '🤑 *مليونير*';
        if (bank > 1000000000) wealth = '💰 *ملياردير*';

        let response = `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮
          ˏˋ°•*⁀➷ 🏦 𝐁𝐀𝐍𝐊 𝐈𝐍𝐅𝐎
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🔥 الاسم: ${name}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💰 الرصيد: ${bank.toLocaleString()} دولار
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🎖 الثروة: ${wealth}
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ❤️ الصحة: ${health}/1000
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ✨ الخبرة: ${exp.toLocaleString()} XP
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📜 نصائح مالية:
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🏦 اكتب ⟪ .إيداع ⟫ للإيداع
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 💸 اكتب ⟪ .سحب ⟫ للسحب
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 📈 اكتب ⟪ .عمل ⟫ للعمل
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👑 المطور: DΣMΘΠ ØF SΘLITUDΣ
├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 البوت: ZΘFΛΠ BΘƬ
♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`;

        const videoUrl = 'https://files.catbox.moe/bgmp5f.mp4'; 

        // تحضير الفيديو
        const videoMessage = await prepareWAMessageMedia(
            { 
                video: { 
                    url: videoUrl 
                } 
            }, 
            { 
                upload: conn.waUploadToServer 
            }, 
            { 
                quoted: m 
            }
        );

        await conn.relayMessage(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { 
                            hasMediaAttachment: true,
                            ...videoMessage
                        },
                        body: { 
                            text: response, 
                            subtitle: "🏦 ZΘFΛΠ BΘƬ BANK" 
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        "display_text": "💰 الـبـنـك",
                                        "id": `${usedPrefix}بنك`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        "display_text": "🏆 الـمـسـتـوى", 
                                        "id": `${usedPrefix}لفل`
                                    })
                                },
                                {
                                    name: "quick_reply", 
                                    buttonParamsJson: JSON.stringify({
                                        "display_text": "💳 مـحـفـظـتـي",
                                        "id": `${usedPrefix}محفظة`
                                    })
                                }
                            ]
                        },
                        messageParamsJson: JSON.stringify({
                            "bot_name": "ZΘFΛΠ BΘƬ",
                            "developer": "DΣMΘΠ ØF SΘLITUDΣ"
                        })
                    }
                }
            }
        }, {});

    } catch (error) {
        console.error('❌ خطأ في أمر البنك:', error);
        await conn.reply(m.chat, `♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╮\n          ˏˋ°•*⁀➷ ❌ 𝐄𝐑𝐑𝐎𝐑\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙┤\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 🐉 حدث خطأ في عرض معلومات البنك\n├ׁ̟̇˚₊· ͟͟͞͞➳❥ 👻 الرجاء المحاولة مرة أخرى\n♡⃘̥·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙·̩͙♡⃘̥̊·̩͙┈̩̩̥͙♡̷̷̷┈̩̩̥͙╯`, m);
    }
}

handler.help = ['البنك', 'بنك'];
handler.tags = ['store'];
handler.command = ['البنك', 'بنك', 'bank'];

export default handler;