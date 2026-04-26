import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("- 「🔪」 هل تظن أنني أقرأ العقول؟ اكتب شيئًا بعد الأمر.\nمثال:\n⟣ .استور افضل انمي ⟣\n*.استور* اكتب رمز JS");

  await m.reply("... هذا الوقت الذي تضيع فيه، فقط لأسألك؟ انتظر لحظة.");

  try {
    let result = await CleanDx(text);
    await m.reply(`*╮━━━━━━━🎩━━━━━━━🔪*\n『 🤖 』${result}\n*╯━━━━━━━🎩━━━━━━━🔪*`);
  } catch (e) {
    await m.reply("『 🤖 』هل تظن أنني أهتم؟ حتى الـ AI لا يتوانى عن تجاهلك.");
  }
};

handler.help = ["dx"];
handler.tags = ["ai"];
handler.command = /^(الستور)$/i;

export default handler;

async function CleanDx(your_qus) {
  let Baseurl = "https://alakreb.vercel.app/api/ai/gpt?q=";
  
  // جعل الـ API يتحدث كـ الاستور من "هازبين هوتيل" بشكل دقيق
  let prompt = `تحدث كـ الاستور من "هازبين هوتيل". استخدم أسلوبه الخاص في الرد، تذكر كل شيء يتعلق بشخصيته: قسوة، سخرية، وذكاء لاذع. سؤالي هو: ${your_qus}`;

  let response = await fetch(Baseurl + encodeURIComponent(prompt)); // إرسال النص المحسن إلى الـ API
  let data = await response.json();
  return data.message; // هذه هي الرسالة من الـ API
}