/*
كود بحث على موقع اكوام للأفلام و المسلسلات معا تحميل
BY OBITO MR
https://whatsapp.com/channel/0029Vb6dsyP3rZZgNJUD2F1A
*/

import axios from 'axios';
import baileys from '@whiskeysockets/baileys';

const { proto, generateWAMessageFromContent} = baileys;

async function sendList(conn, jid, data, quoted) {
    const msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({ text: data.body}),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: data.footer}),
                    header: proto.Message.InteractiveMessage.Header.create({ title: data.title}),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: data.buttonText,
                                sections: data.sections
})
}]
})
})
}
}
}, { quoted});

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id});
}

const handler = async (m, { conn, args, text, command, usedPrefix}) => {
    const selected = m?.listResponseMessage?.singleSelectReply?.selectedRowId;
    const query = selected || text?.trim();
    if (!query) return m.reply('المرجو تقديم بعد الامر اسم الفيلم او المسلسل للبحث على موقع اكوام');

    if (query.startsWith('http://go.ak.sv/')) {
        await m.reply("⏳ جاري تحميل الجودة المطلوبة...");
        const dl = await axios.get(`https://obito-mr-apis.vercel.app/api/download/akwam_link?url=${encodeURIComponent(query)}`);
        return await conn.sendMessage(m.chat, { document: { url: dl.data.videoLink }, mimetype: 'video/mp4', fileName: `${dl.data.title || 'video'}.mp4` }, { quoted: m });
}

    if (query.startsWith('https://ak.sv/')) {
        const info = await axios.get(`https://obito-mr-apis.vercel.app/api/search/akwam_episode?url=${encodeURIComponent(query)}`).then(r => r.data);

        if (info.type === 'movie') {
            const sections = [{
                title: "🎬 الجودات المتوفرة",
                rows: info.qualities.flatMap(q =>
                    q.links.map(link => ({
                        title: link.text,
                        description: link.size,
                        id: `${usedPrefix}${command} ${link.href}`
}))
)
}];

            return await sendList(conn, m.chat, {
                title: info.title,
                body: `🎥 عدد الجودات: ${info.totalQualities}\n🔗 صورة: ${info.image || 'غير متوفرة'}`,
                footer: 'BY OBITO MR',
                buttonText: '📥 اختر الجودة',
                sections
}, m);
}

        if (info.type === 'series') {
            const sections = [{
                title: "📺 الحلقات",
                rows: info.episodes.map(ep => ({
                    title: ep.title,
                    description: ep.date,
                    id: `${usedPrefix}${command} ${ep.link}`
}))
}];

            return await sendList(conn, m.chat, {
                title: info.title,
                body: `📖 القصة: ${info.story}\n📦 عدد الحلقات: ${info.totalEpisodes}\n🔗 صورة: ${info.episodes[0]?.thumbnail || 'غير متوفرة'}`,
                footer: 'BT OBITO MR',
                buttonText: '📺 اختر الحلقة',
                sections
}, m);
}

        if (info.type === 'episode') {
            const sections = [{
                title: "📥 الجودات",
                rows: info.qualities.flatMap(q =>
                    q.links.map(link => ({
                        title: link.text,
                        description: link.size,
                        id: `${usedPrefix}${command} ${link.href}`
                        }))
)
}];

            return await sendList(conn, m.chat, {
                title: info.title,
                body: `📄 معلومات: ${info.episodeInfo.quality}\n🔗 صورة: ${info.image || 'غير متوفرة'}`,
                footer: 'BY OBITO MR',
                buttonText: '📥 اختر الجودة',
                sections
}, m);
}
}

    await m.reply("🔍 جاري البحث عن نتائج...");
    try {
        const search = await axios.get(`https://obito-mr-apis.vercel.app/api/search/akwam?name=${encodeURIComponent(query)}`);
        const results = search.data.preview;
        if (!results || results.length === 0) return m.reply("❌ لم يتم العثور على نتائج.");

        const chunkSize = 10;
        const sections = [];
        for (let i = 0; i < results.length; i += chunkSize) {
            const chunk = results.slice(i, i + chunkSize);
            const sectionTitle = i === 0
? `🔍 أفضل النتائج لـ "${query}"`
: `📊 النتائج ${i + 1}-${Math.min(i + chunkSize, results.length)}`;

            sections.push({
                title: sectionTitle,
                rows: chunk.map((item, index) => ({
                    title: `${item.type} ${index + 1}. ${item.title.substring(0, 60)}${item.title.length> 60? '...': ''}`,
                    description: `${item.year} | ${item.quality} | تقييم: ${item.rating}`,
                    id: `${usedPrefix}${command} ${item.link}`
}))
});
}

        const random = results[Math.floor(Math.random() * results.length)];

        await sendList(conn, m.chat, {
            title: "🎬 نتائج البحث من Akwam",
            body: `📽️ تم العثور على ${results.length} نتيجة لكلمة "${query}"\n🔗 صورة: ${random.image}`,
            footer: "BY OBITO MR",
            buttonText: '📥 اختر من القائمة',
            sections
}, m);

} catch (e) {
        console.error(e);
        await m.reply(`❌ حدث خطأ أثناء البحث:\n${e.message}`);
}
};

handler.command = ['فيلم'];
handler.help = ['فليم'];
handler.tags = ['البحث'];
handler.register = true;

export default handler;