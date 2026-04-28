import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const { proto, generateWAMessageFromContent } = baileys;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 دالة إرسال القائمة التفاعلية (Carousel / List)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function sendApkList(conn, jid, apps, quoted) {
    const sections = [{
        title: "📱 *نتائج البحث*",
        rows: apps.map(app => ({
            title: app.name,
            description: `📦 ${app.package}`,
            id: `.app ${app.package}`
        }))
    }];

    const interactiveMessage = proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({ 
            text: "⬇️ *اختر التطبيق الذي تريد تحميله* ⬇️" 
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({ 
            text: "⚡ 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 · Aptoide Downloader" 
        }),
        header: proto.Message.InteractiveMessage.Header.create({ 
            title: "📲 قائمة تطبيقات APK" 
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: "📋 اختر تطبيقاً",
                    sections
                })
            }]
        })
    });

    const msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: { interactiveMessage }
        }
    }, { quoted });

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 الأمر الرئيسي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let handler = async (m, { conn, args, text, command }) => {
    const react = async (emoji) => {
        try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }); } catch {}
    };

    if (!text) {
        await react('❌');
        return m.reply(
            `╭─── 📦 *تحميل تطبيقات APK* ───╮
│
│ 🔍 *الاستخدام:*
│ ${command} <اسم التطبيق>
│
│ 📝 *أمثلة:*
│ ▸ ${command} facebook
│ ▸ ${command} free fire
│
╰─── ⚡ 𝐂𝐇𝐄𝐎𝐍 𝐁𝐎𝐓 ───╯`
        );
    }

    // ─── إذا كان الإدخال هو اسم الحزمة (مختار من القائمة) ───
    if (/^com\./i.test(text.trim())) {
        await react('⏳');
        await m.reply('⏳ *جاري تحميل التطبيق...*');
        
        try {
            const info = await getAppInfo(text.trim());
            const download = await getDownloadLink(text.trim());

            if (download.size > 2_000_000_000) {
                throw new Error('❌ حجم ملف APK كبير جداً (أكبر من 2GB)');
            }

            // إرسال صورة التطبيق + معلوماته
            await conn.sendMessage(m.chat, {
                image: { url: info.icon },
                caption: `╭─── 📱 *${info.name}* ───╮
│
│ 📦 *الحزمة:* ${info.package}
│ 💾 *الحجم:* ${(download.size / 1024 / 1024).toFixed(2)} MB
│
╰─── ⚡ جاري التحميل... ───╯`
            }, { quoted: m });

            // إرسال ملف APK
            await conn.sendMessage(m.chat, {
                document: { url: download.url },
                mimetype: download.mimetype,
                fileName: `${info.name}.apk`
            }, { quoted: m });

            // ─── إذا كان هناك ملف OBB ───
            if (info.obb && info.obbLink) {
                await m.reply(`📦 *جاري تحميل ملف OBB الخاص بـ ${info.name}...*`);
                await conn.sendMessage(m.chat, {
                    document: { url: info.obbLink },
                    mimetype: 'application/octet-stream',
                    fileName: `obb_${info.package}.zip`
                }, { quoted: m });
            }

            await react('✅');
            await m.reply('✅ *تم التحميل بنجاح!*');
        } catch (err) {
            console.error(err);
            await react('❌');
            await m.reply(`❌ *فشل التحميل:* ${err.message}`);
        }
        return;
    }

    // ─── البحث عن التطبيقات ───
    await react('🔍');
    await m.reply('🔍 *جاري البحث عن التطبيقات...*');

    try {
        const apps = await searchAptoide(text);
        if (!apps.length) {
            await react('❌');
            return m.reply(`❌ *لم يتم العثور على تطبيقات لـ:* ${text}`);
        }

        await sendApkList(conn, m.chat, apps, m);
        await react('📱');
    } catch (err) {
        console.error(err);
        await react('❌');
        await m.reply('❌ *حدث خطأ أثناء البحث.*');
    }
};

handler.command = /^(تطبيق|app)$/i;
handler.help = ['تطبيق <اسم>', 'app <name>'];
handler.tags = ['downloader'];
handler.premium = false;
handler.register = false;

export default handler;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛠️ الدوال المساعدة
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function searchAptoide(query) {
    const url = `http://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=10`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.datalist?.list) return [];
    return json.datalist.list.map(app => ({
        name: app.name,
        package: app.package
    }));
}

async function getAppInfo(packageName) {
    const url = `http://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(packageName)}&limit=1`;
    const res = await fetch(url);
    const json = await res.json();
    const app = json.datalist?.list?.[0];
    if (!app) throw new Error('التطبيق غير موجود');

    let obbLink = null;
    let hasObb = false;
    try {
        if (app.obb?.main?.path) {
            obbLink = app.obb.main.path;
            hasObb = true;
        }
    } catch {}

    return {
        name: app.name,
        package: app.package,
        icon: app.icon,
        obb: hasObb,
        obbLink
    };
}

async function getDownloadLink(packageName) {
    const url = `http://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(packageName)}&limit=1`;
    const res = await fetch(url);
    const json = await res.json();
    const app = json.datalist?.list?.[0];
    if (!app) throw new Error('التطبيق غير موجود');

    const downloadUrl = app.file?.path;
    if (!downloadUrl) throw new Error('رابط التحميل غير متوفر');

    // الحصول على حجم الملف
    const head = await fetch(downloadUrl, { method: 'HEAD' });
    const size = parseInt(head.headers.get('content-length') || '0');
    const mimetype = head.headers.get('content-type') || 'application/vnd.android.package-archive';

    return {
        url: downloadUrl,
        size,
        mimetype
    };
}