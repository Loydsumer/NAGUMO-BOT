import axios from "axios";

let handler = async (m, { args }) => {
  if (!args[0]) {
    return m.reply("❌ يرجى إدخال رابط فيديو TikTok.");
  }

  let url = args[0];
  try {
    let result = await Tiktok(url);
    if (!result || result.code !== 0) {
      return m.reply("❌ لم يتم العثور على الفيديو. تأكد من صحة الرابط.");
    }

    let { title, play, cover, author } = result.data;

    let message = `🎵 *TikTok Video*\n\n`;
    message += `📌 *العنوان:* ${title || "غير متوفر"}\n`;
    message += `👤 *المنشئ:* ${author.nickname} (@${author.unique_id})\n`;
    message += `🔗 *رابط الفيديو:* ${url}`;

    await conn.sendMessage(
      m.chat,
      { image: { url: cover }, caption: message },
      { quoted: m }
    );

    await conn.sendMessage(
      m.chat,
      { video: { url: play }, caption: "🎥 *الفيديو بدون علامة مائية*" },
      { quoted: m }
    );
  } catch (error) {
    console.error("TikTok API Error:", error);
    m.reply("❌ حدث خطأ أثناء جلب الفيديو.");
  }
};

handler.help = ["tiktok2"];
handler.tags = ["downloader"];
handler.command = ["تيك"];

export default handler;

const Tiktok = async (url) => {
  try {
    let params = new URLSearchParams();
    params.append("url", url);

    let { data } = await axios.post("https://tikwm.com/api/", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: "current_language=en",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
    });

    if (!data || typeof data.code !== "number") {
      throw new Error("Invalid API response");
    }

    return data;
  } catch (error) {
    throw new Error(`Tiktok API Error: ${error.message}`);
  }
};