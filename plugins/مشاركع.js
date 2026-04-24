import axios from 'axios';

let handler = async (m, { command, text }) => {
  let content = text || (m.quoted && m.quoted.text);

  if (!content) {
    return m.reply(
      `*◞📤‟⌝╎أمـر مشاركـة الـنص ⸃⤹*\n*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞🧞‍♂️◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*\n*⌝📌╎فـائـدة الأمـر: ⌞*\n🧾╎يـمكنـك من رفـع أي نـص طـويل و الحصـول على رابط مباشـر له\n📎╎مـفيد لمـشاركة الأكـواد أو الملاحظات الطويلة في صورة رابط بسيط\n*⌝⚙️╎طـريقـة الاسـتخدام: ⌞*\n📝╎إمـا كـتابة نـص بعـد الأمـر مباشـرة\n🔁╎أو الـرد على رسـالة تحتوي نص، ثم إرسـال الأمر فقط\n*⌝💡╎مثــال: ⌞*\n.مشاركـه هـذا مثـال علـى مشـاركـة نـص\nأو الـرد على رسـالة ثم إرسال: .مشاركه\n*⌝🎯╎مـلاحظـة: الأمـر يدعـم .مشاركه / .share ⌞*\n*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*`
    );
  }

  try {
    const res = await axios.post('https://sharetext.io/api/text', {
      text: content
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
        'Referer': 'https://sharetext.io/'
      }
    });

    const id = res.data;
    if (!id) throw new Error('فشل في الحصول على الرابط!');

    await m.reply(`*تم إنشاء الرابط بنجاح:*\nhttps://sharetext.io/${id}\n⏤͟͞ू⃪ 𝑭𝒖𝒓𝒊𝒏𝒂🌺⃝𖤐`);
  } catch (err) {
    await m.reply(`حدث خطأ أثناء رفع النص:\n${err.message}`);
  }
};

handler.help = ['share', 'مشاركة', 'مشاركه'];
handler.command = ['share', 'مشاركة', 'مشاركه'];
handler.tags = ['tools'];

export default handler;