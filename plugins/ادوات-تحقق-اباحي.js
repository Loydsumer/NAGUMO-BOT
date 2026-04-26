import axios from 'axios';
import FormData from 'form-data';
import * as cheerio from 'cheerio';

const handler = async (m, { conn, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    if (!mime) {
      return conn.reply(m.chat, `🧞‍♀️ يرجى إرسال صورة أو الرد على صورة لاستخدام هذا الأمر
مثال: 
*.${command}* أو *.تحقق-اباحي*
ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`, m);
    }

    const media = await q.download();
    const res = await nsfw.check(media);
    if (!res.success) throw res.result.error;

    await conn.reply(m.chat, `🧞‍♀️ النتيجة: *${res.result.labelName}* 🧞‍♀️\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`, m);
  } catch (error) {
    console.error('Error:', error);
    await conn.reply(m.chat, `🧞‍♀️ حدث خطأ: ${error.message} 🧞‍♀️\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`, m);
  }
};

handler.help = ['nsfwc', 'checknsfw', 'تحقق-اباحي'];
handler.tags = ['tools'];
handler.command = /^(nsfwc|checknsfw|تحقق-اباحي)$/i;
handler.limit = true;
export default handler;

const nsfw = {
  api: {
    base: 'https://www.nyckel.com',
    endpoint: {
      invoke: '/v1/functions',
      identifier: '/pretrained-classifiers/nsfw-identifier'
    }
  },
  headers: {
    'authority': 'www.nyckel.com',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'content-type': 'application/x-www-form-urlencoded',
    'origin': 'https://www.nyckel.com',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  cli: axios.create({
    timeout: 30000,
    validateStatus: (s) => s >= 200 && s < 500
  }),
  getToken: async () => {
    try {
      const r = await nsfw.cli.get(nsfw.api.base + nsfw.api.endpoint.identifier, {
        headers: nsfw.headers
      });
      const $ = cheerio.load(r.data);
      const t = $('script[src*="embed-image.js"]').attr('src')?.match(/[?&]id=([^&]+)/)?.[1];
      return t ? { ok: true, t } : { ok: false, e: "🧞‍♀️ رمز التحقق غير صالح 🧞‍♀️" };
    } catch (e) {
      return { ok: false, e: "🧞‍♀️ فشل الحصول على الرمز 🧞‍♀️" };
    }
  },
  check: async (buffer) => {
    try {
      const tk = await nsfw.getToken();
      if (!tk.ok) return tk;
      const f = new FormData();
      f.append('file', buffer, 'image.jpg');
      const r = await nsfw.cli.post(
        `${nsfw.api.base}${nsfw.api.endpoint.invoke}/${tk.t}/invoke`,
        f, {
          headers: {
            ...nsfw.headers,
            ...f.getHeaders()
          }
        }
      );
      return {
        success: true,
        result: {
          labelName: r.data.labelName
        }
      };
    } catch (e) {
      return {
        success: false,
        result: {
          error: e.message
        }
      };
    }
  }
};