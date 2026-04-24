import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import * as FT from "file-type";

const fromBuffer = FT.fromBuffer || (FT.default && FT.default.fromBuffer);

async function uploadBuffer(buffer, filename = "file.bin", token = "", folderId = "") {
  const form = new FormData();
  if (token) form.append("token", token);
  if (folderId) form.append("folderId", folderId);
  form.append("file", buffer, { filename, contentType: "application/octet-stream" });

  const headers = {
    ...form.getHeaders(),
    Origin: "https://gofile.io",
    Referer: "https://gofile.io/",
    "User-Agent": "Mozilla/5.0"
  };

  const res = await axios.post("https://upload.gofile.io/uploadfile", form, {
    headers,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });
  return res.data;
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let token = "";
    let folderId = "";
    let buffer;
    let filename = "file.bin";

    if (m.quoted && (m.quoted.mimetype || m.quoted.mediaMessage)) {
      buffer = await m.quoted.download();
      const type = fromBuffer ? await fromBuffer(buffer) : null;
      filename = type?.ext ? `upload.${type.ext}` : filename;
    } else if (args[0] && args[0].startsWith("http")) {
      const { data } = await axios.get(args[0], { responseType: "arraybuffer" });
      buffer = Buffer.from(data);
      filename = args[0].split("/").pop().split("?")[0] || filename;
    } else {
      return m.reply(`📤 أرسل الأمر بالرد على ملف أو أضف رابط بعد الأمر.\nمثال:\n${usedPrefix + command} أو ${usedPrefix + command} https://example.com/file.mp4`);
    }

    m.reply("⏳ جاري رفع الملف إلى GoFile...");

    const result = await uploadBuffer(buffer, filename, token, folderId);

    if (!result.status || result.status !== "ok") throw new Error(JSON.stringify(result));
    const url = result.data.downloadPage || result.data.directLink || result.data.link;

    await conn.sendMessage(m.chat, { text: `✅ تم رفع الملف بنجاح!\n📎 الرابط:\n${url}` }, { quoted: m });
  } catch (err) {
    console.error(err);
    m.reply(`❌ فشل الرفع إلى GoFile\n${err.message}`);
  }
};

handler.help = ["gofile"];
handler.tags = ["tools"];
handler.command = /^gofile$/i;

export default handler;