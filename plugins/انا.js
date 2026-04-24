import { createHash } from 'crypto';
import { canLevelUp, xpRange } from '../lib/levelling.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    // تحقق مما إذا كانت الرسالة مرسلة من البوت نفسه
    if (m.fromMe) return;

    let who = m.quoted
        ? m.quoted.sender
        : m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.fromMe
        ? conn.user.jid
        : m.sender;

    if (!(who in global.db.data.users)) throw `❪🌸❫⇇ *المستخدم غير موجود في قاعدة البيانات* ⇇❪🌸❫`;

    let pp = await conn.profilePictureUrl(who, 'image').catch((_) => './src/sinfoto.jpg');
    let user = global.db.data.users[who];
    let about = (await conn.fetchStatus(who).catch(console.error) || {}).status || '';
    let { name, exp, credit, level, role, warn } = global.db.data.users[who];
    let { min, xp, max } = xpRange(user.level, global.multiplier);
    let username = conn.getName(who);
    let math = max - xp;
    let prem = global.prems.includes(who.split`@`[0]);
    let link = `https://wa.me/${who.split`@`[0]}`;

    let str = `
╮═━━━━━━✦✿✦━━━━━━═╭
┊   ｢🌸┊𝐅υׁׅ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭┊🌸｣   ┊
╯═━━━━━━✦✿✦━━━━━━═╰
✦───────✿───────✦
🌟 *بروفايل المستخدم:*
╭⿻𓂃˖ ˚♡ •﹤ 💌 • ˚♡ ˖ ⿻𓂃
┊:•⪼ *🪪 الإسم:* ｢${username}｣
┊:•⪼ *⚠️ التحذيرات:* ｢${warn}/5｣
┊:•⪼ *✨ المستوى:* ｢${level}｣
┊:•⪼ *⬆️ الخبرة:* إجمالي ｢${exp}｣
┊:•⪼ *🏆 الترتيب:* ｢${role}｣
┊:•⪼ *⭐ بريميوم:* ｢${prem ? 'نعم' : 'لا'}｣
┊:•⪼ *📱 رقم المستخدم:*( ${link} )
╰⿻𓂃˖ ˚♡ •﹤ 💌 • ˚♡ ˖ ⿻𓂃`.trim();

    await conn.sendMessage(m.chat, { react: { text: '💖', key: m.key } });
    conn.sendFile(m.chat, pp, 'profil.jpg', str, m, false, { mentions: [who] });
};

handler.help = ['profile'];
handler.tags = ['group'];
handler.command = ['بروفايل', 'انا', 'بروفايلي'];

export default handler;