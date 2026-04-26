/*
info freefire id
channel by : https://whatsapp.com/channel/0029Vb6dsyP3rZZgNJUD2F1A
By : obito mr
*/

import axios from 'axios';

let handler = async (m, { text, command, usedPrefix}) => {
  if (!text ||!/^\d+$/.test(text)) {
    return m.reply(`⚠️ يرجى إدخال ايدي صالح\nمثال: ${usedPrefix + command} 1010493740`);
}

  try {
    const res = await axios.get(`https://obito-mr-apis.vercel.app/api/info/freefire?id=${text}`);
    const data = res.data;

    if (!data.success ||!data.account ||!data.account.basicInfo) {
      return m.reply('❌ لم يتم العثور على معلومات الحساب.');
}

    const b = data.account.basicInfo;
    const s = data.account.socialInfo;
    const c = data.account.clanBasicInfo;
    const cr = data.account.creditScoreInfo;
    const d = data.account.diamondCostRes;
    const p = data.account.petInfo;
    const pr = data.account.profileInfo;

    let reply = `
🎮 *معلومات حساب فري فاير:*
━━━━━━━━━━━━━━
👤 *الاسم:* ${b.nickname}
🆔 *ID:* ${b.accountId}
⭐ *المستوى:* ${b.level}
🏆 *الرتبة:* ${b.rank}
📈 *أعلى رتبة:* ${b.maxRank}
❤️ *الإعجابات:* ${b.liked}
🧠 *النقاط:* ${b.rankingPoints}
📍 *المنطقة:* ${b.region}
📜 *الإصدار:* ${b.releaseVersion}
🕹️ *نوع الحساب:* ${b.accountType}
🎖️ *عدد الشارات:* ${b.badgeCnt}
🖼️ *الصورة الرمزية:* ${b.headPic}
📅 *تاريخ الإنشاء:* ${b.createAt}
🔁 *آخر دخول:* ${b.lastLoginAt}
🧢 *اللقب:* ${b.title}
🔫 *أسلحة مميزة:* ${b.weaponSkinShows?.join(", ") || "لا يوجد"}
━━━━━━━━━━━━━━
👥 *معلومات الكلان:*
🏷️ *اسم الكلان:* ${c.clanName || "لا يوجد"}
📊 *مستوى الكلان:* ${c.clanLevel}
👑 *الكابتن:* ${c.captainId || "لا يوجد"}
👥 *عدد الأعضاء:* ${c.memberNum}
━━━━━━━━━━━━━━
💎 *معلومات الألماس:*
💰 *تكلفة الألماس:* ${d.diamondCost}
━━━━━━━━━━━━━━
🐾 *معلومات الحيوان الأليف:*
🆔 *ID:* ${p.id}
📛 *الاسم:* ${p.name || "غير محدد"}
⭐ *المستوى:* ${p.level}
🎯 *الخبرة:* ${p.exp}
━━━━━━━━━━━━━━
🧾 *معلومات اجتماعية:*
📝 *التوقيع:* ${s.signature || "لا يوجد"}
🌐 *اللغة:* ${s.language}
🎮 *الوضع المفضل:* ${s.modePrefer}
🏅 *عرض الرتبة:* ${s.rankShow}
━━━━━━━━━━━━━━
✅ *نقاط السمعة:*
📊 *الدرجة:* ${cr.creditScore}
🎁 *الحالة:* ${cr.rewardState}
━━━━━━━━━━━━━━
👕 *الملابس:* ${pr.clothes?.join(", ") || "غير متوفرة"}
🎨 *لون البشرة:* ${pr.skinColor}
━━━━━━━━━━━━━━
`;

    m.reply(reply);
} catch (err) {
    m.reply('❌ حدث خطأ أثناء جلب المعلومات، حاول لاحقًا.');
}
};

handler.help = ['فريفاير'];
handler.tags = ['ai'];
handler.command = /^فريفاير$/i;

export default handler;