import moment from 'moment-timezone';
import { prepareWAMessageMedia } from '@whiskeysockets/baileys';

let usageLimits = {};

let handler = async (m, { isOwner, isAdmin, conn, participants, args, command }) => {
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  let groupId = m.chat;
  let usageKey = `${groupId}:${command}`;

  // تعيين الحد
  if (command === 'تحديد_منشن') {
    if (!isOwner) {
      m.reply('❌ هذا الأمر متاح فقط للمطور.');
      return;
    }
    let limit = parseInt(args[0]);
    if (isNaN(limit) || limit <= 0) {
      m.reply('❌ الرجاء إدخال رقم صحيح كحد للاستخدام.');
      return;
    }
    usageLimits[groupId] = limit;
    m.reply(`✨ تم تعيين الحد الأقصى لاستخدام أوامر المنشن إلى *${limit}* مرة 🌸`);
    return;
  }

  if (!usageLimits[groupId]) usageLimits[groupId] = 3;
  if (usageLimits[usageKey] === undefined) usageLimits[usageKey] = usageLimits[groupId];

  if (usageLimits[usageKey] <= 0) {
    m.reply('❌ تم استنفاد الحد الأقصى لاستخدام هذا الأمر في المجموعة. تواصل مع المطور لإعادة التعيين.');
    return;
  }

  // فلترة المشاركين
  let filteredParticipants =
    command === 'منشن_اعضاء'
      ? participants.filter(p => !p.admin)
      : command === 'منشن_مشرفين'
      ? participants.filter(p => p.admin)
      : participants;

  let time = moment.tz('Asia/Riyadh').format('hh:mm A');
  let date = moment.tz('Asia/Riyadh').format('YYYY/MM/DD');

  // النص بزخارف + تقسيم
  let teks = `
*◞👥‟⌝╎مـنـشـن جـديـد ⸃⤹*  
*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞✨◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*

*⌝📌╎الـنـوع:* ⌞ ${command === 'منشن_اعضاء' ? 'الأعـضـاء' : command === 'منشن_مشرفين' ? 'المشرفـين' : 'الجميع'} ⌞*  
> *╭*  
${filteredParticipants.map(mem => `> ┊  @${mem.id.split('@')[0]}*`).join('\n')}
> *╰*

*⌝🕒╎الـوقـت:* ${time}  
*⌝📅╎التـاريـخ:* ${date}  

*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞💮◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*  
> ⏤ׁ͟˚₊· ͟͟͞͞➳͞𝑹𝒖𝒃𝒚-𝐻𝒐𝒔𝒉𝒊𝒏𝒐
`;

  // الصورة
  const media = await prepareWAMessageMedia(
    { image: { url: 'https://files.catbox.moe/c5pkc1.jpg' } },
    { upload: conn.waUploadToServer }
  );

  await conn.sendMessage(m.chat, { image: media.imageMessage, caption: teks, mentions: filteredParticipants.map(a => a.id) });

  usageLimits[usageKey] -= 1;
};

handler.help = ['منشن_اعضاء', 'منشن_مشرفين', 'منشن_الكل', 'تحديد_منشن <عدد>'];
handler.tags = ['group'];
handler.command = /^(منشن_اعضاء|منشن_مشرفين|منشن_الكل|تحديد_منشن)$/i;
handler.admin = true;
handler.group = true;

export default handler;