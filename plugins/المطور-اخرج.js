let handler = async (m, { conn, args, command }) => {
    // 👻 توقيع اوغامي بوت
    const ogamiSymbol = 'ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻';
    
    // 👻 تحديد رسالة الخروج بناء على الأمر المستخدم
    let leaveMessage = '';
    
    if (command === 'out' || command === 'برا') {
        leaveMessage = `*👻 مش هتوحشوني... اوغامي بيقولكوا مع السلامه! اللي باعنا خسر دلعنا ⁦^⁠_⁠^⁩* \n\n${ogamiSymbol}`;
    } else if (command === 'leavegc' || command === 'اخرج') {
        leaveMessage = `*👻 اوغامي بيسلم عليكوا ويقول: يلا باي يا حلوين! اللي مش عاجبه يروح يكلم نفسه 👻* \n\n${ogamiSymbol}`;
    } else {
        leaveMessage = `*👻 مع السلامه يا جماعه... اوغامي مش هينسيكم! 👻* \n\n${ogamiSymbol}`;
    }
    
    // 👻 إرسال رسالة الخروج
    await m.reply(leaveMessage);
    
    // 👻 مغادرة المجموعة
    await conn.groupLeave(m.chat);
}

// 👻 الأوامر المدعومة (عربي/إنجليزي)
handler.command = /^(out|برا|leavegc|اخرج)$/i;

// 👻 إعدادات الأمر
handler.group = true;
handler.rowner = true;

// 👻 توضيح الاستخدام للمستخدم
handler.help = [
    '👻 *الأوامر المتاحة:*',
    '• `out` أو `برا` - مغادرة المجموعة برسالة اوغامي الكلاسيكية',
    '• `leavegc` أو `اخرج` - مغادرة المجموعة برسالة مختلفة',
    '',
    '👻 *طريقة الاستخدام:*',
    'اكتب أحد هذه الأوامر في المجموعة المراد مغادرتها',
    'فقط مالك البوت يستطيع استخدام هذا الأمر!',
    '',
    'ᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻'
];

export default handler;