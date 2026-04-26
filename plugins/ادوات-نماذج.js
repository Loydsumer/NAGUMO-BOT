import axios from "axios";

let handler = async (m, { conn, command, text }) => {
    if (!text) {
        return m.reply(`🧞‍♀️ *طريقة الاستخدام:*\nاكتب الأمر متبوعًا بوصف الصورة التي تريد إنشاؤهايفضل ان يكون بلغه انجليزيه.\n\n🧞‍♀️ *مثال:*\n\`${command} strange girl \`\n\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`);
    }

    await m.reply(" *جارٍ إنشاء الصورة، انتظر قليلًا...* 🧞‍♀️");

    let { result } = await generateImages(text);
    for (let res of result) {
        await conn.sendFile(m.chat, res.url, '', `🧞‍♀️ *النموذج:* \`${res.model}\` 🧞‍♀️`, m);
    }
};

handler.help = handler.command = ["نماذج", "imageai"];
handler.tags = ["ai"];
handler.register = true;
handler.premium = true;

export default handler;

async function generateImages(prompt) {
    const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const userAgentList = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 Chrome/91.0.4472.77 Mobile Safari/537.36'
    ];
    const models = [
        "غابة متوهجة",
        "فن تجريدي",
        "أميرة",
        "لعبة LOL",
        "رسوم متحركة واقعية",
        "ساحل الغرب",
        "رابسودي الأزرق",
        "غرافيتي",
        "مهرج",
        "جنية"
    ];

    let pull = [];

    for (let i = 0; i < models.length; i++) {
        const randomUserAgent = userAgentList[Math.floor(Math.random() * userAgentList.length)];

        const source = await axios.post(
            'https://restapi.cutout.pro/web/ai/generateImage/generateAsync',
            {
                prompt: prompt,
                style: models[i],
                quantity: 1,
                width: 512,
                height: 512
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": randomUserAgent,
                    "X-Forwarded-For": randomIP,
                    "Referer": "https://www.cutout.pro/ai-art-generation/upload"
                }
            }
        );

        const data = source.data;
        if (!data.data || !data.data.batchId) {
            throw new Error(`🧞‍♀️ لا يمكن استخراج batchId من الاستجابة للنموذج ${models[i]}`);
        }

        const batchId = data.data.batchId;
        let status = false;

        while (!status) {
            const txt2img = await axios.get(
                `https://restapi.cutout.pro/web/ai/generateImage/getGenerateImageTaskResult?batchId=${batchId}`,
                {
                    headers: {
                        "Accept": "application/json, text/plain, */*",
                        "User-Agent": randomUserAgent,
                        "X-Forwarded-For": randomIP,
                        "Referer": "https://www.cutout.pro/ai-art-generation/upload"
                    }
                }
            );

            const image = txt2img.data.data.text2ImageVoList;
            status = image.every(img => img.status === 1);

            if (status) {
                const model_result = image.map(img => ({
                    model: models[i],
                    url: img.resultUrl
                }));
                pull = pull.concat(model_result);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    return { result: pull };
}