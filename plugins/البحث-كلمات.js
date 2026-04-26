/**
 * 🤖 *مساعد بوت لجلب كلمات الأغاني* 🤖
 * 🌍 المصدر: https://whatsapp.com/channel/0029Vb5Vczr7j6g3foFrXM2x
 * ✍️ تم التعديل بواسطة: 𝒁𝑶𝑹𝑶 𝑩𝑶𝑻 𝚅¹🤖
 */

import cheerio from "cheerio";

async function جلب_كلمات(الأغنية) {
    try {
        const response = await fetch(`https://r.jina.ai/https://www.google.com/search?q=كلمات+اغنية+${encodeURIComponent(الأغنية)}&hl=ar`, {
            headers: {
                'x-return-format': 'html',
                'x-engine': 'cf-browser-rendering',
            }
        });

        const text = await response.text();
        const $ = cheerio.load(text);
        const كلمات = [];
        const بيانات = [];
        const النتيجة = {};

        // استخراج البيانات الإضافية
        $('div.PZPZlf').each((i, e) => {
            const بيانات_مكتشفة = $(e).find('div[jsname="U8S5sf"]').text().trim();
            if (!بيانات_مكتشفة) بيانات.push($(e).text().trim());
        });

        // استخراج كلمات الأغنية
        $('div[jsname="U8S5sf"]').each((i, el) => {
            let سطور = '';
            $(el).find('span[jsname="YS01Ge"]').each((j, span) => {
                سطور += $(span).text() + '\n';
            });
            كلمات.push(سطور.trim());
        });

        النتيجة.الكلمات = كلمات.join('\n\n');
        النتيجة.العنوان = بيانات.shift();
        النتيجة.المغني = بيانات.shift();
        النتيجة.المنصات = بيانات.filter(_ => !_.includes(':'));

        بيانات.forEach(بيان => {
            if (بيان.includes(':')) {
                const [الاسم, القيمة] = بيان.split(':');
                النتيجة[الاسم.toLowerCase()] = القيمة.trim();
            }
        });

        return النتيجة;
    } catch (error) {
        return { خطأ: error.message };
    }
}

const معالج = async (m, { text, usedPrefix, command }) => {
    if (!text) {
        let رسالة_توضيحية = `🤖 *كيفية استخدام الأمر ${command}:*\n\n` +
            `🔹 *الوصف:* هذا الأمر يبحث عن كلمات الأغاني عبر الإنترنت.\n` +
            `📝 *الاستخدام:* \n` +
            `✦ ${usedPrefix + command} [اسم الأغنية]\n\n` +
            `🎭 *أمثلة:*\n` +
            `✦ ${usedPrefix + command} someone like you\n` +
            `✦ ${usedPrefix + command} بيلا تشاو\n\n` +
            `📌 *ملاحظة:* تأكد من كتابة اسم الأغنية بشكل صحيح.\n\n` +
            `𝒁𝑶𝑹𝑶 𝑩𝑶𝑻 𝚅¹🤖`;

        return m.reply(رسالة_توضيحية);
    }

    m.reply('🤖 *جارٍ البحث عن كلمات الأغنية...*');

    try {
        const النتيجة = await جلب_كلمات(text);

        if (!النتيجة.الكلمات) return m.reply('🤖 *لم يتم العثور على كلمات الأغنية! حاول مرة أخرى بعنوان مختلف.*');

        let رد = `🎵 *عنوان الأغنية:* ${النتيجة.العنوان || 'غير معروف'} 🎵\n`;
        رد += النتيجة.المغني ? `🎤 *المغني:* ${النتيجة.المغني}\n\n` : '\n';
        رد += `📜 *كلمات الأغنية:*\n${النتيجة.الكلمات}\n\n`;
        رد += `𝒁𝑶𝑹𝑶 𝑩𝑶𝑻 𝚅¹🤖`;

        m.reply(رد);
    } catch (error) {
        console.error(error);
        m.reply('🤖 *حدث خطأ أثناء البحث عن كلمات الأغنية! حاول مرة أخرى لاحقًا.*');
    }
};

// 🤖 **إضافة الأوامر العربية والإنجليزية**
معالج.help = ['كلمات', 'lirik', 'lyrics', 'searchlirik'];
معالج.tags = ['music', 'موسيقى'];
معالج.command = /^(كلمات|lirik|lyrics|searchlirik)$/i;

export default معالج;