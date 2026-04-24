let handler = async (m, { conn, text }) => {
  const usageMessage = '*\`『 اعمل ريب ع الي عايز تبعبصو😹🐤 』\`*';

  const who = m.mentionedJid[0] 
    || (m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false);

  if (!who) return conn.reply(m.chat, usageMessage, m, { mentions: [m.sender] });

  // Ignore if the target is the bot itself
  if (who === conn.user.jid || m.sender === conn.user.jid) return;

  let user = who.split('@')[0];
  let sender = m.sender.split('@')[0];

  let cap;
  if (user === '201222784295' || user === '201222784295') { // إضافة الأرقام الممنوعة هنا
    cap = `*@${sender} يبعبص نفسه*`;
  } else {
    cap = `*@${sender} يبعبص طيز @${user}*`;
  }

  let { key } = await conn.sendMessage(m.chat, { text: cap, mentions: [m.sender, who] }, { quoted: m });
};

handler.command =  ['بعبص'];
handler.owner = true; 
export default handler;