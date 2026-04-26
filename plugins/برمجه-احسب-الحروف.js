let handler = async (m, { conn, text }) => {
  try {
    let obito;
    let replyToMessage = m.quoted; 

    if (replyToMessage) {

      obito = replyToMessage.text;
    } else if (text && text.trim() !== "") {

      obito = text;
    } else {

      return m.reply("*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*🧞‍♀️ الرجاء إرسال النص أو الرد على رسالة تريد حساب عدد أحرفها*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*");
    }


    const totalobito = obito.length;


    await m.reply(`*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*عدد الأحرف / الرموز......، التي قدمتها في رساله هي : ${totalobito} 💗🌚*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*`);
  } catch (error) {
    console.error("Error:", error);
    await m.reply("*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*\n*🚨 حدث خطأ أثناء حساب عدد الأحرف. حاول مجددًا لاحقًا*\n*⎔ ⋅ ───━ •﹝🧞‍♀️﹞• ━─── ⋅ ⎔*");
  }
};

handler.help = ["اوبيتو"];
handler.tags = ["اوبيتو"];
handler.command = /^(حساب-الحروف)$/i;

export default handler;