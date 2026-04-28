// plugins/manga.js
// الأوامر: .مانجا، .فصول، .فصل، .تحميل_فصل

import axios from 'axios';
import * as cheerio from 'cheerio';
import baileys from '@whiskeysockets/baileys';
import JSZip from 'jszip';

const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ معالج Rate Limit (تأخير بين الطلبات)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let lastRequestTime = 0;
const MIN_DELAY = 2500;

async function waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_DELAY) {
        await new Promise(r => setTimeout(r, MIN_DELAY - elapsed));
    }
    lastRequestTime = Date.now();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖼️ دالة تجهيز الصور
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_IMAGE = 'https://files.catbox.moe/kl75ae.png';

async function createImageMessage(conn, url) {
    if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
    try {
        const media = await prepareWAMessageMedia({ image: { url } }, { upload: conn.waUploadToServer });
        return media.imageMessage || null;
    } catch {
        return null;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📚 البحث عن المانجا وعرضها في Carousel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchManga(conn, m, query) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('🔍');
    await m.reply(`🔍 *جاري البحث عن:* ${query}...`);

    await waitForRateLimit();

    const searchUrl = `https://mangatuk.com/?s=${encodeURIComponent(query)}&post_type=wp-manga`;
    const { data } = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('.c-tabs-item__content').each((i, el) => {
        if (i >= 10) return;
        const title = $(el).find('.post-title a').text().trim();
        const link = $(el).find('.post-title a').attr('href');
        const img = $(el).find('img').attr('data-src');
        if (title && link) results.push({ title, link, img });
    });

    if (results.length === 0) {
        await react('❌');
        return m.reply(`❌ *لا توجد نتائج لـ:* ${query}\n📌 جرب اسمًا آخر أو تحقق من الإملاء.`);
    }

    const cards = [];
    for (const manga of results) {
        const imageMsg = await createImageMessage(conn, manga.img);
        if (!imageMsg) continue;

        cards.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: `📚 ${manga.title.substring(0, 40)}` }),
            header: proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: true, imageMessage: imageMsg }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [{
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📖 عرض الفصول',
                        id: `.فصول ${manga.link}`
                    })
                }]
            })
        });
    }

    if (cards.length === 0) {
        await react('⚠️');
        return m.reply('⚠️ *حدث خطأ في تحميل الصور، حاول مرة أخرى.*');
    }

    const carouselMsg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: `🔍 *نتائج البحث عن:* ${query}\n📊 *عدد النتائج:* ${results.length}`
                    }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
                })
            }
        }
    }, { quoted: m });

    await conn.relayMessage(m.chat, carouselMsg.message, { messageId: carouselMsg.key.id });
    await react('✅');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📖 جلب الفصول من صفحة المانجا
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function showChapters(conn, m, mangaUrl) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('⏳');
    await m.reply('📖 *جاري جلب الفصول...*');

    await waitForRateLimit();

    const { data } = await axios.get(mangaUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(data);

    // استخراج معلومات المانجا
    const mangaTitle = $('.post-title h1').text().trim() || $('h1').first().text().trim() || 'مانجا';
    const mangaImg = $('.summary_image img').attr('data-src') || $('.summary_image img').attr('src') || DEFAULT_IMAGE;
    
    let mangaType = $('.post-content .summary-content').first().text().trim() || 'مانغا';
    mangaType = mangaType.split(',')[0].substring(0, 30);
    
    let mangaRating = $('.rating-star').text().trim() || '4.5';
    if (!mangaRating.includes('⭐')) mangaRating = `${mangaRating} ⭐`;

    // جلب الفصول
    let chapters = [];
    
    $('.listing-chapters_wrap a, .wp-manga-chapter a, .list-chapters a, .chapter-list a').each((i, el) => {
        const title = $(el).text().trim();
        const link = $(el).attr('href');
        if (title && link && !link.includes('#') && !chapters.some(ch => ch.link === link)) {
            chapters.push({ title, link });
        }
    });

    if (chapters.length === 0) {
        $('a[href*="/manga/"]').each((i, el) => {
            const link = $(el).attr('href');
            if (link && /\/manga\/[^\/]+\/\d+\/?$/.test(link)) {
                const title = $(el).text().trim() || `الفصل ${link.split('/').slice(-2, -1)[0]}`;
                if (!chapters.some(ch => ch.link === link)) {
                    chapters.push({ title, link });
                }
            }
        });
    }

    const seen = new Set();
    chapters = chapters.filter(ch => {
        if (seen.has(ch.link)) return false;
        seen.add(ch.link);
        return true;
    });

    chapters.sort((a, b) => {
        const numA = parseInt(a.link.match(/\/(\d+)\/?$/)?.[1] || 0);
        const numB = parseInt(b.link.match(/\/(\d+)\/?$/)?.[1] || 0);
        return numB - numA;
    });

    if (chapters.length === 0) {
        await react('❌');
        return m.reply('❌ *لا توجد فصول متاحة لهذه المانجا.*');
    }

    // بناء قائمة الفصول (كل فصل له خياران)
    const rows = chapters.slice(0, 30).map((ch, i) => ({
        title: `📖 ${ch.title.substring(0, 40)}`,
        description: `اضغط لعرض الصور`,
        id: `.فصل ${ch.link}`
    }));

    const imageMsg = await createImageMessage(conn, mangaImg);

    const interactiveMessage = proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({
            text: `╭─── 📚 *${mangaTitle.substring(0, 50)}* ───╮
│
│ 🌟 *النوع:* ${mangaType}
│ 📖 *عدد الفصول:* ${chapters.length}
│ ⭐ *التقييم:* ${mangaRating}
│
╰─── 👇 اختر الفصل 👇 ───╯`
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
            text: `⚡ Yoru Manga · ${chapters.length} فصل متاح`
        }),
        header: imageMsg ? proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: true,
            imageMessage: imageMsg
        }) : proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: '📖 اختر الفصل',
                    sections: [{ title: 'الفصول المتاحة', rows }]
                })
            }]
        })
    });

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: { message: { interactiveMessage } }
    }, { quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    
    // إرسال رسالة منفصلة لخيار التحميل الكامل
    await conn.sendMessage(m.chat, {
        text: `📦 *لتحميل أي فصل كاملاً كملف ZIP*، استخدم الأمر:\n\`.تحميل_فصل رابط_الفصل\`\n\n📌 *مثال:*\n\`.تحميل_فصل https://mangatuk.com/manga/one-piece/1133/\``
    }, { quoted: m });

    await react('✅');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📸 عرض صفحات الفصل (منفصلة)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function showChapterPages(conn, m, chapterUrl) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('⏳');
    await m.reply('🎨 *جاري تحميل صور الفصل...*');

    await waitForRateLimit();

    const { data } = await axios.get(chapterUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const images = [];
    const regex = /background-image:\s*url\(['"]?(.*?)['"]?\)/g;
    let match;
    while ((match = regex.exec(data)) !== null) {
        if (match[1] && !match[1].includes('blank') && match[1].startsWith('http')) {
            images.push(match[1]);
        }
    }

    if (images.length === 0) {
        const $ = cheerio.load(data);
        $('img').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && src.startsWith('http') && src.includes('mangatuk')) {
                images.push(src);
            }
        });
    }

    if (images.length === 0) {
        await react('❌');
        return m.reply('❌ *لم يتم العثور على صور في هذا الفصل.*');
    }

    await m.reply(`📸 *جاري إرسال ${images.length} صفحة...*`);

    for (let i = 0; i < images.length; i++) {
        try {
            await waitForRateLimit();
            await conn.sendMessage(m.chat, {
                image: { url: images[i] },
                caption: `╭─── 📖 *الصفحة ${i+1} من ${images.length}* ───╮
│
╰─── ⚡ Yoru Manga ───╯`
            }, { quoted: m });
            
            if (i < images.length - 1) await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
            console.error(`❌ فشل إرسال الصفحة ${i+1}:`, err.message);
        }
    }

    await react('✅');
    await m.reply(`🎉 *تم إرسال جميع الصفحات (${images.length}) بنجاح!*`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 تحميل الفصل كاملاً كملف ZIP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function downloadFullChapter(conn, m, chapterUrl) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('⏳');
    await m.reply('📦 *جاري تجهيز الفصل للتحميل...*\n⏳ قد يستغرق بضع ثوانٍ حسب عدد الصفحات.');

    try {
        // 1. جلب صور الفصل
        const { data } = await axios.get(chapterUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const images = [];
        const regex = /background-image:\s*url\(['"]?(.*?)['"]?\)/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
            if (match[1] && !match[1].includes('blank') && match[1].startsWith('http')) {
                images.push(match[1]);
            }
        }

        if (images.length === 0) {
            const $ = cheerio.load(data);
            $('img').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && src.startsWith('http') && src.includes('mangatuk')) {
                    images.push(src);
                }
            });
        }

        if (images.length === 0) {
            throw new Error('لم يتم العثور على صور');
        }

        await m.reply(`📸 *تم العثور على ${images.length} صفحة*\n🔄 جاري إنشاء ملف ZIP...`);

        // 2. إنشاء ملف ZIP
        const zip = new JSZip();
        const chapterNum = chapterUrl.match(/\/(\d+)\/?$/)?.[1] || 'chapter';

        for (let i = 0; i < images.length; i++) {
            await waitForRateLimit();
            const imgRes = await axios.get(images[i], { responseType: 'arraybuffer' });
            const extension = images[i].split('.').pop().split('?')[0] || 'jpg';
            zip.file(`page_${String(i + 1).padStart(3, '0')}.${extension}`, imgRes.data);
            
            if ((i + 1) % 10 === 0 || i === images.length - 1) {
                await m.reply(`📦 *تقدم:* ${i + 1}/${images.length} صفحة`);
            }
        }

        // 3. إنشاء ملف ZIP وإرساله
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        const fileName = `chapter_${chapterNum}_${Date.now()}.zip`;

        await conn.sendMessage(m.chat, {
            document: zipBuffer,
            mimetype: 'application/zip',
            fileName: fileName,
            caption: `╭─── 📦 *الفصل ${chapterNum}* ───╮
│
│ 📄 *عدد الصفحات:* ${images.length}
│ 📁 *الحجم:* ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB
│
╰─── ⚡ تم التحميل بنجاح ───╯`
        }, { quoted: m });

        await react('✅');
        await m.reply(`✅ *تم إرسال الفصل كاملاً كملف ZIP!*\n📁 اسم الملف: ${fileName}`);

    } catch (err) {
        console.error('[Download Chapter] Error:', err);
        await react('❌');
        await m.reply(`❌ *فشل تحضير الفصل للتحميل*\n📌 ${err.message}`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 الأمر الرئيسي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let handler = async (m, { conn, text, command, usedPrefix }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    // أمر المساعدة
    if ((command === 'مانجا' && !text) || (command === 'مساعدة' && !text)) {
        await react('📚');
        return conn.sendMessage(m.chat, {
            image: { url: DEFAULT_IMAGE },
            caption: `╭─── 📚 *أوامر المانجا* ───╮
│
│ 🔍 *${usedPrefix}مانجا <اسم المانجا>*
│ ▸ البحث عن مانجا وعرض النتائج
│
│ 📖 *${usedPrefix}فصول <رابط المانجا>*
│ ▸ عرض فصول المانجا (من زر البحث)
│
│ 📸 *${usedPrefix}فصل <رابط الفصل>*
│ ▸ عرض صور فصل معين (منفصلة)
│
│ 📦 *${usedPrefix}تحميل_فصل <رابط الفصل>*
│ ▸ تحميل الفصل كاملاً كملف ZIP
│
╰─── ⚡ Yoru Manga ───╯`
        }, { quoted: m });
    }

    if (command === 'مانجا' && text) return searchManga(conn, m, text);
    if (command === 'فصول') return showChapters(conn, m, text);
    if (command === 'فصل') return showChapterPages(conn, m, text);
    if (command === 'تحميل_فصل' || command === 'zip') return downloadFullChapter(conn, m, text);
};

handler.command = ['مانجا', 'فصول', 'فصل', 'تحميل_فصل', 'zip'];
handler.tags = ['anime'];
handler.help = ['مانجا <اسم>', 'فصول <رابط>', 'فصل <رابط>', 'تحميل_فصل <رابط>'];

export default handler;