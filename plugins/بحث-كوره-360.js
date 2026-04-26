import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
    try {
        const response = await fetch('https://the-end-api.vercel.app/home/sections/Tools/api/matches/kora360');
        const data = await response.json();

        if (!data.today.length && !data.yesterday.length && !data.tomorrow.length) {
            return await conn.reply(m.chat, "> 🚫 *لم يتم العثور على أي مباريات حالياً.*", m);
        }

        let message = `> ⚽ *مواعيد المباريات اليومية* ⚽\n\n`;

        if (data.today.length) {
            message += `> 📅 *مباريات اليوم* (${new Date().toLocaleDateString('ar-EG')})\n\n`;
            data.today.forEach((match, index) => {
                message += formatMatch(match);
                if (index < data.today.length - 1) message += '\n════════════════════════\n';
            });
            message += '\n\n';
        }

        if (data.yesterday.length) {
            message += `> 📅 *مباريات الأمس*\n\n`;
            data.yesterday.forEach((match, index) => {
                message += formatMatch(match);
                if (index < data.yesterday.length - 1) message += '\n════════════════════════\n';
            });
            message += '\n\n';
        }

        if (data.tomorrow.length) {
            message += `> 📅 *مباريات الغد*\n\n`;
            data.tomorrow.forEach((match, index) => {
                message += formatMatch(match);
                if (index < data.tomorrow.length - 1) message += '\n════════════════════════\n';
            });
        }

        message += `\n> 『ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ   ⃟🌹𝑩𝑶𝑻』⃠🧞‍♀️`;

        await conn.reply(m.chat, message, m);
    } catch (error) {
        console.error('حدث خطأ:', error);
        await conn.reply(m.chat, `> ❌ *حدث خطأ أثناء جلب تفاصيل المباريات:*\n【${error.message}】`, m);
    }
};

function formatMatch(match) {
    return `> 🏆 *البطولة:* ${match.competition || 'غير معروف'}
> ⏰ *الوقت:* ${match.time || 'غير محدد'}
> 🏟️ *الملعب:* ${match.stadium || 'غير معروف'}
> 📺 *القناة:* ${match.channel || 'غير معروف'}
> 🔴 *الحالة:* ${match.status || 'غير معروف'}
> 
> ⚽ ${match.rightTeam.name} ${match.result || 'vs'} ${match.leftTeam.name}
> 
> 📌 ${match.title.split('في دوري')[0]}`;
}

handler.help = ['matches'];
handler.tags = ['tools'];
handler.command = /^(كوره360|كورة360|ماتشات|كورة_360|كوره-360)$/i;
handler.owner = false;

export default handler;