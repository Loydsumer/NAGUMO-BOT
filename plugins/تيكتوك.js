// • Feature : TikTok search
// • Developers : izana x radio
// • Channel : https://whatsapp.com/channel/0029VbB2Uwg11ulIMA9bfq2c
import fetch from 'node-fetch';
import pkg from '@whiskeysockets/baileys';
const { proto, generateWAMessageFromContent, generateWAMessageContent } = pkg;

const handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) {
            return conn.reply(
                m.chat,
                `[❗️] استخدم الأمر هكذا:
${usedPrefix}${command} <كلمة البحث>
مثال: ${usedPrefix}${command} eminem`,
                m
            );
        }

        const query = encodeURIComponent(args.join(' '));
        const apiUrl = `https://dark-api-x.vercel.app/api/v1/search/tiktok?text=${query}`;

        await conn.reply(m.chat, '⏳ جاري البحث في تيك توك ...', m);

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.status || !data.videos || data.videos.length === 0) {
            return conn.reply(
                m.chat,
                `❌ ما فيش نتائج ل "${args.join(' ')}"`,
                m
            );
        }

        const cards = await Promise.all(
            data.videos.slice(0, 3).map(async (video) => {
                const videoMsg = await generateVideoMessage(conn, video.play);

                return {
                    body: proto.Message.InteractiveMessage.Body.fromObject({
                        text: ''
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                        text: '🎵 تيك توك فيديو'
                    }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        title: video.title || 'بدون عنوان',
                        hasMediaAttachment: true,
                        videoMessage: videoMsg
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: []
                    })
                };
            })
        );

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: `🎬 *نتائج البحث عن:* ${args.join(' ')}`
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: '🔎 بواسطة: Dark API'
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                hasMediaAttachment: false
                            }),
                            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                cards
                            })
                        })
                    }
                }
            },
            { quoted: m }
        );

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error(err);
        conn.reply(
            m.chat,
            `❌ حصل خطأ أثناء جلب فيديوهات تيك توك!\n\n${err}`,
            m
        );
    }
};

async function generateVideoMessage(conn, videoUrl) {
    const { videoMessage } = await generateWAMessageContent(
        { video: { url: videoUrl } },
        { upload: conn.waUploadToServer }
    );
    return videoMessage;
}

handler.help = ['تيكتوك <بحث>'];
handler.tags = ['downloader'];
handler.command = /^(تيكتوك|tiktok|توك)$/i;

export default handler;