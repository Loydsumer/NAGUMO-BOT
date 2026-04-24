let rouletteBets = {}; // تخزين الرهانات مؤقتاً

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const userId = m.sender;
    const chatId = m.chat;
    const user = global.db.data.users[userId];

    if (!user) return m.reply('✳️ المستخدم غير موجود في قاعدة البيانات');

    if (!user.exp) user.exp = 0;

    if (args.length < 2) {
        return m.reply(`✳️ طريقة الاستخدام:\n${usedPrefix + command} <المبلغ> <اللون>\nمثال: ${usedPrefix + command} 1000 أحمر`);
    }

    let amount = parseInt(args[0]);
    let color = args[1]?.toLowerCase();
    const validColors = ['أحمر', 'أسود', 'red', 'black'];

    if (!validColors.includes(color)) {
        return m.reply('✳️ اختر لونًا صالحًا: "أحمر" أو "أسود"');
    }

    if (isNaN(amount) || amount < 500) return m.reply('✳️ الحد الأدنى للرهان هو 500');
    if (amount > 100000) return m.reply('🟥 لا يمكنك المراهنة بأكثر من 100000');
    if (user.exp < amount) return m.reply('✳️ لا تملك XP كافي!');

    // تحويل اللون للعربي
    if (color === 'أحمر') color = 'red';
    if (color === 'أسود') color = 'black';

    // خصم XP
    user.exp -= amount;

    // إضافة الرهان
    if (!rouletteBets[chatId]) rouletteBets[chatId] = [];
    rouletteBets[chatId].push({ user: userId, amount, color });

    m.reply(`✅ تم رهانك بـ ${amount} XP على اللون ${color.toUpperCase()}\n⌛ انتظر النتيجة خلال 10 ثوانٍ...`);

    setTimeout(() => resolveRoulette(chatId, conn), 10_000);
};

// دالة حساب النتائج
function resolveRoulette(chatId, conn) {
    if (!rouletteBets[chatId]) return;

    const outcomes = ['red', 'black'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    let resultMsg = `*النتيجة:* الكرة هبطت على *${result.toUpperCase()}*\n\n🎉 *النتائج:*`;
    let mentions = [];

    for (let bet of rouletteBets[chatId]) {
        const userData = global.db.data.users[bet.user];
        if (!userData.exp) userData.exp = 0;

        if (bet.color === result) {
            let win = bet.amount * 2;
            userData.exp += win;
            resultMsg += `\n✅ @${bet.user.split('@')[0]} ربح ${win} XP`;
        } else {
            resultMsg += `\n❌ @${bet.user.split('@')[0]} خسر ${bet.amount} XP`;
        }

        mentions.push(bet.user);
    }

    delete rouletteBets[chatId];
    conn.reply(chatId, resultMsg, null, { mentions });
}

handler.help = ['رهان <المبلغ> <اللون>'];
handler.tags = ['economy'];
handler.command = ['رهان'];

handler.group = false;

export default handler;