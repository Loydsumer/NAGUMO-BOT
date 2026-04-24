const handler = async (m, { conn }) => {
  const imageUrl = "https://raw.githubusercontent.com/RADIOdemon6-alt/uploads/main/uploads/d86601132f-file_1761644505616.jpg";
  const link1 = "https://wa.me/4917672339436";

  // 💫 الرسالة بصورة كبيرة بدون أزرار
  const adMessage = {
    text: `*◞💖‟⌝╎مرحبـاً أنا: 𝐅υׁׅ𝐫𝐢𝐧𝐚 𝐁ׅ𝗼𝐭🎀*\n*┊˚₊·͟͟͞͞➳❥مرحبا احبائي انا بوت متعدد المهام مطوري راديو استعمل(.اوامر) لي طلب القائمه*`,
    contextInfo: {
      externalAdReply: {
        title: "𖥔ᰔᩚ⋆｡˚ ꒰🍒 ʀᴜʙʏ-ʜᴏꜱʜɪɴᴏ",
        body: "BY|𝐋𝐎𝐘𝐃",
        thumbnailUrl: imageUrl,
        mediaType: 2,
        renderLargerThumbnail: false, 
        mediaUrl: link1
      }
    }
  };

  await conn.sendMessage(m.chat, adMessage, { quoted: m });
};

handler.command = /^بوت$/i;

export default handler;