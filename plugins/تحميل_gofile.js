import axios from "axios";
import fs from "fs";
import path from "path";

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply("ارسل الرابط");

  try {
    let code = args[0].split("/d/")[1];
    if (!code) return m.reply("الرابط غلط");

    let api = `https://api.gofile.io/contents/${code}?wt=4fd6sg89d7s6&contentFilter=&page=1&pageSize=1000&sortField=name&sortDirection=1`;
    let token = "61GsqPG6GvISx1LSIkt3rwQhkcdXqBFY";

    let headers = {
      "Authorization": `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "origin": "https://gofile.io",
      "referer": "https://gofile.io/"
    };

    let res = await axios.get(api, { headers });
    if (res.data.status !== "ok") return m.reply("خطأ");

    let data = res.data.data;
    let children = data.children;

    // ----------- تجميع رسالة واحدة فقط -----------
    let msg = `📂 *${data.name}*\n`;
    msg += `📁 عدد الملفات: *${data.childrenCount}*\n`;
    msg += `⬇️ إجمالي التحميلات: *${data.totalDownloadCount}*\n`;
    msg += `━━━━━━━━━━━━━━━\n`;

    for (let id in children) {
      let f = children[id];
      msg += `📄 *${f.name}*\n`;
      msg += `📦 الحجم: *${f.size}*\n`;
      msg += `⬇️ التحميلات: *${f.downloadCount}*\n`;
      msg += `🔗 الرابط: ${f.link}\n`;
      msg += `━━━━━━━━━━━━━━━\n`;
    }

    // إرسال الرسالة النهائية فقط
    await conn.sendMessage(m.chat, { text: msg });

    // ----------- تحميل و إرسال الملفات بدون رسائل إضافية -----------
    for (let id in children) {
      let f = children[id];

      let dl = await axios.get(f.link, {
        responseType: "arraybuffer",
        headers
      });

      let filepath = path.join("/tmp", f.name);
      fs.writeFileSync(filepath, dl.data);

      await conn.sendFile(m.chat, filepath, f.name, "", m);

      fs.unlinkSync(filepath);
    }

  } catch (e) {
    console.log(e);
    m.reply("حصل خطأ");
  }
};

handler.command = ["تحميل_gofile"];
export default handler;