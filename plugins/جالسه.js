// plugins/jalsa.js
// ESM module plugin for a WhatsApp bot (handler.command style)
// Usage: .جلسة 967772350066

import axios from "axios";

/**
 * دالة إرسال الردود المحسّنة (تدعم النص العادي ورسائل الأزرار)
 * @param {object} conn - كائن الاتصال بالواتساب
 * @param {string} jid - رقم المحادثة/المجموعة
 * @param {string} text - النص الرئيسي للرسالة
 * @param {object} m - رسالة المستخدم الأصلية (للـ quoted message)
 * @param {string} [buttonText] - النص الذي يظهر على الزر
 * @param {string} [codeToCopy] - الكود الذي سيتم نسخه/استخدامه عند الضغط على الزر (بافتراض أن البوت يدعم رسائل الكتالوج/الأزرار)
 */
async function sendReply(conn, jid, text, m, buttonText = null, codeToCopy = null) {
  if (!conn) throw new Error("conn is required");
  try {
    // 1. محاولة إرسال رسالة أزرار/قائمة (إذا توفرت الدعم وكان هناك كود للنسخ)
    if (codeToCopy && typeof conn.sendButtonMessage === "function") {
      const buttons = [
        { buttonId: `copy_code_${Date.now()}`, buttonText: { displayText: buttonText || "✅ نسخ كود الجلسة" }, type: 1 }
      ];
      // يمكنك استخدام نص الكود كـ footer أو في الـ caption اعتمادًا على ما تدعمه المكتبة
      await conn.sendButtonMessage(jid, text, codeToCopy, null, buttons, { quoted: m });
      return;
    } 
    
    // 2. استخدام دالة الـ reply المعتادة
    if (typeof conn.reply === "function") {
      await conn.reply(jid, text, m);
      return;
    }
    
    // 3. استخدام دالة sendMessage (Baileys)
    if (typeof conn.sendMessage === "function") {
      await conn.sendMessage(jid, { text }, { quoted: m });
      return;
    }

    // 4. بديل بسيط
    console.log("sendReply fallback:", jid, text);
  } catch (e) {
    console.error("sendReply failed:", e);
    // العودة للرد بالنص العادي في حال فشل الأزرار
    try {
        if (typeof conn.reply === "function") {
            await conn.reply(jid, text, m);
            return;
        }
    } catch {}
  }
}


const handler = async (m, { args, text, conn }) => {
  let number;
  
  // 1. التحقق من الرقم
  try {
    number = (args && args[0]) ? args[0] : (text || "").trim().split(/\s+/)[0];
    if (!number) {
      const hint = "💡 **طريقة الاستخدام:**\nاكتب الرقم مباشرة بعد الأمر `جلسة`.\n\n**مثال:** `.جلسة 967772350066`";
      return await sendReply(conn, m.chat, hint, m);
    }
    // تنظيف الرقم
    number = number.replace(/[^\d+]/g, "");
  } catch (e) {
    return await sendReply(conn, m.chat, "❌ حدث خطأ في معالجة الرقم. تأكد من إدخال رقم صحيح.", m);
  }


  try {
    // 2. إرسال طلب API
    await sendReply(conn, m.chat, "⏳ جارٍ إرسال طلب الجلسة للرقم: **" + number + "**...\nيرجى الانتظار بضع ثوانٍ.", m);
    
    const url = `https://pair.davidcyril.name.ng/code?number=${encodeURIComponent(number)}`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Android) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
        "Accept": "application/json, text/plain, */*",
      },
      timeout: 20000, // زيادة المهلة قليلاً
    });

    const data = res.data;
    let code = null;
    let textReply = "";

    // 3. معالجة الاستجابة وبناء الرد الاحترافي
    if (!data || Object.keys(data).length === 0) {
      textReply = `⚠️ **لم يتم العثور على كود جلسة.**\nالرقم المُرسل: ${number}\n\nقد تكون الخدمة غير متاحة حاليًا أو لم يتم إنشاء الجلسة بعد.`;
    } else if (typeof data === "object" && data.code) {
      // الاستجابة المثالية التي تحتوي على كود
      code = data.code;
      textReply = `${code}`;
    } else if (typeof data === "object") {
        // إذا كان هناك JSON لكن لا يحتوي على حقل "code"
        textReply = `✅ **تمت معالجة الطلب للرقم:** ${number}\nلكن الاستجابة لا تحتوي على كود مباشرة.\n\n**تفاصيل الاستجابة:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    } else {
      // استجابة نصية أخرى غير JSON
      textReply = `✅ **تمت معالجة الطلب للرقم:** ${number}\n\n**الاستجابة:**\n${String(data)}`;
    }
    
    // 4. إرسال الرد باستخدام الدالة المحسنة (مع إمكانية إضافة زر إذا توفر الكود)
    await sendReply(conn, m.chat, textReply, m, "نسخ كود الجلسة", code);
    
  } catch (err) {
    // 5. معالجة الأخطاء
    console.error(`Jalsa Error for ${number}:`, err?.response?.status, err?.response?.data || err.message || err);
    
    let errMsg = "❌ **فشل في استدعاء الخدمة!**";
    
    if (err.response) {
      // خطأ من السيرفر
      const status = err.response.status;
      errMsg += `\n\n**حالة الخطأ:** \`${status}\` - ${status >= 500 ? 'مشكلة في الخادم' : 'خطأ في الطلب'}`;
      if (err.response.data) {
        errMsg += `\n**التفاصيل:** \n\`\`\`json\n${JSON.stringify(err.response.data).substring(0, 150)}...\n\`\`\``;
      }
    } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
       // خطأ انتهاء المهلة
       errMsg += "\n\n**السبب:** انتهت مهلة الاتصال (Timeout).\nقد يكون الخادم بطيئاً أو غير متاح حالياً.";
    } else {
       // أي خطأ آخر
       errMsg += `\n\n**التفاصيل:** \`${err.message}\``;
    }
    
    errMsg += "\n\nيرجى التأكد من الرقم والمحاولة لاحقاً. [attachment_0](attachment)";

    await sendReply(conn, m.chat, errMsg, m);
  }
};

// إعدادات البلجن
handler.help = ["جلسة <number>"];
handler.tags = ["internet", "whatsapp"];
handler.command = /^(?:\.|!|\/)?جلسة|جلسه$/i;

export default handler;