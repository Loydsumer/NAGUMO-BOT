import axios from "axios";
import crypto from "crypto";

const fakeChatGenerator = async (chatUrl) => {
  const client = new axios.create({
    baseURL: "https://spotisongdownloader.to",
    headers: {
      "Accept-Encoding": "gzip, deflate, br",
      cookie: `PHPSESSID=${crypto.randomBytes(16).toString("hex")}; _ga=GA1.1.2675401.${Math.floor(
        Date.now() / 1000
      )}`,
      referer: "https://spotisongdownloader.to",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { data: meta } = await client.get("/api/composer/spotify/xsingle_track.php", {
    params: { url: chatUrl },
  });
  
  await client.post("/track.php");
  
  const { data: dl } = await client.post("/api/composer/spotify/ssdw23456ytrfds.php", {
    url: chatUrl,
    zip_download: "false",
    quality: "m4a",
  });

  return { ...dl, ...meta };
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const commandName = command === "محادثة-وهمية" ? "Fake Chat" : "محادثة-وهمية";
    const commandExample = `${usedPrefix}${command} Bot Veto menyambut Anda|06:00|SXZ`;

    // تخصيص الرسالة التوضيحية بناءً على اسم الأمر المستخدم
    const usageText = `
👻 *كيف تستخدم هذا الأمر؟*
1. قم بإرسال رابط المحادثة الوهمية.
2. سيظهر لك صورة المحادثة المزيفة، مع تفاصيل مثل النص ووقت الرسالة.

👻 *مثال:*
📌 *${commandExample}*
`;

    // التحقق من صحة النص المدخل
    if (!text) return m.reply(usageText);

    let parts = text.split("|");
    if (parts.length < 3) return m.reply(`*❗ تنسيق غير صحيح!*\n*🍀 المثال الصحيح: ${usedPrefix + command} نص الرسالة|وقت المحادثة|وقت شريط الحالة*`);

    let [message, chatTime, statusBarTime] = parts;

    if (message.length > 80) return m.reply("*🍂 النص طويل جدًا! يجب ألا يتجاوز 80 حرفًا.*");

    let url = `https://api.zenzxz.my.id/maker/fakechatiphone?text=${encodeURIComponent(message)}&chatime=${encodeURIComponent(chatTime)}&statusbartime=${encodeURIComponent(statusBarTime)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('فشل في تحميل الصورة من الـ API');

    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // إرسال الصورة مع التفاصيل
    await conn.sendFile(m.chat, imageBuffer, 'fakechat.jpg', `*✨ المحادثة الوهمية على iPhone تم إنشاؤها بنجاح!*\n\n*💬 الرسالة: ${message}*\n*⏰ وقت المحادثة: ${chatTime}*\n*📱 وقت شريط الحالة: ${statusBarTime}*`, m);

  } catch (err) {
    console.error(err);
    await m.reply('*🍂 فشل في إنشاء الصورة. حاول مرة أخرى لاحقًا.*');
  }
};

handler.help = ['محادثة-وهمية', 'Fake-Chat']; // إضافة الأوامر بالعربية والإنجليزية
handler.tags = ['maker'];
handler.command = /^(محادثة-وهمية|fakeiphonechat)$/i; // إضافة الأوامر بالعربية والإنجليزية
handler.limit = true;
handler.register = true;

export default handler;