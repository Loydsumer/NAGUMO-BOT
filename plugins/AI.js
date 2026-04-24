import axios from "axios";

const chatModels = {
  gpt: {
    name: "openai",
    description: "🎯 GPT-4o-mini | (موديل أساسي)",
    command: "gpt",
    emoji: "🤖"
  },
  gpt4: {
    name: "openai-large",
    description: "🚀 GPT-4o | (موديل متقدم)",
    command: "gpt-pro",
    emoji: "🧠"
  },
  o1: {
    name: "openai-reasoning",
    description: "🧩 o1-mini | (متخصص في المنطق)",
    command: "منطق",
    emoji: "🧮"
  },
  o3: {
    name: "openai-reasoning",
    description: "🔬 o3-mini | (رؤية ومنطق)",
    command: "gpt-plus",
    emoji: "🧿"
  },
  llama: {
    name: "llama",
    description: "🦙 Llama 3.3 | (مفتوح المصدر)",
    command: "ليما",
    emoji: "🌿"
  },
  llamalight: {
    name: "llamalight",
    description: "💡 Llama 3.1 Light",
    command: "ليما-برو",
    emoji: "✨"
  },
  mistral: {
    name: "mistral",
    description: "🍷 Mistral Nemo | (فرنسي)",
    command: "نيمو",
    emoji: "🇫🇷"
  },
  claude: {
    name: "claude",
    description: "🎩 Claude 3.5 Haiku",
    command: "claude",
    emoji: "📜"
  },
  gemini: {
    name: "gemini",
    description: "💠 Gemini Flash | (من جوجل)",
    command: "جيمناي-فلاش",
    emoji: "♠️"
  },
  geminit: {
    name: "gemini-thinking",
    description: "🔮 Gemini Thinking",
    command: "جيمناي-بلسو",
    emoji: "🧘‍♂️"
  },
  qwen: {
    name: "qwen-coder",
    description: "👨‍💻 Qwen Coder 32B",
    command: "كوين",
    emoji: "💻"
  },
  deepseek: {
    name: "deepseek",
    description: "🌌 DeepSeek-V3",
    command: "ديب-سييك",
    emoji: "🔍"
  },
  deepseekr1: {
    name: "deepseek-r1",
    description: "🧠 DeepSeek-R1 Distill",
    command: "ديب-برو",
    emoji: "🧬"
  },
  deepseekr2: {
    name: "deepseek-reasoner",
    description: "🧠 DeepSeek Reasoner",
    command: "ديب-بلس",
    emoji: "🔭"
  },
  phi: {
    name: "phi",
    description: "📡 Phi-4 | (من مايكروسوفت)",
    command: "مايكروسوفت",
    emoji: "🪐"
  }
};

const pollinations = {
  api: {
    chat: "https://text.pollinations.ai",
  },
  header: {
    'Connection': 'keep-alive',
    'sec-ch-ua-platform': '"Android"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="136", "Android WebView";v="136", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'Accept': '*/*',
    'Origin': 'https://freeai.aihub.ren',
    'X-Requested-With': 'mark.via.gp',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://freeai.aihub.ren/',
    'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7'
  }
};

async function chatWithPollinations(model, question) {
  try {
    const res = await axios.get(`${pollinations.api.chat}/${encodeURIComponent(question)}`, {
      params: { model },
      headers: pollinations.header,
      timeout: 15000,
    });
    return res.data;
  } catch (e) {
    if (e.code === 'ECONNABORTED') throw new Error("⏱ الخادم تأخر بالرد.");
    throw new Error(`❌ خطأ: ${e.message}`);
  }
}

const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    let helpMessage = `╭─⊷ 🤖 *أوامر الذكاء الاصطناعي* ⊶─╮\n\n`;
    for (const key in chatModels) {
      const model = chatModels[key];
      helpMessage += ` ${model.emoji} *${model.description}*\n`;
      helpMessage += `   ┗ ${usedPrefix}${model.command} <سؤالك>\n`;
    }
    helpMessage += `\n📌 *مثال:* ${usedPrefix}gpt ما هو الذكاء الاصطناعي؟`;
    helpMessage += `\n╰─⊷ أرسل أمرك الآن! ⊶─╯`;
    return conn.sendMessage(m.chat, { text: helpMessage }, { quoted: m });
  }

  const selectedModel = Object.entries(chatModels).find(([_, val]) => val.command?.toLowerCase() === command.toLowerCase());
  if (!selectedModel) {
    return conn.sendMessage(m.chat, { text: `❌ الأمر غير معروف.` }, { quoted: m });
  }

  const [modelKey, model] = selectedModel;

  try {
    const processingMsg = await conn.sendMessage(m.chat, {
      text: `⏳ جاري معالجة سؤالك باستخدام *${model.description}*...`
    }, { quoted: m });

    const answer = await chatWithPollinations(model.name, text);

    const modelImages = {
      gpt: 'https://files.catbox.moe/6g1s0u.jpg',
      gpt4: 'https://raw.githubusercontent.com/RADIOdemon6-alt/uploads/main/uploads/e9613465cd-file_1761726120421.jpg',
      o1: 'https://files.catbox.moe/3c4f65.jpg',
      mistral: 'https://files.catbox.moe/8lwsab.jpg',
      llama: 'https://files.catbox.moe/6u4fp4.jpg',
      claude: 'https://files.catbox.moe/6jm80y.jpg',
      deepseek: 'https://qu.ax/KjTDQ.jpg',
      phi: 'https://files.catbox.moe/0owdpg.jpg',
      qwen: 'https://files.catbox.moe/fzenmv.jpg',
      deepseekr1: 'https://files.catbox.moe/10b915.jpg',
      deepseekr2: 'https://files.catbox.moe/10b915.jpg'
    };

    if (modelImages[modelKey]) {
      await conn.sendMessage(m.chat, {
        image: { url: modelImages[modelKey] },
        caption: `${model.emoji} *${model.description}*\n\n${answer}`
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        text: `${model.emoji} *${model.description}*\n\n${answer}`,
        edit: processingMsg.key
      });
    }

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, {
      text: `❌ خطأ: ${error.message}\n\nجرب مرة أخرى أو استخدم موديلاً آخر.`
    }, { quoted: m });
  }
};

handler.help = Object.values(chatModels).map(m => `${m.command} <سؤالك>`);
handler.tags = ['ai'];
handler.command = new RegExp(`^(${Object.values(chatModels).map(m => m.command).join("|")})$`, "i");

export default handler;