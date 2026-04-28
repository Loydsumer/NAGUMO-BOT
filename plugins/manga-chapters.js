import axios from 'axios';
import * as cheerio from 'cheerio';
import baileys from '@whiskeysockets/baileys';
const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

// 🖼️ تجهيز الصور
async function createImageMessage(conn, url) {
    if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
    const media = await prepareWAMessageMedia(
        { image: { url } },
        { upload: conn.waUploadToServer }
    );
    return media.imageMessage || null;
}

// 📝 هاندر البحث عن المانجا
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`⚠️ اكتب اسم المانجا مثال:\n*.مانجا سولو*`);

    const query = encodeURIComponent(text);
    const searchUrl = `https://mangatuk.com/?s=${query}&post_type=wp-manga`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
    };

    try {
        const { data } = await axios.get(searchUrl, { headers });
        const $ = cheerio.load(data);

        const results = [];
        $('.c-tabs-item__content').each((i, el) => {
            if (i >= 10) return; // أول 10 نتائج فقط
            const title = $(el).find('.post-title a').text().trim();
            const link = $(el).find('.post-title a').attr('href');
            const img = $(el).find('img').attr('data-src');
            results.push({ title, link, img });
        });

        if (results.length === 0) return m.reply(`❌ لم يتم العثور على أي مانجا باسم: *${text}*`);

        // إنشاء Carousel لكل نتيجة
        const cards = [];
        for (let r of results) {
            const imageMessage = await createImageMessage(conn, r.img);
            if (!imageMessage) continue;

            cards.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: `📚 ${r.title}`
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    hasMediaAttachment: true,
                    imageMessage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📎 عرض الفصول",
                            id: `.فصول ${r.link}`
                        })
                    }]
                })
            });
        }

        const finalMessage = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `🔍 نتائج البحث عن: *${text}*`
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards
                        })
                    })
                }
            }
        }, { quoted: m });

        await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id });

    } catch (err) {
        console.error(err);
        m.reply('⚠️ حصل خطأ أثناء الوصول للموقع، جرب بعد قليل.');
    }
};

handler.command = ['مانجاتك'];
export default handler;