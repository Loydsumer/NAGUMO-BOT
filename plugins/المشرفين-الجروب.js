const handler = async (m, { conn, participants, groupMetadata }) => {
  try {
    const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => global.icono);
    const { antiLink, detect, welcome, modoadmin, autoRechazar, nsfw, autoAceptar, reaction, isBanned, antifake } = global.db.data.chats[m.chat];
    const groupAdmins = participants.filter((p) => p.admin);
    const listAdmin = groupAdmins.map((v, i) => `🤖 ${i + 1}. @${v.id.split('@')[0]}`).join('\n');
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';

    const text = `*✧･ﾟ🤖 معلومات الجروب 🤖ﾟ･✧*
  
🤖 *معرف الجروب:* ${groupMetadata.id}
🤖 *اسم الجروب:* ${groupMetadata.subject}
🤖 *عدد الأعضاء:* ${participants.length} عضو
🤖 *المنشئ:* @${owner.split('@')[0]}
🤖 *المدراء:*
${listAdmin}

*✦─━─━─━──━─━─━─✦*
🤖 *الإعدادات الحالية:*

◈ *البوت:* ${isBanned ? 'مُعطل 🤖' : 'مُفعل 🤖'}
◈ *الترحيب:* ${welcome ? 'مُفعل 🤖' : 'مُعطل 🤖'}
◈ *اكتشاف التغييرات:* ${detect ? 'مُفعل 🤖' : 'مُعطل 🤖'}
◈ *مضاد الروابط:* ${antiLink ? 'مُفعل 🤖' : 'مُعطل 🤖'}
◈ *قبول تلقائي:* ${autoAceptar ? 'مُفعل 🤖' : 'مُعطل 🤖'}
◈ *رفض تلقائي:* ${autoRechazar ? 'مُفعل 🤖' : 'مُعطل 🤖'}
◈ *محتوى +18:* ${nsfw ? 'مُفعل 🤖' : 'مُعطل 🤖'}
◈ *وضع المدراء:* ${modoadmin ? 'مُفعل 🤖' : 'مُعطل 🤖'}
◈ *الردود التفاعلية:* ${reaction ? 'مُفعلة 🤖' : 'مُعطلة 🤖'}
◈ *مضاد الأرقام الوهمية:* ${antifake ? 'مُفعل 🤖' : 'مُعطل 🤖'}

*✦─━─━─━──━─━─━─✦*
🤖 *وصف الجروب:*
${groupMetadata.desc?.toString() || '🤖 لا يوجد وصف لهذا الجروب'}

*✦ ƓȺⱮį 👻 βටͲ ✦ 🤖*`.trim();

    conn.sendFile(m.chat, pp, 'img.jpg', text, m, false, { mentions: [...groupAdmins.map((v) => v.id), owner] });
  } catch (e) {
    m.reply('🤖 حدث خطأ غير متوقع أثناء جلب معلومات الجروب.');
    console.error(e);
  }
};

handler.help = ['infogrupo', 'الجروب'];
handler.tags = ['group'];
handler.command = ['infogrupo', 'الجروب'];
handler.register = true;
handler.group = true;

export default handler;