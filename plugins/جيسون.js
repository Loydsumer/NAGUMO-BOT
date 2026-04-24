import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply("❌ أرسل رابط API بعد الأمر.\nمثال: .جيسون https://kddolusbdvuovjpnmmvl.supabase.co/rest/v1/profiles?select=*");

    await m.reply("🔄 جاري جلب البيانات...");

    // طلب API
    const res = await fetch(text, {
      headers: {
        "Content-Type": "application/json",
        // لو عندك apikey ضيفه هنا 👇
        // "apikey": "YOUR_SUPABASE_KEY",
        // "Authorization": "Bearer YOUR_SUPABASE_KEY"
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    const json = await res.json();

    // نرسله كـ JSON نصي
    await conn.sendMessage(
      m.chat,
      { text: "📦 JSON:\n```json\n" + JSON.stringify(json, null, 2).slice(0, 4000) + "\n```" },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    m.reply(`❌ خطأ: ${err.message}`);
  }
};

handler.command = ["جيسون"];
export default handler;