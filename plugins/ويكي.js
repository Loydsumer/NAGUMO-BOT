import axios from 'axios';
import * as cheerio from 'cheerio';
import baileys from '@whiskeysockets/baileys';

const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: '❌ اكتب كلمة للبحث\n\nمثال: *.ويكي مصر*' },
      { quoted: m }
    );
  }

  await m.react("⌛");
  conn.reply(m.chat, `🔎 جاري البحث عن *${text}* في ويكيبيديا...`, m);

  try {
    const searchUrl = `https://ar.wikipedia.org/w/index.php?search=${encodeURIComponent(text)}`;
    const { data: searchHtml } = await axios.get(searchUrl);
    const $s = cheerio.load(searchHtml);

    // أول 10 روابط من نتائج البحث
    const results = [];
    $s('.mw-search-result-heading a').each((i, el) => {
      if (i >= 10) return false;
      const title = $s(el).text().trim();
      const url = 'https://ar.wikipedia.org' + $s(el).attr('href');
      results.push({ title, url });
    });

    if (!results.length) {
      await m.react("❌");
      return conn.sendMessage(m.chat, { text: `❌ لا توجد نتائج لـ *${text}*.` }, { quoted: m });
    }

    // محتوى أول 5 مقالات
    const detailedResults = [];
    for (let i = 0; i < Math.min(5, results.length); i++) {
      const { title, url } = results[i];
      try {
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);

        let paragraphs = [];
        $('#mw-content-text .mw-parser-output > p').each((i, el) => {
          const txt = $(el).text().trim();
          if (txt.length > 0) paragraphs.push(txt);
        });

        let content = paragraphs.slice(0, 2).join('\n\n') || '⚠️ لم يتم العثور على وصف مناسب.';
        if (content.length > 1000) content = content.slice(0, 1000) + '...';

        const image = $('meta[property="og:image"]').attr('content') || 
                      'https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png';

        detailedResults.push({ title, content, url, image });
      } catch (err) {
        console.error('Wiki fetch error:', err.message);
      }
    }

    // دالة تجهيز الصورة
    async function createImageMessage(url) {
      if (!url || !url.startsWith("http")) return null;
      const media = await prepareWAMessageMedia({ image: { url } }, { upload: conn.waUploadToServer });
      return media.imageMessage || null;
    }

    // بناء الكروت
    let cards = [];
    let count = 1;
    for (let result of detailedResults) {
      let imgMsg = await createImageMessage(result.image);
      if (!imgMsg) continue;

      cards.push({
        header: proto.Message.InteractiveMessage.Header.fromObject({ imageMessage: imgMsg }),
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `📘 ${result.title}\n\n${result.content}`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: `⏤͟͞ू⃪ 𝑹𝒖𝒃𝒚-𝐻𝒐𝒔𝒉𝒊𝒏𝒐 🌸 | النتيجة ${count++}`
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🌐 عرض المقالة",
              url: result.url
            })
          }]
        })
      });
    }

    // إرسال الكروسيل
    const carousel = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `💎 نتائج البحث عن: *${text}*`
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
          })
        }
      }
    }, { quoted: m });

    await m.react("✅");
    await conn.relayMessage(m.chat, carousel.message, { messageId: carousel.key.id });

  } catch (err) {
    console.error(err);
    await m.react("❌");
    return conn.sendMessage(m.chat, { text: "💎❌ حدث خطأ أثناء البحث، حاول لاحقًا." }, { quoted: m });
  }
};

handler.command = ['ويكي'];
handler.help = ['ويكيبيديا <كلمة>'];
handler.tags = ['search'];
export default handler;