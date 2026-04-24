import fetch from "node-fetch";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";

/* رفع الصورة على Uguu */
async function uploadToUguu(buffer) {
  const { ext = "jpg", mime = "image/jpeg" } =
    (await fileTypeFromBuffer(buffer)) || {};
  const form = new FormData();
  form.append("files[]", buffer, { filename: `image.${ext}`, contentType: mime });

  const res = await fetch("https://uguu.se/upload.php", {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  return json.files?.[0]?.url;
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!args.length && !/image/.test(mime)) {
    return m.reply(
      `⚙️ الاستخدام: ${usedPrefix + command} <وصف>\n` +
        `🖼️ أو قم بالرد على صورة.\n\n` +
        `💡 مثال:\n${usedPrefix + command} اجعلها تتحرك`
    );
  }

  try {
    let prompt = args.join(" ").trim() || "Make moving";
    let imageUrl = "";
    let type = "text-to-video";

    // ===== إذا كانت الرسالة رد على صورة =====
    if (/image/.test(mime)) {
      const media = await q.download();
      if (!media) return m.reply("❌ فشل تحميل الصورة!");

      imageUrl = await uploadToUguu(media);
      if (!imageUrl) return m.reply("❌ فشل رفع الصورة!");

      type = "image-to-video"; // نحدد النوع
    }

    // رسالة انتظار
    let waitMsg = await conn.sendMessage(
      m.chat,
      { text: `🎥 جاري توليد الفيديو...\n🧠 الوصف: ${prompt}` },
      { quoted: m }
    );

    // 🔥 بناء رابط API ديناميكي
    let apiURL = `https://dark-api-x.vercel.app/api/v1/ai/veo3pro?prompt=${encodeURIComponent(
      prompt
    )}`;
    if (imageUrl) apiURL += `&imageUrl=${encodeURIComponent(imageUrl)}`;

    const res = await fetch(apiURL);
    const json = await res.json();

    if (!json.status || !json.videoUrl)
      throw new Error(json.message || "فشل توليد الفيديو!");

    // حذف رسالة الانتظار
    await conn.sendMessage(m.chat, { delete: waitMsg.key }).catch(() => {});

    // إرسال الفيديو
    await conn.sendMessage(
      m.chat,
      {
        video: { url: json.videoUrl },
        caption:
          `✅ تم توليد الفيديو بنجاح!\n\n` +
          `🧠 الوصف: ${prompt}\n` +
          `🎞️ النوع: ${json.type}\n` +
          `${imageUrl ? `🖼️ الصورة: ${imageUrl}\n` : ""}` +
          `🆔 Task: ${json.taskId || ""}`
      },
      { quoted: m }
    );
  } catch (e) {
    m.reply(`❌ خطأ: ${e.message || e}`);
  }
};

handler.command = ["veo3"];
export default handler;