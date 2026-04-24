// • Feature : gimnai ai
// • Developers : izana x radio
// • Channel : https://whatsapp.com/channel/0029VbB2Uwg11ulIMA9bfq2c
import axios from "axios";

let handler = async (m, { text, command }) => {
  if (!text)
    return m.reply(
      `🎯 يرجى كتابة سؤالك بعد الأمر\n\nمثال:\n${command} ما هو الذكاء الاصطناعي؟`
    );

  const wait = await m.reply("⏳ جاري معالجة سؤالك بواسطة Gemini...");

  try {
    const res = await axios.get(
      `https://dark-api-x.vercel.app/api/v1/ai/gemini?prompt=${encodeURIComponent(text)}`
    );

    if (res.data?.status && res.data?.response) {
      await m.reply(
        `💬 *رد Gemini:*\n\n${res.data.response}\n\n`
      );
    } else {
      await m.reply("⚠️ حدث خطأ أثناء جلب الرد من Gemini.");
    }
  } catch (err) {
    console.error(err);
    await m.reply("❌ حدث خطأ في الاتصال بالخادم، حاول مجددًا لاحقًا.");
  }
};

handler.help = ["جيمي", "جيمناي", "gimnai"];
handler.tags = ["ai"];
handler.command = /^(جيمي|جيميناي|gimnai)$/i;

export default handler;