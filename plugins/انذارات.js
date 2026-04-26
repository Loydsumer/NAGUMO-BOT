const handler = async (m, { conn, isOwner }) => {
  const adv = Object.entries(global.db.data.users).filter((user) => user[1].warn);
  const warns = global.db.data.users.warn;
  const user = global.db.data.users;
  const imagewarn = './src/warn.jpg';
  const caption = `❪🍷❫⇇ *قائمة الإنذارات* ⇇❪🍷❫
⧈═━━━━━✦🍷✦━━━━━═⧈ 
${adv.length > 0 ? adv.map(([jid, user], i) => `
❪🍷❫⇇المستخدم⇇❪@${isOwner ? jid.split`@`[0] : jid}❫
*┊انذاراته•⪼ ❪${user.warn}/3❫*
⧈═━━━━━✦🍷✦━━━━━═⧈`).join('\n') : '*لا يوجد مستخدمون لديهم إنذارات حالياً.*'}
  `;
  
  await conn.sendMessage(m.chat, { react: { text: '🚨', key: m.key } });

  await conn.sendMessage(m.chat, { text: caption }, { quoted: m }, { mentions: await conn.parseMention(caption) });
};
handler.command = /^(listwarn|الانذارات|التحذيرات)$/i;
handler.group = true;
handler.admin = true;
export default handler;