import axios from 'axios';
import fs from 'fs';
import cheerio from 'cheerio';

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, '⎔ ⋅ ───━ •﹝🧞﹞• ━─── ⋅ ⎔\nالمرجو تقديم بعد الامر يوزر المستخدم تليجرام او كلمة للبحث\n*⎔ ⋅ ───━ •﹝🧞﹞• ━─── ⋅ ⎔*', m);
    }

    // اذا النص يحتوي @ نعتبره يوزر
    if (text.includes('@')) {
        const username = text.replace('@', '').trim();
        const apiUrl = `https://t.me/${username}`;

        await conn.reply(m.chat, '🔄 جاري جلب معلومات الحساب...', m);

        try {
            const response = await axios.get(apiUrl);
            const pageContent = response.data;

            const nameMatch = pageContent.match(/property="og:title" content="(.*)"/);
            const bioMatch = pageContent.match(/property="og:description" content="(.*)"/);
            const photoMatch = pageContent.match(/property="og:image" content="(.*)"/);

            if (!nameMatch || !bioMatch || !photoMatch) {
                return conn.reply(m.chat, '❌ لم يتم العثور على معلومات الحساب', m);
            }

            const userInfo = {
                username: `@${username}`,
                name: nameMatch[1],
                bio: bioMatch[1],
                photo: photoMatch[1],
            };

            const photoResponse = await axios({ url: userInfo.photo, method: 'GET', responseType: 'arraybuffer' });
            const photoPath = './temp-photo.jpg';
            fs.writeFileSync(photoPath, photoResponse.data);

            await conn.sendMessage(m.chat, {
                image: fs.readFileSync(photoPath),
                caption: `*⎔ ⋅ ───━ •﹝🧞﹞• ━─── ⋅ ⎔*\n\n🔱┊المستخدم┊⇇『${userInfo.username}』\n🌐┊الاسم┊⇇『${userInfo.name}』\n💎┊الوصف┊⇇『${userInfo.bio}』\n⎔ ⋅ ───━ •﹝🧞﹞• ━─── ⋅ ⎔`,
            });

            fs.unlinkSync(photoPath);

        } catch (error) {
            console.error('❌ خطأ أثناء جلب معلومات الحساب:', error.message);
            conn.reply(m.chat, '❌ حدث خطأ أثناء محاولة جلب معلومات الحساب.', m);
        }

    } else {
        // لو النص بحث عن شيء
        const query = text.trim();
        await conn.reply(m.chat, `🔄 جاري البحث عن القنوات والجروبات المتعلقة بـ: ${query}`, m);

        try {
            const searchUrl = `https://t.me/s/${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl);
            const $ = cheerio.load(response.data);

            // نجلب أول 5 نتائج
            const results = [];
            $('div.tgme_channel_info').slice(0, 5).each((i, el) => {
                const title = $(el).find('a.tgme_channel_title').text().trim();
                const link = 'https://t.me/' + $(el).find('a.tgme_channel_link').attr('href');
                const description = $(el).find('div.tgme_channel_description').text().trim();
                results.push({ title, description, link });
            });

            if (results.length === 0) {
                return conn.reply(m.chat, '❌ لم يتم العثور على أي قنوات أو جروبات', m);
            }

            const sections = [
                {
                    title: `نتائج البحث عن: ${query}`,
                    rows: results.map(r => ({
                        title: r.title || 'بدون اسم',
                        description: r.description || 'بدون وصف',
                        rowId: `!openlink ${r.link}` // الزر يفتح الرابط
                    }))
                }
            ];

            await conn.sendMessage(m.chat, {
                text: `🔍 نتائج البحث عن: ${query}`,
                footer: "اختر أحد الجروبات لفتح الرابط",
                buttonText: "عرض النتائج",
                sections
            });

        } catch (error) {
            console.error('❌ خطأ أثناء البحث:', error.message);
            conn.reply(m.chat, '❌ حدث خطأ أثناء البحث عن القنوات والجروبات.', m);
        }
    }
};

handler.command = ['تلي'];

export default handler;