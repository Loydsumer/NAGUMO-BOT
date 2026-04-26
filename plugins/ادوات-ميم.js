let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    image: { url: 'https://img.randme.me/' },
    caption: `🧞‍♀️ *ميم عشوائي لك يا زعيم!*\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ`
  }, { quoted: m });
};

handler.help = ['meme', 'ميم'];
handler.command = ['meme', 'ميم'];
handler.tags = ['internet'];

export default handler;