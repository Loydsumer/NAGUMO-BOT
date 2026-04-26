import axios from 'axios';
import { prepareWAMessageMedia, generateWAMessageFromContent} from '@whiskeysockets/baileys';

const handler = async (m, { conn, usedPrefix, command}) => {
  const selected = m?.listResponseMessage?.singleSelectReply?.selectedRowId;
  const text = selected || m.text?.trim().split(' ').slice(1).join(' ');

  if (!text) {
    await conn.reply(m.chat, `يرجى كتابة اسم الدرس أو المادة بعد الأمر للبحث وتحميله عبر منصة alloschool`, m);
    return;
}

  if (text.startsWith('https://www.alloschool.com/element/')) {
    try {
      const apiUrl = `https://obito-mr-apis.vercel.app/api/download/alloschool?url=${encodeURIComponent(text)}`;
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.success) {
        await conn.reply(m.chat, 'لم يتم العثور على معلومات للدرس المطلوب', m);
        return;
}

      await conn.sendMessage(m.chat, {
        image: { url: data.image},
        caption: `📘 صوره مقتطفة من الدرس/الامتحان\nالعنوان: ${data.title}\nرابط: ${data.source}`
}, { quoted: m});

      await conn.sendMessage(m.chat, {
        document: { url: data.pdf},
        mimetype: 'application/pdf',
        fileName: `${data.title || 'بدون عنوان'}.pdf`
}, { quoted: m});

      return;
} catch (e) {
      console.error(e);
      await conn.reply(m.chat, `تعذر تحميل الدرس\n${e.message}`, m);
      return;
}
}

  try {
    const searchUrl = `https://obito-mr-apis.vercel.app/api/search/alloschool?q=${encodeURIComponent(text)}`;
    const searchRes = await axios.get(searchUrl);
    const results = searchRes.data.results;

    if (!results || results.length === 0) {
      await conn.reply(m.chat, `لم يتم العثور على أي نتائج لكلمة "${text}"`, m);
      return;
}

    const sections = [
      {
        title: `📚 جميع النتائج لـ "${text}"`,
        rows: results.map((item, index) => ({
          title: `📖 ${index + 1}. ${item.title.substring(0, 60)}${item.title.length> 60? '...': ''}`,
          description: 'انقر لتحميل هذا الدرس',
          id: `${usedPrefix + command} ${item.url}`
}))
}
    ];

    const listMessage = {
      body: {
        text: `تم العثور على ${results.length} نتيجة في منصة alloschool لكلمة "${text}"\n\nالمرجو اختيار الدرس أو الفرض الذي تريد تحميله`
},
      footer: { text: 'API BY OBITO'},
      header: {
        title: 'نتائج البحث:',
        hasMediaAttachment: false
},
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '📘 اختر الدرس',
              sections
})
}
        ],
        messageParamsJson: ''
}
};

    const userJid = conn?.user?.jid || m.key.participant || m.chat;
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage: listMessage}, { userJid, quoted: m});
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id});
} catch (e) {
    console.error(e);
    await conn.reply(m.chat, `حدث خطأ أثناء البحث\n${e.message}`, m);
}
};

handler.help = ['دروس'];
handler.tags = ['البحث'];
handler.command = ['دروس'];
handler.register = true;

export default handler;