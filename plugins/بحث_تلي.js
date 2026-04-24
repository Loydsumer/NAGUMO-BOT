import axios from 'axios';
import cheerio from 'cheerio';
import baileys from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = baileys;

let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, '❌ رجاءً أدخل كلمة البحث');

    try {
        const searchUrl = `https://t.me/s/${encodeURIComponent(text)}`;
        const { data, headers: pageHeaders } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept-Language': 'ar,en;q=0.9'
            }
        });

        // توليد cookies ديناميكي من headers
        const cookies = pageHeaders["set-cookie"]
            ? pageHeaders["set-cookie"].map((c) => c.split(";")[0]).join("; ")
            : "";

        const $ = cheerio.load(data);
        let results = [];

        $('div.tgme_widget_message_wrap').each((i, el) => {
            if(i >= 20) return; // عرض أول 20 نتيجة بدل 5
            const channelName = $(el).find('a.tgme_widget_message_owner_name').text() || 'غير متوفر';
            const username = $(el).find('a.tgme_widget_message_owner_name').attr('href')?.split('/').pop() || 'غير متوفر';
            const description = $(el).find('div.tgme_widget_message_text').text() || 'لا يوجد وصف';
            const thumbnail = $(el).find('img').attr('src') || '';

            results.push({
                title: channelName,
                rowId: `#telyinfo ${username}`,
                description: description.substring(0, 50) + '...', 
                thumbnail
            });
        });

        if(!results.length) return conn.reply(m.chat, '❌ لم أتمكن من إيجاد نتائج لبحثك.');

        const listMessage = {
            text: `📌 نتائج البحث عن: ${text}`,
            footer: 'اختر أي قناة لمعرفة معلوماتها',
            title: 'بحث تيليجرام',
            buttonText: 'عرض النتائج',
            sections: [{
                title: 'قنوات ومجموعات',
                rows: results
            }]
        };

        await conn.sendMessage(m.chat, listMessage);

    } catch (err) {
        console.log(err);
        conn.reply(m.chat, '❌ حدث خطأ أثناء البحث.');
    }
};

// handler للضغط على أي قناة
let infoHandler = async (m, { conn, text }) => {
    if(!text) return;
    try {
        const username = text.trim();
        const url = `https://t.me/${username}`;

        // جلب الصفحة مع استخدام cookies الديناميكي
        const { data, headers } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept-Language': 'ar,en;q=0.9',
                'Cookie': headers?.["set-cookie"]
                    ? headers["set-cookie"].map((c) => c.split(";")[0]).join("; ")
                    : 'sessionid=1234567890; path=/;'
            }
        });

        const $ = cheerio.load(data);
        const channelName = $('div.tgme_channel_info_header_title span').text() || 'غير متوفر';
        const description = $('div.tgme_channel_info_description').text() || 'لا يوجد وصف';
        const subscribers = $('div.tgme_channel_info_counter span.counter_value').first().text() || 'غير معروف';
        const thumbnail = $('div.tgme_page_photo_image img').attr('src') || '';

        const message = `
📌 اسم القناة: ${channelName}
👤 يوزر القناة: @${username}
🔗 رابط القناة: https://t.me/${username}
📝 الوصف: ${description}
👥 المشتركين: ${subscribers}
`;

        await conn.sendMessage(m.chat, {
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: channelName,
                    body: description,
                    thumbnailUrl: thumbnail,
                    mediaUrl: `https://t.me/${username}`
                }
            }
        });

    } catch(err) {
        console.log(err);
        conn.reply(m.chat, '❌ لم أتمكن من جلب معلومات القناة.');
    }
};

// أوامر البحث وعرض المعلومات
handler.command = ['بحث_تلي'];
infoHandler.command = ['telyinfo'];

export default [handler, infoHandler];