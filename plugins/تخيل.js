import axios from "axios";

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `🎨 يرجى كتابة وصف للصورة.\n\n📌 مثال:\n*.${command}* anime girl with red hair`;

  await conn.sendMessage(m.chat, { text: "⏳ جاري توليد الصورة، يرجى الانتظار..." }, { quoted: m });

  try {
    const apiUrl = `https://dark-api-x.vercel.app/api/v1/ai/catart?prompt=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.image_base64) {
      throw new Error("لم يتم استلام بيانات صحيحة من الخادم.");
    }

    const base64Data = data.image_base64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `✅ *تم توليد الصورة بنجاح*\n📜 *الوصف:* ${data.prompt}`
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, "❌ حدث خطأ أثناء توليد الصورة. حاول مرة أخرى لاحقاً.", m);
  }
};

handler.help = ["art"];
handler.command = ["art", "تخيل", "كات-ارت"];
handler.tags = ["ai"];

export default handler;