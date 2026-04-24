import axios from 'axios';

const handler = async (m, { conn }) => {
    const who = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.fromMe 
        ? conn.user.jid 
        : m.sender;

    const username = await conn.getName(who);
    const user = who.split('@')[0];

    // تعريف متغيرات
    const wm = 'Radio Bot'; // العنوان في externalAdReply
    let imagen1Buffer;
    try {
        const resp = await axios.get('https://files.catbox.moe/xm9pe6.jpg', { responseType: 'arraybuffer' });
        imagen1Buffer = Buffer.from(resp.data, 'binary');
    } catch {
        imagen1Buffer = null;
    }

    // الصورة الافتراضية للبروفايل إذا لم توجد
    let pp;
    try {
        pp = await conn.profilePictureUrl(who, 'image');
    } catch {
        pp = 'https://telegra.ph/file/c0f8bb917592f4684820b.jpg';
    }

    const contactInfo = {
        key: {
            fromMe: false,
            participant: who,
            remoteJid: 'status@broadcast',
            id: 'Halo'
        },
        message: {
            contactMessage: {
                displayName: username,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${username}\nitem1.TEL;waid=${user}:${user}\nEND:VCARD`
            }
        },
        participant: who
    };

    const cap = `
*╭─〔 ♢ ♤ ♧ ♡ ♢ ♤ ♧ ♡ 〕─╮*
*│   ⛩️ 𝑷𝒓𝒐𝒇𝒊𝒍𝒆 𝑷𝒊𝒄 𝑷𝒂𝒕𝒉 ⛩️   │*
*│═══════════════│*
*│✧ أهلاً بك يا 「 @${user} 」*
*│✧ هذه هي صورتك*
*│═══════════════│*
*╰─〔 ♢ ♤ ♧ ♡ ♢ ♤ ♧ ♡ 〕─╯*
`.trim();

    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: cap,
        contextInfo: {
            externalAdReply: {
                title: wm,
                body: username,
                thumbnail: imagen1Buffer, // استخدم Buffer لتجنب الخطأ
                sourceUrl: 'https://www.atom.bio/shawaza-2000/'
            },
            mentionedJid: [who]
        },
        isForwarded: true,
        forwardingScore: 2023
    }, { 
        quoted: contactInfo 
    });
};

handler.help = ['profile [@user]'];
handler.tags = ['xp'];
handler.command = /^صورته|صورتة?$/i;

export default handler;