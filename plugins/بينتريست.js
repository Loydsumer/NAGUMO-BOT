import axios from 'axios';
import baileys from '@whiskeysockets/baileys';

const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) throw `⚠️ أدخل مصطلح البحث.\n\nمثال: *${usedPrefix + command} anime*`;

    await m.react("⌛");
    conn.reply(m.chat, '> ⏳ جاري البحث عن الصور...', m);

    async function createImageMessage(url) {
        if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
        const media = await prepareWAMessageMedia(
            { image: { url } },
            { upload: conn.waUploadToServer }
        );
        return media.imageMessage || null;
    }

    // 🔥 استدعاء NEW API مباشرة
    let images = [];
    try {
        const res = await axios.get('https://dark-api-x.vercel.app/api/v1/search/pinterest', {
            params: { query: text }
        });
        images = res.data.pins?.map(pin => pin.image).filter(Boolean).slice(0, 10);
    } catch (e) {
        console.error(`⚠️ خطأ في API: ${e.message}`);
    }

    if (images.length === 0) {
        await m.react("❌");
        return m.reply(`❌ لم يتم العثور على نتائج لـ *"${text}"*.`);
    }

    let imagesList = [];
    let counter = 1;

    for (let imageUrl of images) {
        let imageMessage = await createImageMessage(imageUrl);
        if (!imageMessage) continue;

        imagesList.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `🔎 *نتيجة البحث عن:* ${text}\n📸 𝐏𝐇𝐎𝐓𝐎 ${counter++}`
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                hasMediaAttachment: true,
                imageMessage
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [{
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🔗 فتح في Pinterest",
                        url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`
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
                        text: "> 🔍 للحصول على نتائج أفضل، ابحث باللغة الإنجليزية مع وصف للصورة."
                    }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                        cards: imagesList
                    })
                })
            }
        }
    }, { quoted: m });

    await m.react("✅");
    await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id });
};

handler.help = ['pinterest <keyword>'];
handler.tags = ['بحث'];
handler.command = /^(pin|بينتر)$/i;
handler.register = true;
handler.limit = 1;

export default handler;