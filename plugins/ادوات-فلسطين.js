import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

let handler = async (m, { text, conn, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  try {
    if (!mime) {
      return await m.reply(`🧞‍♀️ *استخدام الأمر:*\n\n- قم بالرد على صورة ثم أرسل الأمر *.${command}* ليتم إضافة إطار فلسطين 🇵🇸 على الصورة.\n\n📌 *مثال:*\n- أرسل صورة في المحادثة\n- رد على الصورة بكتابة: *.${command}*`);
    }

    if (!mime.startsWith("image/")) {
      return await m.reply("🧞‍♀️ *هذه الميزة تعمل على الصور فقط، لا تدعم الفيديوهات!* 🇵🇸");
    }

    await m.react('⏳'); // إشارة إلى بدء العملية

    let media = await q.download(true);
    let data = await uploadFile(media);

    let imag = data.files[0]?.url;
    if (!imag) throw "⚠️ لم يتم العثور على رابط الصورة بعد الرفع.";

    let messages = [
      "🧞‍♀️ *اللهم كن مع إخواننا في فلسطين 🇵🇸💚*",
      "🧞‍♀️ *قاطعوا المنتجات الإسرائيلية، كل ريال قد يكون رصاصة ضد الأبرياء!* 🇵🇸",
      "🧞‍♀️ *تحرير الأقصى قريب بإذن الله! 🇵🇸✊*",
      "🧞‍♀️ *غزة تقاوم، ونحن معها حتى النصر! 💪🇵🇸*",
      "🧞‍♀️ *لا تتركوا فلسطين وحدها، انشروا قضيتها! 🇵🇸🔥*",
      "🧞‍♀️ *اللهم انصر المجاهدين في أرض فلسطين واحفظهم من كل سوء!* 🤲🇵🇸",
      "🧞‍♀️ *الكلمة سلاح، فلا تكن صامتًا أمام الظلم!* ✊🇵🇸",
      "🧞‍♀️ *لا تشتري منتجات الاحتلال، قاطع من يقتل الأطفال!* 🚫🇵🇸",
      "🧞‍♀️ *القدس لنا، وفلسطين حرة رغم أنف المحتل!* 🇵🇸🔥",
      "🧞‍♀️ *كلنا مع المقاومة الفلسطينية حتى التحرير!* ✊🇵🇸"
    ];

    let randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await conn.sendFile(
      m.chat,
      `https://zoro-api-zoro-bot-5b28aebf.koyeb.app/api/makers/Palestine?image=${imag}`,
      '',
      randomMessage,
      m
    );

    await m.react('🇵🇸'); // نجاح العملية

  } catch (error) {
    console.error("Error:", error);
    await m.reply("❌ *حدث خطأ أثناء تنفيذ الأمر!* ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ");
    await m.react('❌'); // إشارة إلى الفشل
  }
};

handler.help = ["Palestine"];
handler.tags = ["tools"];
handler.command = ['فلسطين', 'فلسطيني', 'فلسطينية', 'فسطين', 'اطار-فلسطين', 'بروفايل-فلسطين'];

export default handler;

async function uploadFile(path) {
  let form = new FormData();
  form.append('files[]', fs.createReadStream(path));

  let res = await (await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    headers: {
      ...form.getHeaders()
    },
    body: form
  })).json();

  await fs.promises.unlink(path); // حذف الملف المؤقت بعد الرفع
  return res;
}