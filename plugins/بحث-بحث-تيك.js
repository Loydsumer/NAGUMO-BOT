import fetch from 'node-fetch'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!text) throw `🧞‍♀️ *يرجى إدخال اسم مستخدم تيك توك للبحث عنه.*\n\n🔹 *طريقة الاستخدام:*\n❖ \`${usedPrefix + command} اسم_المستخدم\`\n\n🔹 *مثال:*\n❖ \`${usedPrefix + command} Gata_Dios\``

    try {
        const apiUrl = `${apis}/tools/tiktokstalk?q=${encodeURIComponent(text)}`;
        const apiResponse = await fetch(apiUrl);
        const delius = await apiResponse.json();

        if (!delius || !delius.result || !delius.result.users) return m.react("❌");

        const profile = delius.result.users;
        const stats = delius.result.stats;

        let message = `🧞‍♀️ *معلومات حساب تيك توك*\n
👤 *اسم المستخدم:* ${profile.username}
✨ *الاسم الكامل:* ${profile.nickname}
✅ *موثق:* ${profile.verified ? 'نعم' : 'لا'}
. *عدد المتابعين:* ${stats.followerCount.toLocaleString()}
❇️ *عدد الأشخاص الذين يتابعهم:* ${stats.followingCount.toLocaleString()}
❤️ *إجمالي الإعجابات:* ${stats.heartCount.toLocaleString()}
🎁 *عدد الفيديوهات:* ${stats.videoCount.toLocaleString()}
👀 *السيرة الذاتية:* ${profile.signature}
🔗 *رابط الحساب:* ${profile.url}
ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`.trim()

        let buttons = [
            { buttonId: '#descargasmenu', buttonText: { displayText: '🌀 قائمة التحميلات' }, type: 1 },
            { buttonId: '.allmenu', buttonText: { displayText: '✨ القائمة الكاملة' }, type: 1 },
            { buttonId: '/menu', buttonText: { displayText: '☘️ العودة إلى القائمة الرئيسية' }, type: 1 }
        ];

        let buttonMessage = {
            image: { url: profile.avatarLarger },
            caption: message,
            footer: 'ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ',
            buttons: buttons,
            headerType: 4
        };

        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
        m.react("✅");

    } catch (e) {
        try {
            let res = await fetch(`https://api.lolhuman.xyz/api/stalktiktok/${text}?apikey=${lolkeysapi}`)
            let json = await res.json()

            if (res.status !== 200) throw await res.text()
            if (!json.status) throw json

            let message = `🧞‍♀️ *معلومات حساب تيك توك*\n
👤 *اسم المستخدم:* ${json.result.username}
✨ *الاسم الكامل:* ${json.result.nickname}
. *عدد المتابعين:* ${json.result.followers}
❇️ *عدد الأشخاص الذين يتابعهم:* ${json.result.followings}
❤️ *إجمالي الإعجابات:* ${json.result.likes}
🎁 *عدد الفيديوهات:* ${json.result.video}
👀 *السيرة الذاتية:* ${json.result.bio}
ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`.trim()

            let buttons = [
                { buttonId: '#descargasmenu', buttonText: { displayText: '🌀 قائمة التحميلات' }, type: 1 },
                { buttonId: '.allmenu', buttonText: { displayText: '✨ القائمة الكاملة' }, type: 1 },
                { buttonId: '/menu', buttonText: { displayText: '☘️ العودة إلى القائمة الرئيسية' }, type: 1 }
            ];

            let buttonMessage = {
                caption: message,
                footer: 'ＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ',
                buttons: buttons,
                headerType: 1
            };

            await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
        } catch (e) {
            await conn.reply(m.chat, `🧞‍♀️ *حدث خطأ أثناء جلب البيانات، يرجى المحاولة مرة أخرى لاحقًا.*\n\n📌 *إذا استمرت المشكلة، استخدم الأمر التالي للإبلاغ عنها:*\n❖ \`${usedPrefix}report هناك خطأ في الأمر ${command}\``, m);
            console.log(`❗❗ خطأ في الأمر ${command} ❗❗`);
            console.log(e);
        }
    }
}

handler.help = ['tiktokstalk', 'حساب-تيك'].map(v => v + ' <اسم المستخدم>')
handler.tags = ['stalk']
handler.command = /^(tiktokstalk|حساب-تيك)$/i
handler.register = true

export default handler;