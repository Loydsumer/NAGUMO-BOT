// • Feature : Instagram Downloader (video, photo)
// • Developers : izana x radio
// • Channel : https://whatsapp.com/channel/0029VbB2Uwg11ulIMA9bfq2c

import axios from "axios";
import fs from "fs";
import path from "path";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // رد فعل أولي
    await conn.sendMessage(m.chat, { react: { text: "📸", key: m.key } });

    // التحقق من وجود الرابط
    if (!text) {
      return conn.reply(
        m.chat,
        `⌯︙استخدم الأمر بشكل صحيح:\n\n${usedPrefix + command} رابط_منشور_إنستجرام`,
        m
      );
    }

    // رسالة الانتظار
    await conn.sendMessage(m.chat, { text: "⌯︙جارِ جلب ميديا إنستجرام، انتظر قليلًا..." });

    // طلب من API
    const apiUrl = `https://dark-api-x.vercel.app/api/v1/download_instagram?url=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.download_url) {
      return conn.sendMessage(m.chat, { text: "❌ لم يتم العثور على الميديا، تحقق من الرابط." });
    }

    const { media_type, download_url } = data;

    // تحديد الامتداد
    const fileExt = media_type === "video" ? "mp4" : "jpg";
    const tempPath = path.join(process.cwd(), `insta_${Date.now()}.${fileExt}`);

    // تحميل الملف مؤقتًا
    const buffer = await axios.get(download_url, { responseType: "arraybuffer" });
    fs.writeFileSync(tempPath, buffer.data);

    // إرسال الميديا حسب النوع
    if (media_type === "video") {
      await conn.sendMessage(m.chat, {
        video: { url: tempPath },
        caption: `✅ تم جلب فيديو إنستجرام بنجاح`,
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: tempPath },
        caption: `✅ تم جلب صورة إنستجرام بنجاح`,
      }, { quoted: m });
    }

    // حذف الملف بعد الإرسال
    fs.unlinkSync(tempPath);

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, {
      text: `❌ حدث خطأ أثناء جلب ميديا إنستجرام:\n${e.message}`,
    });
  }
};

// تعريف الأمر
handler.help = ["انستا"];
handler.tags = ["downloader"];
handler.command = /^(انستا|instagram|insta)$/i;

export default handler;