import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import yts from 'yt-search';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    throw `🤖 *يرجى كتابة اسم الفيديو للبحث على YouTube.*\n🤖 *مثال:* \`${usedPrefix + command} اغاني عائلة كورليوني\``;
  }

  const results = await yts(text);
  const videos = results.videos.slice(0, 10);

  if (!videos.length) throw '🤖 *لم يتم العثور على أي نتائج! حاول كتابة اسم أوضح.*';

  const randomVideo = videos[Math.floor(Math.random() * videos.length)];

  const media = await prepareWAMessageMedia(
    { image: { url: randomVideo.thumbnail } },
    { upload: conn.waUploadToServer }
  );

  const interactiveMessage = {
    body: {
      text: `🤖 *تم العثور على:* \`${videos.length}\` 🤖\n\n🤖 *${randomVideo.title}*\n\n🤖 ≡ *الناشر:* ${randomVideo.author.name}\n🤖 ≡ *عدد المشاهدات:* ${randomVideo.views.toLocaleString()}\n🤖 ≡ *الرابط:* ${randomVideo.url}`
    },
    footer: { text: '🅾🅶🅰🅼🅸 🅱🅾🆃' },
    header: {
      title: '```🤖 نتائج البحث في YouTube 🤖```',
      hasMediaAttachment: true,
      imageMessage: media.imageMessage
    },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🤖 خيارات التحميل',
            sections: videos.map(video => ({
              title: `${video.title}`,
              rows: [
                {
                  header: video.title,
                  title: video.author.name,
                  description: `🤖 تحميل صوت فقط | المدة: ${video.timestamp}`,
                  id: `.صوتوي ${video.url}`
                },
                {
                  header: video.title,
                  title: video.author.name,
                  description: `🤖 تحميل فيديو كامل | المدة: ${video.timestamp}`,
                  id: `.فيد ${video.url}`
                }
              ]
            }))
          })
        }
      ],
      messageParamsJson: ''
    }
  };

  const userJid = conn?.user?.jid || m.key.participant || m.chat;
  const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid, quoted: m });
  conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.help = ['yts <الاسم>', 'ytsearch <الاسم>', 'يوتيوب <الاسم>'];
handler.tags = ['بحث', 'يوتيوب'];
handler.command = ['yts', 'ytsearch', 'يوتيوب']; // أضف اسم عربي
handler.register = true;

export default handler;