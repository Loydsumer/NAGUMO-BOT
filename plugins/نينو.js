import baileys from "@whiskeysockets/baileys";
import axios from "axios";
import FormData from "form-data";

const { prepareWAMessageMedia, generateWAMessageFromContent } = baileys;

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    let imageInput, prompt;

    const q = m.quoted || m;
    const mime = (q.msg || q).mimetype || "";

    if (/image/.test(mime)) {
      if (!text) throw `⚠️ اكتب وصف الصورة بعد الأمر.\nمثال: ${usedPrefix + command} اجعلها أنمي`;
      const buffer = await q.download();
      imageInput = buffer;
      prompt = text.trim();
    } else {
      if (!text) throw `⚠️ يجب إرسال الصورة أو رابط + الوصف.\nمثال: ${usedPrefix + command} اجعلها أنمي`;
      const parts = text.split("|").map((x) => x.trim());
      if (parts.length === 1) {
        throw "⚠️ لا يمكن استخدام رابط بدون الوصف.";
      }
      imageInput = parts[0];
      prompt = parts[1];
    }

    const waitMsg = await conn.sendMessage(
      m.chat,
      { text: "⏳ جارٍ تعديل الصورة ..." },
      { quoted: m }
    );

    let resultUrl;

    if (Buffer.isBuffer(imageInput)) {
      const formData = new FormData();
      formData.append("image", imageInput, "image.jpg");
      formData.append("prompt", prompt);

      try {
        const resAPI = await axios.post(
          "https://dark-api-x.vercel.app/api/v1/ai/nano_banana",
          formData,
          { headers: formData.getHeaders() }
        );
        resultUrl = resAPI.data?.result;
      } catch (err) {
        console.error("API Response Error:", err.response?.data || err.message);
        throw new Error("❌ فشل في معالجة الصورة عبر الـ API");
      }
    } else {
      const resAPI = await axios.get(
        `https://dark-api-x.vercel.app/api/v1/ai/nano_banana?imageUrl=${encodeURIComponent(
          imageInput
        )}&prompt=${encodeURIComponent(prompt)}`
      );
      resultUrl = resAPI.data?.result;
    }

    await conn.sendMessage(m.chat, { delete: waitMsg.key });

    if (!resultUrl) throw "❌ لم يتم الحصول على النتيجة.";

    await conn.sendFile(
      m.chat,
      resultUrl,
      "result.png",
      `✅ تم تعديل الصورة\n📜 الوصف: ${prompt}`,
      m
    );
  } catch (e) {
    console.error(e);
    throw `❌ حدث خطأ أثناء التعديل:\n${e.message || e}`;
  }
};

handler.help = ["nano"];
handler.tags = ["ai"];
handler.command = /^نينو$/i;

export default handler;