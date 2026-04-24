import yts from 'yt-search';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;

let handler = async (m, { conn, text }) => {
  if (!text) return conn.sendMessage(
    m.chat,
    { text: '❌ ضع رابط أو اسم فيديو بعد الأمر\nمثال:\n.فيديو https://youtu.be/xxxx\nأو\n.فيديو اسم الأغنية' },
    { quoted: m }
  );

  try {
    let video, url;

    // ✅ لو الرابط مباشر
    if (text.includes("youtube.com") || text.includes("youtu.be")) {
      let id = text.includes("v=") ? text.split("v=")[1].split("&")[0] : text.split("/").pop();
      let search = await yts({ videoId: id });
      if (!search) throw new Error("❌ لم أجد الفيديو");
      video = search;
      url = text;
    } else {
      // ✅ بحث بالكلمة
      let search = await yts(text);
      if (!search || !search.videos || !search.videos.length)
        return conn.sendMessage(m.chat, { text: "❌ لم أجد أي نتائج." }, { quoted: m });
      video = search.videos[0];
      url = video.url;
    }

    let caption = `
🎬 *العنوان:* ${video.title}
📺 *القناة:* ${video.author.name}
⏱ *المدة:* ${video.timestamp}
👁 *المشاهدات:* ${video.views.toLocaleString()}
🔗 *الرابط:* ${url}
`;

    // ✅ أزرار الجودة
    let buttons = [
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "144p", id: `.144 ${url}` }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "240p", id: `.240 ${url}` }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "360p", id: `.360 ${url}` }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "480p", id: `.480 ${url}` }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "720p", id: `.720 ${url}` }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "1080p", id: `.1080 ${url}` }) },
      { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "MP3 🎵", id: `.اغنيه ${url}` }) }
    ];

    // ✅ تجهيز الصورة
    let imgMsg = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer });

    const message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: "اختر الجودة 👇" }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: true,
              imageMessage: imgMsg.imageMessage
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons })
          })
        }
      }
    };

    const msg = generateWAMessageFromContent(m.chat, message, { userJid: m.sender });
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error(e);
    conn.sendMessage(m.chat, { text: "❌ حصل خطأ أثناء البحث أو جلب الفيديو." }, { quoted: m });
  }
};

handler.command = /^فيديو$/i;
export default handler;