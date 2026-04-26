import axios from "axios";
import cheerio from "cheerio";
import https from "https";
import fetch from "node-fetch";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// متغير لتتبع آخر خبر تم إرساله
let lastArticleIndex = -1;

let handler = async (m, { conn }) => {
  let articles = await fetchBeritaBola();
  if (!articles.length) return m.reply("❌ فشل في جلب أخبار كرة القدم.");

  // تحديث الفهرس لاختيار أحدث خبر لم يتم إرساله
  if (lastArticleIndex < 0) {
    lastArticleIndex = 0;
  } else {
    lastArticleIndex++;
    if (lastArticleIndex >= articles.length) {
      lastArticleIndex = 0; // إعادة التدوير عند نهاية القائمة
    }
  }

  let article = articles[lastArticleIndex];

  // ترجمة العنوان والتصنيفات إلى العربية
  let translatedTitle = await translate(article.title, "ar");
  let translatedCategories = article.categories.length
    ? (await Promise.all(article.categories.map(cat => translate(cat, "ar")))).join(", ")
    : "غير معروف";

  let timestamp = new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });

  let caption = `📰 *أحدث خبر كرة القدم* 🧞‍♀️ (تم التحديث: ${timestamp})\n\n`;
  caption += `🔹 *${translatedTitle}*\n`;
  caption += `📅 *التاريخ:* ${article.date}\n`;
  caption += `🏷️ *التصنيف:* ${translatedCategories}\n`;
  caption += `🔗 *رابط الخبر:* ${article.url}\n\n`;

  await conn.sendMessage(m.chat, {
    image: { url: article.image },
    caption: `${caption}\n\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`,
  }, { quoted: m });
};

// الأوامر المتاحة
handler.command = /^(beritabola|اخبار-كره|اخبار-كرة)$/i;
handler.tags = ["news"];
handler.help = ["اخبار-كره", "اخبار-كرة", "beritabola"];

export default handler;

// دالة جلب الأخبار
async function fetchBeritaBola() {
  try {
    const { data: html } = await axios.get("https://vivagoal.com/category/berita-bola/", {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
    const $ = cheerio.load(html);
    const articles = [];

    $(".swiper-wrapper .swiper-slide, .col-lg-6.mb-4, .col-lg-4.mb-4").each((i, el) => {
      const url = $(el).find("a").attr("href") || null;
      const image = $(el).find("figure img").attr("src") || null;
      const title = $(el).find("h3 a").text().trim() || null;
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

    return articles.reverse(); // عكس الترتيب بحيث يكون الأحدث في البداية
  } catch (error) {
    return [];
  }
}

// دالة الترجمة باستخدام Google Translate API
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
    return data[0].map(item => item[0].trim()).join("\n");
  } catch (err) {
    return text; // في حالة الفشل، نعيد النص الأصلي
  }
}