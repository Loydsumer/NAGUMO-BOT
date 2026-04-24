import fs from 'fs';
import axios from 'axios';

let handler = async (m, { conn }) => {
    // الحصول على معرف المنشن بنفس طريقة كود القائمة
    let mentionId = m.key.participant || m.key.remoteJid;

    // قراءة ملف روابط الصور
    const linksFile = './media-links.txt';
    if (!fs.existsSync(linksFile)) return await m.reply('⚠️ ملف روابط الصور غير موجود.');
    const links = fs.readFileSync(linksFile, 'utf-8').split('\n').filter(Boolean);
    if (!links.length) return await m.reply('⚠️ ملف روابط الصور فارغ.');

    // اختيار صورة كبيرة وعشوائية
    const randomIndex = Math.floor(Math.random() * links.length);
    const imageUrl = links[randomIndex];

    // اختيار صورة مصغرة مختلفة
    let thumbUrl;
    if (links.length === 1) {
        thumbUrl = imageUrl;
    } else {
        let thumbIndex;
        do {
            thumbIndex = Math.floor(Math.random() * links.length);
        } while (thumbIndex === randomIndex);
        thumbUrl = links[thumbIndex];
    }

    // تحميل الصورة المصغرة إلى Buffer
    let thumbnailBuffer;
    try {
        const resp = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
        thumbnailBuffer = Buffer.from(resp.data, 'binary');
    } catch {
        thumbnailBuffer = null;
    }

    // vCard كما هي
    const vcard = `
BEGIN:VCARD
VERSION:3.0
TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}
END:VCARD
`.trim();

    const contactInfo = {
        key: { fromMe: false, participant: m.sender, remoteJid: 'status@broadcast@g.us', id: 'Halo' },
        message: { contactMessage: { displayName: '@' + mentionId.split('@')[0], vcard } },
        participant: m.sender
    };

    // الرسالة المزخرفة مع المنشن بالطريقة الجديدة
    let message = `◞🧠‟⌝╎مرحبـا: @${mentionId.split('@')[0]}\n❀⃘⃛͜ ۪۪۪݃𓉘᳟ี ⃞̸͢𑁃 ̚𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦┄꯭๋━┄꫶︦┄꯭๋━┄꫶︦┄꯭๋━┄꯭๋━┄꫶︦╮
          ├ׁ̟̇˚₊· ͟͟͞͞➳❥group_section 
❀⃘⃛͜ ۪۪۪݃𓉘᳟ี ⃞̸͢𑁃 ̚𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦┄꯭๋━┄꫶︦┄꯭๋━┄꫶︦┄꯭๋━┄꯭๋━┄꫶︦┤
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜اعفاء◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜مضاد_الاباحه◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜ترقيه◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜مخفي◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜الغاء_الانذار◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜انذار◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜منشن◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜الانذارات◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜طرد◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜ضيف◞*
ㅤ ⃝⃘︢︣֟፝🍏ᩫํ᪶ :  ⇢ *◜جروب◞*
𓉘᳟ี ⃞̸͢𑁃 ̚𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦┄꯭๋━┄꫶︦┄꯭๋━┄꫶︦━┄꫶︦┄꯭๋━┄꯭๋━┄꫶︦╯
> ⏤̛̣̣̣̣̣̣̣̣̣̣̣͟͟͞͞⏤͟͟͞͞🍭𝐅υׁׅ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭`;

    const emojiReaction = '🧑‍🧒‍🧒';

    try {
        // إرسال الريأكشن
        await conn.sendMessage(m.chat, { react: { text: emojiReaction, key: m.key } });

        // إرسال الصورة الكبيرة مع الرسالة المزخرفة وvCard وthumbnail مع زر mediaUrl
        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: message,
            mentions: [m.sender], // المنشن
            contextInfo: {
                mentionedJid: [m.sender], // ← نفس طريقة القائمة
                externalAdReply: {
                    title: '⏤͟͞ू⃪ 𝐅υׁׅ𝐫𝐢𝐧𝐚-𝐁ׅ𝗼𝐭🌸⃝𖤐',
                    body: '@' + mentionId.split('@')[0],
                    thumbnail: thumbnailBuffer,
                    mediaType: 2, // رابط خارجي
                    mediaUrl: 'https://whatsapp.com/channel/0029Vb6Zrqe9WtCDGD6Sf81O',
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: contactInfo });

    } catch (error) {
        console.error("Error sending message:", error);
        await conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء إرسال الصورة.' });
    }
};

handler.command = /^(قسم_group)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;