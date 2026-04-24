import axios from "axios";
import cheerio from "cheerio";
import https from "https";
import fetch from "node-fetch";
import baileys from "@whiskeysockets/baileys";

const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let handler = async (m, { conn }) => {
  await m.react("⌛");
  conn.reply(m.chat, "> 📰 جاري جلب آخر أخبار كرة القدم...", m);

  let articles = await fetchBeritaBola();
  if (!articles.length) {
    await m.react("❌");
    return m.reply("❌ فشل في جلب أخبار كرة القدم.");
  }

  // 🔢 نأخذ أول 20 خبر فقط
  articles = articles.slice(0, 20);

  // 🔁 ترجمة العناوين والتصنيفات
  for (let a of articles) {
    a.translatedTitle = await translate(a.title, "ar");
    a.translatedCategories = a.categories.length
      ? (await Promise.all(a.categories.map(cat => translate(cat, "ar")))).join(", ")
      : "غير معروف";
  }

  // 🧩 تجهيز الصور
  async function createImageMessage(url) {
    try {
      if (!url || !url.startsWith("http")) return null;
      const media = await prepareWAMessageMedia(
        { image: { url } },
        { upload: conn.waUploadToServer }
      );
      return media.imageMessage || null;
    } catch {
      return null;
    }
  }

  let cards = [];
  let count = 1;

  for (let article of articles) {
    let imgMsg = await createImageMessage(article.image);
    if (!imgMsg) continue;

    cards.push({
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: `📰 ${article.translatedTitle}`,
        hasMediaAttachment: true,
        imageMessage: imgMsg,
        subtitle: "⚽ Vivagoal Football News",
        headerType: 1, // لازم النوع الصحيح
      }),
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `📅 *${article.date}*\n🏷️ *${article.translatedCategories}*`
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: `📢 الخبر رقم ${count++}`
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🌐 فتح الخبر",
              url: article.url,
              merchant_url: article.url
            })
          }
        ]
      })
    });
  }

  // 🚀 بناء الكروسيل النهائي بدون أي عناصر فاضية
  const carousel = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: "⚽ *آخر 20 خبر من موقع Vivagoal*"
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐"
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

  await m.react("✅");
  await conn.relayMessage(m.chat, carousel.message, { messageId: carousel.key.id });
};

// ⚙️ الأوامر
handler.command = /^(الكوره|اخبار-كره|اخبار-كرة)$/i;
handler.tags = ["news"];
handler.help = ["اخبار-كره", "اخبار-كرة", "beritabola"];
export default handler;

// 📰 دالة جلب الأخبار
async function fetchBeritaBola() {
  try {
    const { data: html } = await axios.get("https://vivagoal.com/category/berita-bola/", {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
    const $ = cheerio.load(html);
    const articles = [];

    $(".swiper-wrapper .swiper-slide, .col-lg-6.mb-4, .col-lg-4.mb-4").each((i, el) => {
      const url = $(el).find("a").attr("href");
      const image = $(el).find("figure img").attr("src");
      const title = $(el).find("h3 a").text().trim();
      const categories = $(el)
        .find("a.vg_pill_cat")
        .map((i, cat) => $(cat).text().trim())
        .get();
      let date = $(el).find("time").attr("datetime") || $(el).find(".posted-on").text().trim();
      if (!date) date = new Date().toISOString().split("T")[0];

      if (url && title && image) {
        articles.push({ url, image, title, categories, date });
      }
    });

    return articles.reverse();
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الأخبار:", error.message);
    return [];
  }
}

// 🌍 دالة الترجمة
async function translate(text, lang) {
  if (!text.trim()) return "";
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.append("client", "gtx");
  url.searchParams.append("sl", "auto");
  url.searchParams.append("dt", "t");
  url.searchParams.append("tl", lang);
  url.searchParams.append("q", text);

  try {
    const response = await fetch(url.href);
    const data = await response.json();
    return data[0].map(item => item[0].trim()).join(" ");
  } catch {
    return text;
  }
}