import { canLevelUp, xpRange } from '../lib/levelling.js';

const handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return conn.sendMessage(m.chat, { text: "❌ حدث خطأ في جلب بياناتك!" }, { quoted: m });

    let { exp = 0, level = 0, role = "🌱 مبتدئ", money = 0 } = user;
    let { min, xp, max } = xpRange(level, global.multiplier);
    let name = conn.getName(m.sender);
    let remainingXP = Math.max(0, max - exp);

    let profileMessage = `
*~⧼❆˹─━═┉⌯⤸◞📊◜⤹⌯┉═━─˼‏❆⧽~*
*🧭┊⪼• ◈╷ملفك الشخصي ⥏🧭⥑╵◈*  
*¦ ⌗╎معلوماتك الحالية╎⌗ ¦*
> *~『◈˼‏${name}◈』~*

*~˼‏※⸃─┉┈┈⥏🧭⥑┈┈┉─⸂※ ˹~*
*⸂┊˼‏المستوى والرتبة ¦↓⸃*  
> *✨ الاسم: @${m.sender.split("@")[0]}*  
> *🎖️ المستوى: ${level}*  
> *👑 الرتبة: ${role}*  
> *💰 الرصيد: ${money} XP*  
> *📈 الخبرة: ${exp}/${xp}*  
> *🌀 المتبقي للترقية: ${remainingXP} XP*

*~「⸂⥑📚 استمر في التفاعل للوصول لمستوى أعلى!」~*
*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼‏❆⧽~*
`.trim();

    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
        return conn.sendMessage(m.chat, {
            text: profileMessage,
            mentions: [m.sender]
        }, { quoted: m });
    }

    let before = user.level;
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;

    let nextLevelExp = xpRange(user.level + 1, global.multiplier).max;
    let remainingPoints = nextLevelExp - user.exp;

    let levelUpMessage = `
*~⧼❆˹─━═┉⌯⤸◞🎉◜⤹⌯┉═━─˼‏❆⧽~*
*🧭┊⪼• ◈╷تم رفع مستواك بنجاح ⥏🧭⥑╵◈*  
*¦ ⌗╎مستواك الحالي╎⌗ ¦*  
> *~『◈˼‏${name}◈』~*

*~˼‏※⸃─┉┈┈⥏🧭⥑┈┈┉─⸂※ ˹~*
*⸂┊˼‏المستوى الجديد ¦↓⸃*  
> *⬆️ من المستوى: ${before}*  
> *⭐ إلى المستوى: ${user.level}*  
> *📈 المتبقي للترقية التالية: ${remainingPoints} XP*  
> *👑 الرتبة: ${role}*  
> *💰 الرصيد: ${money} XP*

*~「⸂⥑🏅 واصل التقدم، لقد أصبحت أقوى!」~*
*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼‏❆⧽~*
`.trim();

    try {
        const img = "https://files.catbox.moe/0y9ioi.jpg";
        await conn.sendMessage(
            m.chat,
            {
                image: { url: img },
                caption: levelUpMessage,
                mentions: conn.parseMention(levelUpMessage)
            },
            { quoted: m }
        );
    } catch (e) {
        m.reply(levelUpMessage);
    }
};

handler.help = ['رانك', 'lvl', 'لفل', 'level'];
handler.tags = ['xp'];
handler.command = ['رانك', 'lvl', 'لفل', 'level'];

export default handler;