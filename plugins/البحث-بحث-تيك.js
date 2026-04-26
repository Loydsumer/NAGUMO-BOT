import axios from 'axios';
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} = (await import('@whiskeysockets/baileys')).default;

let handler = async (message, { conn, text, usedPrefix, command }) => {
  const emoji = '🤖';
  const dev = '🅾🅶🅰🅼🅸 🅱🅾🆃';
  const rwait = '⏳';
  const rdone = '✅';

  if (!text) {
    return conn.reply(
      message.chat,
      `🤖 *يرجى كتابة الكلمة التي تريد البحث عنها في تيك توك.*\n\n📌 *طريقة الاستخدام:*\n${usedPrefix + command} كلمة البحث\n\n📥 *مثال:*\n${usedPrefix + command} طبخ يمني\n\n${dev}`,
      message
    );
  }

  async function createVideoMessage(url) {
    const { videoMessage } = await generateWAMessageContent(
      { video: { url } },
      { upload: conn.waUploadToServer }
    );
    return videoMessage;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  try {
    await message.react(rwait);
    await conn.reply(
      message.chat,
      `🤖 *جارٍ تحميل نتائج البحث من تيك توك...*\n🔄 يرجى الانتظار قليلًا.`,
      message
    );

    const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    const searchResults = response.data;

    shuffleArray(searchResults);

    const selectedResults = searchResults.splice(0, 7); // عرض 7 فيديوهات فقط

    let results = [];

    for (let result of selectedResults) {
      results.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: dev }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: result.title || '🤖 فيديو من TikTok',
          hasMediaAttachment: true,
          videoMessage: await createVideoMessage(result.nowm)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      });
    }

    const responseMessage = generateWAMessageFromContent(
      message.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `🤖 *نتائج البحث عن:* ${text}`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: `🎵 TikTok - بحث الفيديوهات\n${dev}`
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false
              }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: results
              })
            })
          }
        }
      },
      { quoted: message }
    );

    await message.react(rdone);
    await conn.relayMessage(
      message.chat,
      responseMessage.message,
      { messageId: responseMessage.key.id }
    );
  } catch (error) {
    console.error(error);
    await conn.reply(
      message.chat,
      `🤖 *حدث خطأ أثناء تنفيذ الطلب.*\n❗ ${error.message || error}\n\n${dev}`,
      message
    );
  }
};

handler.help = ['tiktoksearch <الكلمة>', 'بحث-تيك <الكلمة>', 'بحث-تيكتوك <الكلمة>'];
handler.tags = ['بحث', 'تيك'];
handler.command = ['tiktoksearch', 'ttss', 'tiktoks', 'بحث-تيك', 'بحث-تيكتوك'];
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;