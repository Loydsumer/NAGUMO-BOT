import axios from 'axios';
import baileys from '@whiskeysockets/baileys';
const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

// 🔮 الشخصيات العربية ⇢ الإنجليزية
const charactersMap = {
  "غوجو": "Gojo Satoru",
  "كانيكي": "Kaneki Ken",
  "اليا": "Alia",
  "سوكونا": "Sukuna",
  "الاستور": "Alastor",
  "انيا": "Anya Forger",
  "ميكاسا": "Mikasa Ackerman",
  "ارمين": "Armin from anime aot",
  "ايرين": "Eren Yeager",
  "ايتادوري": "Itadori Yuji",
  "كيرا": "Light Yagami",
  "ماكيما": "Makima",
  "باور": "Power",
  "دينجي": "Denji",
  "زورو": "Roronoa Zoro",
  "لوفي": "Monkey D. Luffy",
  "ناروتو": "Naruto Uzumaki",
  "ساسكي": "Sasuke Uchiha",
  "ايتاتشي": "Itachi Uchiha",
  "ريم": "Rem",
  "ايميليا": "Emilia",
  "ليفاي": "Levi Ackerman",
  "تانجيرو": "Tanjiro Kamado",
  "نيزوكو": "Nezuko Kamado"
};

// 🖼️ تجهيز الصور
async function createImageMessage(conn, url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
  const media = await prepareWAMessageMedia(
    { image: { url } },
    { upload: conn.waUploadToServer }
  );
  return media.imageMessage || null;
}

// 🔍 البحث والإرسال
async function searchCharacter(m, conn, englishName, displayName) {
  await m.react("⌛"); // قبل العملية
  await conn.reply(m.chat, `> ⏳ جاري البحث عن صور *${displayName}* بجودة 4K...`, m);

  const searchTerm = `${englishName} 4K anime icon 1:1`;
  let images = [];

  try {
    const res = await axios.get('https://dark-api-x.vercel.app/api/v1/search/pinterest', {
      params: { query: searchTerm }
    });
    images = res.data.pins?.map(pin => pin.image).filter(Boolean).slice(0, 10);
  } catch (e) {
    console.error(`⚠️ خطأ في API: ${e.message}`);
  }

  if (!images || images.length === 0) {
    await m.react("❌");
    return m.reply(`❌ لم يتم العثور على نتائج لـ *${displayName}*.`);
  }

  let imagesList = [];
  let counter = 1;
  for (let imageUrl of images) {
    const imageMessage = await createImageMessage(conn, imageUrl);
    if (!imageMessage) continue;

    imagesList.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `🔎 *${displayName}* - 📸 صورة ${counter++}`
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
            url: imageUrl
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
            text: "> 💫 تم العثور على الصور بنجاح! استمتع بالعرض."
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: imagesList
          })
        })
      }
    }
  }, { quoted: m });

  await m.react("✅"); // بعد العملية
  await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id });
}

// 📝 الهاندر لكل شخصية عربية
let handler = async (m, { command, conn }) => {
  const displayName = command;
  const englishName = charactersMap[displayName];
  if (!englishName) {
    return m.reply(`❌ لم أجد اسم "${displayName}" في قائمة الشخصيات!`);
  }
  await searchCharacter(m, conn, englishName, displayName);
};

// ✅ حط كل أسماء الشخصيات العربية كأوامر
handler.command = Object.keys(charactersMap);
handler.help = Object.keys(charactersMap);
handler.tags = ['anime'];
handler.register = true;

export default handler;