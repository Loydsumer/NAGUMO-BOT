import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  try {
    if (!mime || !mime.startsWith("image/")) {
      return await m.reply("❌ يرجى الرد على صورة فقط لتحليل مستوى الجمال.");
    }

    await m.react("⏳"); // بدء المعالجة

    let media = await q.download();
    let imageUrl = await uploadToCatbox(media);

    if (!imageUrl) throw "⚠️ لم يتم العثور على رابط الصورة بعد الرفع.";

    // استدعاء API لتحليل مستوى الجمال
    let apiUrl = `https://takamura-api.joanimi-world.site/api/tools/beauty-score?imageUrl=${encodeURIComponent(imageUrl)}`;
    let response = await fetch(apiUrl);
    let result = await response.json();

    if (!result || !result.score) throw "❌ فشل في جلب النتائج من API.";

    // صياغة الرد النهائي
    let caption = `📊 *تحليل مستوى الجمال:*  
✨ *التقييم:* ${result.score}/100  
👤 *الجنس:* ${result.gender}  
🎂 *العمر:* ${result.age}  
😐 *التعبير:* ${result.expression}  
🏵️ *شكل الوجه:* ${result.faceShape}`;

    // إرسال الصورة نفسها مع التحليل
    await conn.sendMessage(m.chat, { 
      image: media, 
      caption 
    }, { quoted: m });

    await m.react("✅"); // نجاح العملية
  } catch (error) {
    console.error("Error:", error);
    await m.reply("❌ حدث خطأ أثناء تنفيذ الأمر.");
    await m.react("❌"); // فشل العملية
  }
};

handler.help = ["beauty"];
handler.tags = ["tools"];
handler.command = ["جمال", "تقييم_الجمال", "beauty"];

export default handler;

/**
 * رفع الصورة إلى catbox.moe
 * @param {Buffer} content محتوى الصورة
 * @return {Promise<string>} رابط الصورة
 */
async function uploadToCatbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  if (!ext || !mime) return null;

  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomName = crypto.randomBytes(5).toString("hex") + "." + ext;
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomName);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  const link = await response.text();
  return link.includes("http") ? link : null;
}