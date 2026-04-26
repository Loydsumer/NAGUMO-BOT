let handler = async (m, { conn, args, command }) => {
    if (!args[0]) return m.reply("⚠️ *الرجاء إدخال رابط القناة بشكل صحيح!*\nاستخدم: `.معلومات-القناة <رابط_القناة>`");

    let match = args[0].match(/whatsapp\.com\/channel\/([\w-]+)/);
    if (!match) return m.reply("⚠️ *حدث خطأ! تأكد من صحة الرابط.*");

    let inviteId = match[1];

    try {
        let metadata = await conn.newsletterMetadata("invite", inviteId);
        if (!metadata || !metadata.id) return m.reply("⚠️ *فشل في الحصول على بيانات القناة. تأكد من الرابط أو حاول لاحقًا.*");

        let caption = `*— 乂 معلومات القناة —*\n\n` +
            `🆔 *المعرف:* ${metadata.id}\n` +
            `📌 *الاسم:* ${metadata.name}\n` +
            `👥 *عدد المشتركين:* ${metadata.subscribers?.toLocaleString() || "غير معروف"}\n` +
            `📅 *تاريخ الإنشاء:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString("ar-EG") : "غير معروف"}\n` +
            `📄 *الوصف:* ${metadata.description || "لا يوجد وصف."}`;

        if (metadata.preview) {
            await conn.sendMessage(m.chat, { 
                image: { url: "https://pps.whatsapp.net" + metadata.preview }, 
                caption 
            });
        } else {
            m.reply(caption);
        }
    } catch (error) {
        console.error("Error:", error);
        m.reply("حدث خطأ! ربما الرابط غير صحيح.");
    }
};

handler.help = ["معلومات-القناة", "معلومات-القناه", "cinfo", "channelinfo", "ci"];
handler.tags = ["info"];
handler.command = ["معلومات-القناة", "معلومات-القناه", "cinfo", "channelinfo", "ci"];
handler.owner = true;

export default handler;