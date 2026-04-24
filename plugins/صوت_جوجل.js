import axios from "axios";

let handler = async (m, { args, conn }) => {
  if (!args[0]) return m.reply("❌ يرجى إدخال النص العربي.");

  const text = args.join(" ");
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;

  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Referer: "https://translate.google.com/",
      },
    });

    await conn.sendMessage(
      m.chat,
      { audio: Buffer.from(res.data), mimetype: "audio/mpeg", ptt: true },
      { quoted: m }
    );
  } catch (err) {
    console.error("TTS Error:", err);
    m.reply("❌ حدث خطأ أثناء تحويل النص لصوت.");
  }
};

handler.help = ["tts"];
handler.tags = ["tools"];
handler.command = ["tts", "جوجل"];

export default handler;