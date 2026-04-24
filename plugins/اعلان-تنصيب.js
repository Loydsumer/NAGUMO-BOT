let handler = async (m, { conn, usedPrefix, text }) => {
    // ⚠️ تحقق من أن البث يتم من البوت الرئيسي فقط
    if (conn.user.jid !== global.conn.user.jid) throw false;

    // 👥 جمع جميع البوتات الفرعية المتصلة
    let users = [...new Set([...global.conns.filter(c => c.user && c.state !== 'close').map(c => c.user.jid)])];

    // 📄 تحديد النص الذي سيتم بثه
    let cc = text ? m : m.quoted ? await m.getQuotedObj() : false || m;
    let teks = text ? text : cc.text;
    let content = conn.cMod(
        m.chat,
        cc,
        /bc|broadcast/i.test(teks) ? teks : `*~⧼❆˹─━═┉⌯⤸◞📣◜⤹⌯┉═━─˼❆⧽~*\n*〔 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 إِلَى البوتات الفرعية 〕*\n\n${teks}`
    );

    // ⏱️ بث الرسالة لكل بوت فرعي مع تأخير بسيط لتجنب المشاكل
    for (let id of users) {
        await delay(1500);
        await conn.copyNForward(id, content, true);
    }

    // 📊 رسالة تأكيد البث المزخرفة
    conn.reply(
        m.chat,
        `
*~⧼❆˹─━═┉⌯⤸◞✅◜⤹⌯┉═━─˼❆⧽~*
🐈 *تم إرسال البث بنجاح إلى ${users.length} بوت فرعي*

${users.map(v => '🐾 wa.me/' + v.replace(/[^0-9]/g, '') + `?text=${encodeURIComponent(usedPrefix)}estado`).join('\n')}

⏱️ *تقدير الوقت لإرسال الرسائل: ${users.length * 1.5} ثانية تقريباً*
*~⧼❆˹─━═┉⌯⤸◞📣◜⤹⌯┉═━─˼❆⧽~*
`.trim(),
        m
    );
};

handler.command = /^اعلان-تنصيب$/i;
handler.owner = true;

export default handler;

// 📜 مسافة للقراءة "Read More"
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

// ⏱️ دالة التأخير
const delay = (time) => new Promise((res) => setTimeout(res, time));