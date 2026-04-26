let handler = async (m, { conn, command }) => {
  conn.prefix = null
  
  // رسالة توضيحية حسب الأمر
  let usageMessage = ''
  if (/^resetprefix|resetpr|اعادةالبادئة|اعادة_البادئة$/i.test(command)) {
    usageMessage = `
👻 *تمت إعادة تعيين البادئة (Prefix) للوضع الافتراضي.* 👻

📌 *التوضيح:*  
يا ولدي... البادئة هي العلامة اللي تبدأ بها أوامرك للبوت.  
الآن بعد التصفير... البوت ينتظرك تكتب أوامرك مباشرة بدون بادئة.

👑 *مثال:*  
\`.منيو\` ❌ (لن تعمل بعد الآن)  
\`منيو\` ✅ (هكذا ستعمل)  

⚜️ لا تنسى... 🕶️
"الرجل الذي لا يحافظ على النظام... لا يستحق أن يكون محترمًا."
    `
  }

  await m.reply(usageMessage + "\n\nᎧᎶᏗᎷᎥ ᏰᎧᏖ 👻")
}

handler.help = ['resetprefix', 'resetpr', 'اعادةالبادئة', 'اعادة_البادئة']
handler.tags = ['owner']
handler.command = /^(resetprefix|resetpr|اعادةالبادئة|اعادة_البادئة)$/i
handler.mods = true

export default handler