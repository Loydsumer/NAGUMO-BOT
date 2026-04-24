import axios from "axios";
import cheerio from "cheerio";

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `❀⃘⃛͜𓉘᳟ี ⃞̸͢𑁃 ͟͟͞͞➳❥الاستخدام:\n\n${usedPrefix}${command} <اللغة> <الكود>\n\n📘 مثال:\n${usedPrefix}${command} python print("Hello World")`
    );

  const [langRaw, ...codeArr] = text.trim().split(" ");
  const code = codeArr.join(" ");
  const lang = langRaw?.toLowerCase();
  const allowedLangs = ["c", "cpp", "go", "java", "javascript", "python", "ruby"];

  if (!allowedLangs.includes(lang))
    return m.reply(`⚠️ اللغات المسموحة:\n${allowedLangs.join(", ")}`);
  if (!code) return m.reply("⚠️ اكتب الكود بعد اسم اللغة.");

  try {
    const runnerUrl = "https://codetester.io/runner/";
    const runUrl = "https://codetester.io/assessment/run-code";
    const checkBase = "https://codetester.io/assessment/check-submission?token=";

    
    const page = await axios.get(runnerUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const cookies = page.headers["set-cookie"]
      ? page.headers["set-cookie"].map((c) => c.split(";")[0]).join("; ")
      : "";

    const $ = cheerio.load(page.data);
    const csrfToken = $('script:contains("csrfToken")')
      .html()
      ?.match(/csrfToken\s*=\s*"([^"]+)"/)?.[1];
    if (!csrfToken) throw new Error("❌ لم أستطع استخراج رمز CSRF.");

    
    const res = await axios.post(
      runUrl,
      new URLSearchParams({
        language: lang,
        code: code,
        input: "",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrfToken,
          Cookie: cookies,
          Referer: runnerUrl,
          Origin: "https://codetester.io",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

   
    let token = null;
    if (typeof res.data === "string") {
      const match = res.data.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      );
      if (match) token = match[0];
    } else if (res.data && res.data.token) token = res.data.token;

    if (!token) throw new Error("❌ لم أستطع تحديد رمز المراجعة (token).");

    
    let output = "";
    const checkUrl = checkBase + token;
    for (let i = 0; i < 10; i++) {
      const checkRes = await axios.get(checkUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "X-Requested-With": "XMLHttpRequest",
          Cookie: cookies,
        },
      });

      if (checkRes.data && checkRes.data.status === "done") {
        output = checkRes.data.text || "";
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!output) output = "⚠️ لم تصل نتيجة التنفيذ.";

    
    await m.reply(
`❀⃘⃛͜ ۪۪۪݃𓉘᳟ี ⃞̸͢𑁃 𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦╮
        ˚₊· ͟͟͞͞➳❥💻 CodeTester
❀⃘⃛͜ 𓉘᳟ี ⃞̸͢𑁃 𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦┤
┊
├ׁ̟̇˚₊· ➳❥اللغة: ${lang}
┊
❀⃘⃛͜ 𓉘᳟ี ⃞̸͢𑁃 𓉝᳟ี ͟͟͞͞➳❥النتيجة:
\`\`\`
${output.replace(/^Stdout:\s*/, "").trim()}
\`\`\`
❀⃘⃛͜ 𓉘᳟ี ⃞̸͢𑁃 𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦╯`
    );
  } catch (err) {
    console.error("CODETESTER ERROR:", err);
    m.reply("❌ فشل التنفيذ أو رفض السيرفر الطلب (تحقق من CSRF أو الاتصال).");
  }
};

handler.command = ["run", "codetest"];
export default handler;