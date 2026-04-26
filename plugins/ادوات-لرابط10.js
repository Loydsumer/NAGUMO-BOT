import axios from "axios";
import fetch from "node-fetch";
import cheerio from "cheerio";
import fs from "fs";
import request from "request";
import { fileTypeFromBuffer } from 'file-type';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!/image/g.test(mime)) throw "🧞‍♀️ يرجى الرد على صورة فقط";
    
    let media = await q.download();
    let link = await top4top(media);
    let { result, status } = link;
    let caption = `🧞‍♀️ *[ ${status.toUpperCase()} ]*

📮 *الرابط :*
${result}
📊 *الحجم :* ${media.length} بايت`;

    conn.reply(m.chat, caption, m);
};

handler.help = ["top4top", "لرابط10"];
handler.tags = ["tools"];
handler.command = /^(top4top|لرابط10)$/i;
export default handler;

async function top4top(baper) {
    return new Promise(async (resolve, reject) => {
        const { ext } = await fileTypeFromBuffer(baper) || {};
        var req = await request({
                url: "https://top4top.io/index.php",
                method: "POST",
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "ar-SA,ar;q=0.9",
                    "cache-control": "max-age=0",
                    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryAmIhdMyLOrbDawcA',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            },
            function(error, response, body) {
                if (error) { return resolve({
                    result: 'error'
                }) }
                const $ = cheerio.load(body);
                let result = $('div.alert.alert-warning > ul > li > span').find('a').attr('href') || "فشل الرفع";
                if (result == "فشل الرفع") {
                    resolve({
                        status: "خطأ",
                        msg: "🧞‍♀️ ربما الملف غير مسموح أو جرّب ملفًا آخر"
                    });
                }
                resolve({
                    status: "نجاح",
                    result
                });
            });
        let form = req.form();
        form.append('file_1_', baper, {
            filename: `${Math.floor(Math.random() * 10000)}.` + `${ext}`
        });
        form.append('file_1_', '');
        form.append('submitr', '[ 🧞‍♀️ رفع الملفات ]');
    });
}