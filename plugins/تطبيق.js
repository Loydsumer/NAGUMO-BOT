import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const { proto, generateWAMessageFromContent } = baileys;

async function sendList(conn, jid, data, quoted) {
    const msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({ text: data.body }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: data.footer }),
                    header: proto.Message.InteractiveMessage.Header.create({ title: data.title }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: '📲 اختر تطبيق APK لتحميله',
                                sections: data.sections
                            })
                        }]
                    })
                })
            }
        }
    }, { quoted });

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
}

let handler = async (m, { conn, args, text, command }) => {
    if (!text) {
        return m.reply(`📦 *تحميل تطبيقات APK مع ملفات OBB إن وجدت*\n\nمثال:\n.تطبيق free fire`);
    }

    // إذا كانت المدخلة تبدو مثل اسم الحزمة (تم اختيارها من القائمة)
    if (/^com\./i.test(text.trim())) {
        await m.reply("⏬ جاري تحميل تطبيق APK المحدد...");
        try {
            const info = await تطبيقinfo(text.trim());
            const res = await تطبيق(text.trim());

            if (res.size > 2000000000) {
                throw '*❌ حجم ملف APK كبير جداً. الحد الأقصى: 2GB*';
            }

            await conn.sendMessage(m.chat, {
                image: { url: info.icon },
                caption: `*اسم التطبيق:* ${info.name}\n*الحزمة:* ${info.packageN}\n\n💾 جاري تحميل الملف...`,
                footer: 'مُحمّل APK',
                quoted: m
            });

            await conn.sendMessage(
                m.chat,
                { document: { url: res.download }, mimetype: res.mimetype, fileName: res.fileName },
                { quoted: m }
            );

            if (info.obb) {
                await m.reply(`📦 جاري تحميل ملف OBB لـ ${info.name}...`);

                const obbRes = await fetch(info.obb_link, { method: 'HEAD' });
                const obbMimetype = obbRes.headers.get('content-type');

                const obbFileName = decodeURIComponent(info.obb_link.split('/').pop().split('?')[0]);

                await conn.sendMessage(
                    m.chat,
                    { document: { url: info.obb_link }, mimetype: obbMimetype, fileName: obbFileName },
                    { quoted: m }
                );
            }
        } catch (e) {
            console.error(e);
            await m.reply("❌ فشل في تحميل APK.");
        }
        return;
    }

    // وضع البحث
    await m.reply("🔍 جاري البحث عن تطبيقات APK...");
    try {
        const apps = await searchApkList(text);
        if (!apps.length) return m.reply("❌ لم يتم العثور على أي تطبيقات.");

        const sections = [{
            title: "📱 نتائج البحث",
            rows: apps.map(app => ({
                title: app.name,
                description: app.package,
                id: `.تطبيق ${app.package}`
            }))
        }];

        await sendList(conn, m.chat, {
            title: "📲 قائمة تطبيقات APK",
            body: "🔽 اختر تطبيقًا لتحميله",
            footer: "مدعوم من Aptoide",
            sections
        }, m);
    } catch (e) {
        console.error(e);
        await m.reply("❌ حدث خطأ أثناء جلب التطبيقات.");
    }
};

handler.command = /^تطبيق$/i;
handler.help = ['تطبيق'];
handler.tags = ['downloader'];
handler.premium = false;
handler.register = false;

export default handler;

// 🔧 الدوال المساعدة

async function searchApkList(query) {
    const res = await fetch('http://ws75.aptoide.com/api/7/apps/search?query=' + encodeURIComponent(query) + '&limit=10');
    const json = await res.json();
    return json.datalist.list.map(app => ({
        name: app.name,
        package: app.package
    }));
}

async function تطبيقinfo(packageName) {
    const res = await fetch('http://ws75.aptoide.com/api/7/apps/search?query=' + encodeURIComponent(packageName) + '&limit=1');
    const json = await res.json();
    const app = json.datalist.list[0];

    if (!app) throw '❌ لم يتم العثور على التطبيق.';

    let obb_link, obb = false;
    try {
        obb_link = app.obb.main.path;
        obb = true;
    } catch {
        obb_link = null;
    }

    return {
        obb,
        obb_link,
        name: app.name,
        icon: app.icon,
        packageN: app.package
    };
}

async function تطبيق(packageName) {
    const res = await fetch('http://ws75.aptoide.com/api/7/apps/search?query=' + encodeURIComponent(packageName) + '&limit=1');
    const json = await res.json();
    const app = json.datalist.list[0];

    const download = app.file.path;
    const fileName = app.package + '.تطبيق';
    const head = await fetch(download, { method: 'HEAD' });
    const size = head.headers.get('content-length');
    const mimetype = head.headers.get('content-type');

    return { fileName, mimetype, download, size };
}