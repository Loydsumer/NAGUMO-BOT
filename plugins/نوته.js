import fetch from "node-fetch";

const github = {
  token: process.env.GITHUB_TOKEN || "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",
  user: "RADIOdemon-alt",
  repo: "database"
};

// رفع الملفات أو تعديلها على GitHub
async function uploadToGitHub(path, content, message = "update file") {
  const apiUrl = `https://api.github.com/repos/${github.user}/${github.repo}/contents/${path}`;
  let sha = null;

  const check = await fetch(apiUrl, {
    headers: { Authorization: `token ${github.token}` }
  });
  if (check.ok) {
    const info = await check.json();
    sha = info.sha;
  }

  const body = {
    message,
    content: Buffer.from(content).toString("base64"),
    sha
  };

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${github.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`GitHub upload failed: ${res.status}`);
}

// تحميل الملاحظة
async function fetchNote(userNumber, section) {
  const url = `https://raw.githubusercontent.com/${github.user}/${github.repo}/main/Storage/note/${userNumber}/Section_${section}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

// جلب جميع الأقسام للمستخدم
async function fetchAllSections(userNumber) {
  const url = `https://api.github.com/repos/${github.user}/${github.repo}/contents/Storage/note/${userNumber}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const files = await res.json();
  return files
    .filter(f => f.name.startsWith("Section_") && f.name.endsWith(".json"))
    .map(f => f.name.replace("Section_", "").replace(".json", ""))
    .sort((a, b) => Number(a) - Number(b));
}

// زخرفة النصوص للملاحظات
const decorateNote = (sec, noteText) => {
  return `*◞🧠‟⌝╎القسم: ${sec} ⸃⤹*  
*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞📔◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*

*⌝📚╎مـحـتـوى الـمـلاحـظة: ⌞*  
> *╭*  
> *┊ ${noteText.split("\n").map(l => `╎${l}`).join("\n> *┊ ")}*  
> *╰*

*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞💮◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*`;
};

// زخرفة الشرح الكامل للأوامر
const noteHelp = `
*◞🧠‟⌝╎نـظـام الـمـلاحظـات (نوته) ⸃⤹*  
*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞📔◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*

*⌝📝╎شـرح جـمـيع أوامـر النوته: ⌞*  
> *╭*  
> *┊ 📝╎حفظ ملاحظة:*  
> *┊    .نوته_حفظ <النص> | <رقم القسم>*  
> *┊    مثال: .نوته_حفظ انا مطور بوتات | 1*  
> *┊ 💾╎إذا لم تحدد رقم قسم سيتم الحفظ في قسم تلقائي*  
> *┊ ✏️╎تعديل ملاحظة:*  
> *┊    .نوته_تعديل <رقم القسم>*  
> *┊    سيعرض لك الملاحظة الحالية مع ثلاث اختيارات:*  
> *┊    - .نوته_تعديل_اضافه <القسم> | <النص الجديد>*  
> *┊    - .نوته_تعديل_حذف <القسم> | <الكلمة>*  
> *┊    - .نوته_تعديل_استبدال <القسم> | <القديمة>|<الجديدة>*  
> *╰*

> *╭*  
> *┊ 📂╎عرض الملاحظات:*  
> *┊    .نوته_عرض*  
> *╰*

> *╭*  
> *┊ 💣╎حذف ملاحظة بالكامل (لاحقًا):*  
> *┊    .نوته_حذف <القسم>*  
> *╰*

*⌝🧾╎حـفـظ الـبـيـانـات:*  
> *╭*  
> *┊ 💠╎جميع البيانات تحفظ بأمان داخل GitHub*  
> *╰*

*~⌝˼‏※⪤˹͟͞≽⌯⧽°⸂◞💮◜⸃°⧼⌯≼˹͟͞⪤※˹⌞~*  `.trim();

// =====================
//     HANDLER
// =====================
let handler = async (m, { text, command, conn }) => {
  const userNumber = m.sender.replace("@s.whatsapp.net", "").replace("+", "");
  const basePath = `Storage/note/${userNumber}`;
  const currentDate = new Date().toISOString();

if (command === "نوته") {
  return conn.sendMessage(m.chat, {
    text: noteHelp,
    contextInfo: {
      externalAdReply: {
        title: "📔 نظام نوته | Note System",
        body: "حافظ على أفكارك وملاحظاتك داخل البوت 🧠",
        thumbnailUrl: "https://files.catbox.moe/g7b5rd.jpg",
        mediaUrl: "https://whatsapp.com/channel/0029Vb6Zrqe9WtCDGD6Sf81O",
        mediaType: 2,
        renderLargerThumbnail: false
      }
    }
  });
}
  // حفظ ملاحظة
  if (command === "نوته_حفظ") {
    let [noteText, section] = text.split("|");
    noteText = noteText?.trim();
    section = section?.trim() || "1";

    if (!noteText)
      return m.reply("⚠️ اكتب النص بعد الأمر.\nمثال: .نوته_حفظ انا مطور بوتات | 1");

    const path = `${basePath}/Section_${section}.json`;
    const json = JSON.stringify({ text: noteText, date: currentDate }, null, 2);

    await uploadToGitHub(path, json, `save note section_${section} by ${userNumber}`);
    m.reply(`✅ تم حفظ الملاحظة في القسم ${section}`);
  }

  // تعديل ملاحظة
  else if (command === "نوته_تعديل") {
    const section = text.trim();
    if (!section)
      return m.reply("⚠️ اكتب رقم القسم بعد الأمر.\nمثال: .نوته_تعديل 1");

    const note = await fetchNote(userNumber, section);
    if (!note) return m.reply("❌ لا يوجد ملاحظة بهذا القسم.");

    m.reply(
      `📝 الملاحظة الحالية:\n${note.text}\n\nاختر نوع التعديل:\n\n➕ إضافة: .نوته_تعديل_اضافه ${section} | <النص الجديد>\n✂️ حذف كلمة: .نوته_تعديل_حذف ${section} | <الكلمة>\n🔄 استبدال: .نوته_تعديل_استبدال ${section} | <الكلمة القديمة>|<الجديدة>`
    );
  }

  // إضافة نص جديد
  else if (command === "نوته_تعديل_اضافه") {
    let [section, newText] = text.split("|");
    section = section?.trim();
    newText = newText?.trim();

    if (!section || !newText)
      return m.reply("⚠️ مثال: .نوته_تعديل_اضافه 1 | النص الجديد");

    const path = `${basePath}/Section_${section}.json`;
    const updated = JSON.stringify({ text: newText, date: currentDate }, null, 2);

    await uploadToGitHub(path, updated, `added new text to section_${section} by ${userNumber}`);
    m.reply(`✅ تم تحديث الملاحظة بالكامل في القسم ${section}`);
  }

  // حذف كلمة
  else if (command === "نوته_تعديل_حذف") {
    let [section, word] = text.split("|");
    section = section?.trim();
    word = word?.trim();

    if (!section || !word)
      return m.reply("⚠️ مثال: .نوته_تعديل_حذف 1 | الكلمة");

    const note = await fetchNote(userNumber, section);
    if (!note) return m.reply("❌ لا يوجد ملاحظة بهذا القسم.");

    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
    const newText = note.text.replace(regex, "").replace(/\s+/g, " ").trim();

    const json = JSON.stringify({ text: newText, date: currentDate }, null, 2);
    await uploadToGitHub(`${basePath}/Section_${section}.json`, json,
      `deleted "${word}" from section_${section} by ${userNumber}`);
    m.reply(`🗑️ تم حذف الكلمة "${word}" من الملاحظة.`);
  }

  // استبدال كلمة
  else if (command === "نوته_تعديل_استبدال") {
    let [section, pair] = text.split("|");
    if (!pair)
      return m.reply("⚠️ مثال: .نوته_تعديل_استبدال 1 | القديمة|الجديدة");

    const [oldWord, newWord] = pair.split("|").map((x) => x.trim());
    section = section?.trim();

    if (!section || !oldWord || !newWord)
      return m.reply("⚠️ مثال: .نوته_تعديل_استبدال 1 | القديمة|الجديدة");

    const note = await fetchNote(userNumber, section);
    if (!note) return m.reply("❌ لا يوجد ملاحظة بهذا القسم.");

    const regex = new RegExp(oldWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
    const newText = note.text.replace(regex, newWord);
    const json = JSON.stringify({ text: newText, date: currentDate }, null, 2);

    await uploadToGitHub(`${basePath}/Section_${section}.json`, json,
      `replaced "${oldWord}" with "${newWord}" in section_${section} by ${userNumber}`);

    m.reply(`🔁 تم استبدال "${oldWord}" بـ "${newWord}" بنجاح ✅`);
  }

  // عرض الملاحظات مزخرف
  else if (command === "نوته_عرض") {
    const section = text.trim();

    if (section) {
      const note = await fetchNote(userNumber, section);
      if (!note) return m.reply("❌ لا يوجد ملاحظة بهذا القسم.");
      return m.reply(decorateNote(section, note.text));
    }

    const sections = await fetchAllSections(userNumber);
    if (sections.length === 0) return m.reply("❌ لا توجد ملاحظات محفوظة لديك.");

    let allNotes = [];
    for (let sec of sections) {
      const note = await fetchNote(userNumber, sec);
      if (note) allNotes.push(decorateNote(sec, note.text));
    }
    m.reply(allNotes.join("\n\n"));
  }
};

handler.command = [
  "نوته",
  "نوته_حفظ",
  "نوته_تعديل",
  "نوته_تعديل_اضافه",
  "نوته_تعديل_حذف",
  "نوته_تعديل_استبدال",
  "نوته_عرض"
];

export default handler;