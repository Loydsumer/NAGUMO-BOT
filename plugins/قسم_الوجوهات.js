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
    let message = `╮••─๋︩︪──๋︩︪─═⊐‹﷽›⊏═─๋︩︪──๋︩︪─┈☇
╿↵ مرحــبـا ⌊${mentionId.split('@')[0]}⌉
── • ◈ • ──
*⌝🍃┊قـائـمـة لـوجـو┊🍃⌞* 
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈ ─๋︩︪─ ∙ ∙ ⊰ـ
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇ـ
│┊ ۬.͜ـ🎨˖ ⟨نص_مشوه الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نص_على_زجاج الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨توهج_متقدم الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نص_طباعي الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨تكسير_بكسل الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨توهج_نيون الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨علم_نيجيريا الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨علم_أمريكا الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نص_ممحو الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨بلاك_بنك الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نص_متوهج الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نص_تحت_الماء الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨صانع_شعار الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨رسوم_كرتونية الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨ورق_مقطع الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨ألوان_مائية الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨سحب الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨شعار_بلاك_بنك الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨تدرج_لوني الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨شاطئ الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨ذهب الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نيون_ملون الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨رمل الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨مجرة الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نمط_1917 الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نيون_مجرة الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨ملكي الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨هولوغرام الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨مجرة_شعار الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨أمونج_أس الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨مطر الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨غرافيتي الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨ألوان_زاهية الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨ميزان_موسيقي الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨ناروتو الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨أجنحة الاسم☇
│┊ ۬.͜ـ🎨˖ ⟨نجوم الاسم☇
│┊ ۬.͜ـ😎˖ ⟨❤️ شعار_قلب☇
│┊ ۬.͜ـ🎄˖ ⟨شعار_الكريسماس☇
│┊ ۬.͜ـ💑˖ ⟨شعار_زوجين☇
│┊ ۬.͜ـ⚡˖ ⟨شعار_جلتش☇
│┊ ۬.͜ـ😢˖ ⟨شعار_حزين☇
│┊ ۬.͜ـ🎮˖ ⟨شعار_جيمنج☇
│┊ ۬.͜ـ👤˖ ⟨شعار_وحيد☇
│┊ ۬.͜ـ🐲˖ ⟨شعار_دراغون_بول☇
│┊ ۬.͜ـ🔮˖ ⟨شعار_نيون☇
│┊ ۬.͜ـ🐱˖ ⟨شعار_قطتي☇
│┊ ۬.͜ـ👧🎮˖ ⟨شعار_فتاة_جيمر☇
│┊ ۬.͜ـ🍥˖ ⟨شعار_ناروتو☇
│┊ ۬.͜ـ🤖˖ ⟨شعار_مستقبلي☇
│┊ ۬.͜ـ☁️˖ ⟨شعار_سحاب☇
│┊ ۬.͜ـ👼˖ ⟨شعار_ملاك☇
│┊ ۬.͜ـ🌌˖ ⟨شعار_سماء☇
│┊ ۬.͜ـ🎨˖ ⟨شعار_جرافيتي_ثلاثي☇
│┊ ۬.͜ـ🧪˖ ⟨شعار_ماتريكس☇
│┊ ۬.͜ـ👹˖ ⟨شعار_رعب☇
│┊ ۬.͜ـ🪽˖ ⟨شعار_أجنحة☇
│┊ ۬.͜ـ🪖˖ ⟨شعار_جيش☇
│┊ ۬.͜ـ🔫˖ ⟨شعار_ببجي☇
│┊ ۬.͜ـ👧🔫˖ ⟨شعار_ببجي_بناتي☇
│┊ ۬.͜ـ😂˖ ⟨شعار_لول☇
│┊ ۬.͜ـ👽˖ ⟨شعار_امونج_اس☇
│┊ ۬.͜ـ📹˖ ⟨فيديو_شعار_ببجي☇
│┊ ۬.͜ـ🐅🎞️˖ ⟨فيديو_شعار_نمر☇
│┊ ۬.͜ـ🎬˖ ⟨فيديو_مقدمة☇
│┊ ۬.͜ـ🕹️🎞️˖ ⟨فيديو_شعار_جيمنج☇
│┊ ۬.͜ـ⚔️˖ ⟨شعار_محارب☇
│┊ ۬.͜ـ🖼️˖ ⟨غلاف_لاعب☇
│┊ ۬.͜ـ🔥🖼️˖ ⟨غلاف_فري_فاير☇
│┊ ۬.͜ـ🔫🖼️˖ ⟨غلاف_ببجي☇
│┊ ۬.͜ـ🎯🖼️˖ ⟨غلاف_كونتر☇
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇ـ
╯─ׅ ─๋︩︪─┈ ─๋︩︪─═⊐‹⚠️›⊏═┈ ─๋︩︪─ ∙ ∙ ⊰ـ
> ⏤̛̣̣̣̣̣̣̣̣̣̣̣͟͟͞͞⏤͟͟͞͞🍭𝐅υׁׅ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭`;

    const emojiReaction = '⬇️';

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

handler.command = /^(قسم_maker)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;