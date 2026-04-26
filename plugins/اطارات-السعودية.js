import fs from 'fs';
import Jimp from 'jimp';

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime.startsWith("image/")) {
        return await m.reply("*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*المرجو عمل ريبليت على صوره التي تريد عمل عليها اطار السعودية 🇸🇦*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*");
    }

    try {
        await m.react('⏳'); 


        let media = await q.download(true);
        let userImage = await Jimp.read(media);


        let background = await Jimp.read("https://qu.ax/pDfXT.png");


        let circleSize = Math.floor(Math.min(background.bitmap.width, background.bitmap.height) * 0.9);
        userImage.cover(circleSize, circleSize);
        userImage.circle();


        let posX = Math.floor((background.bitmap.width - circleSize) / 2); 
        let posY = Math.floor((background.bitmap.height - circleSize) / 2); 


        background.composite(userImage, posX, posY);


        let filePath = "./output_image_with_background.png";
        await background.writeAsync(filePath);


        await conn.sendMessage(m.chat, { image: fs.readFileSync(filePath), caption: "*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*𝑀𝐼𝑁𝐴𝑇𝛩 𝐵𝛩𝑇*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*" });


        await fs.promises.unlink(filePath);
        await m.react('🇸🇦'); 
    } catch (error) {
        console.error("❌ حدث خطأ أثناء معالجة الصورة:", error);
        await m.reply("❌ حدث خطأ أثناء معالجة الصورة مع الخلفية.");
        await m.react('❌');
    }
};

handler.help = ["اوبيتو"];
handler.tags = ["اوبيتو"];
handler.command = /^السعودية$/i;

export default handler;