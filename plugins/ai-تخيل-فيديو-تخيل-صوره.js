import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';
 
const aiLabs = {
  api: {
    base: 'https://text2video.aritek.app',
    endpoints: {
      text2img: '/text2img',
      generate: '/txt2videov3',
      video: '/video'
    }
  },
 
  headers: {
    'user-agent': 'NB Android/1.0.0',
    'accept-encoding': 'gzip',
    'content-type': 'application/json',
    authorization: ''
  },
 
  state: {
    token: null
  },
 
  setup: {
    cipher: 'hbMcgZLlzvghRlLbPcTbCpfcQKM0PcU0zhPcTlOFMxBZ1oLmruzlVp9remPgi0QWP0QW',
    shiftValue: 3,
 
    dec(text, shift) {
      return [...text].map(c =>
        /[a-z]/.test(c)
          ? String.fromCharCode((c.charCodeAt(0) - 97 - shift + 26) % 26 + 97)
          : /[A-Z]/.test(c)
          ? String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65)
          : c
      ).join('');
    },
 
    decrypt: async () => {
      if (aiLabs.state.token) return aiLabs.state.token;
      const input = aiLabs.setup.cipher;
      const shift = aiLabs.setup.shiftValue;
      const decrypted = aiLabs.setup.dec(input, shift);
      aiLabs.state.token = decrypted;
      aiLabs.headers.authorization = decrypted;
      return decrypted;
    }
  },
 
  deviceId() {
    return Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  },
 
  text2img: async (prompt) => {
    if (!prompt?.trim()) {
      return {
        success: false,
        code: 400,
        result: { 
          error: '👻 الاستعجال لا يفيد... أعطني وصفًا للصورة يا صديقي.'
        }
      };
    }
    const token = await aiLabs.setup.decrypt();
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('token', token);
    try {
      const url = aiLabs.api.base + aiLabs.api.endpoints.text2img;
      const res = await axios.post(url, form, {
        headers: {
          ...aiLabs.headers,
          ...form.getHeaders()
        }
      });
      const { code, url: imageUrl } = res.data;
      if (code !== 0 || !imageUrl) {
        return {
          success: false,
          code: res.status,
          result: { error: '👻 فشلت العملية... ليس كل طلب يُجاب.' }
        };
      }
      return {
        success: true,
        code: res.status,
        result: {
          url: imageUrl.trim(),
          prompt
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: {
          error: err.message || '👻 حدث خطأ غير متوقع...'
        }
      };
    }
  },
 
  generate: async ({ prompt = '', type = 'video', isPremium = 1 } = {}) => {
    if (!prompt?.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: '👻 لا أستطيع أن أعمل بلا وصف.' }
      };
    }
    if (!/^(image|video)$/.test(type)) {
      return {
        success: false,
        code: 400,
        result: { error: '👻 النوع غير صحيح... اختر صورة أو فيديو.' }
      };
    }
    if (type === 'image') {
      return await aiLabs.text2img(prompt);
    } else {
      await aiLabs.setup.decrypt();
      const payload = {
        deviceID: aiLabs.deviceId(),
        isPremium,
        prompt,
        used: [],
        versionCode: 59
      };
      try {
        const url = aiLabs.api.base + aiLabs.api.endpoints.generate;
        const res = await axios.post(url, payload, { headers: aiLabs.headers });
        const { code, key } = res.data;
        if (code !== 0 || !key || typeof key !== 'string') {
          return {
            success: false,
            code: res.status,
            result: { error: '👻 فشلت في الحصول على المفتاح... أعد المحاولة لاحقًا.' }
          };
        }
        return await aiLabs.video(key);
      } catch (err) {
        return {
          success: false,
          code: err.response?.status || 500,
          result: { error: err.message || '👻 لا يمكن الاتصال بالخادم الآن.' }
        };
      }
    }
  },
 
  video: async (key) => {
    if (!key || typeof key !== 'string') {
      return {
        success: false,
        code: 400,
        result: { error: '👻 المفتاح غير صالح... العملية أُلغيت.' }
      };
    }
    await aiLabs.setup.decrypt();
    const payload = { keys: [key] };
    const url = aiLabs.api.base + aiLabs.api.endpoints.video;
    const maxAttempts = 100;
    const delay = 2000;
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        const res = await axios.post(url, payload, {
          headers: aiLabs.headers,
          timeout: 15000
        });
        const { code, datas } = res.data;
        if (code === 0 && Array.isArray(datas) && datas.length > 0) {
          const data = datas[0];
          if (!data.url || data.url.trim() === '') {
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
          return {
            success: true,
            code: res.status,
            result: {
              url: data.url.trim(),
              safe: data.safe === 'true',
              key: data.key,
              progress: '100%'
            }
          };
        }
      } catch (err) {
        const retry = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT'].includes(err.code);
        if (retry && attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        return {
          success: false,
          code: err.response?.status || 500,
          result: { error: '👻 فشل أثناء توليد الفيديو.', attempt }
        };
      }
    }
    return {
      success: false,
      code: 504,
      result: { error: '👻 العملية استغرقت وقتًا طويلًا.', attempt }
    };
  }
};
 
let handler = async (m, { conn, args, command }) => {
  try {
    if (!args[0]) {
      let usageMsg = '';
      if (/^(aivideo|تخيل-فيديو)$/i.test(command)) {
        usageMsg = `👻 الإصغاء مهم...  
أنت تريد فيديو؟ إذًا أعطني وصفك.  

✦ *مثال:*  
\`.تخيل-فيديو معركة ملحمية بين فرسان\``;
      } else if (/^(aiimage|تخيل-صوره)$/i.test(command)) {
        usageMsg = `👻 الإصغاء مهم...  
أنت تريد صورة؟ إذًا صِف ما تريد.  

✦ *مثال:*  
\`.تخيل-صوره قصر مظلم في ليلة عاصفة\``;
      }
      return m.reply(usageMsg + "\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻");
    }

    let prompt = args.join(' ');
    switch (command) {
      case 'aivideo':
      case 'تخيل-فيديو':
        var res = await aiLabs.generate({ prompt, type: 'video' });
        if (res?.result?.url) await conn.sendMessage(m.chat, { video: { url: res.result.url }, caption: "👻 هذا ما طلبته..." }, { quoted: m });
        break;
      case 'aiimage':
      case 'تخيل-صوره':
        var res = await aiLabs.text2img(prompt);
        if (res?.result?.url) await conn.sendMessage(m.chat, { image: { url: res.result.url }, caption: "👻 هذه هي الصورة التي وصفتها..." }, { quoted: m });
        break;
    }
  } catch (e) {
    m.reply("👻 حدث خطأ: " + e.message + "\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻");
  }
};
 
handler.help = ['aivideo', 'aiimage', 'تخيل-فيديو', 'تخيل-صوره'];
handler.command = ['aivideo', 'aiimage', 'تخيل-فيديو', 'تخيل-صوره'];
handler.tags = ['ai'];
 
export default handler;