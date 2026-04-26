import axios from 'axios';

const ipinfoToken = '882ffefc502ce1'; // ضع مفتاح API الخاص بك هنا

async function getIPInfo(ip) {
    try {
        const response = await axios.get(`http://ipinfo.io/${ip}/json?token=${ipinfoToken}`);
        return response.data;
    } catch (error) {
        console.error('حدث خطأ أثناء جلب معلومات الـ IP:', error.message);
        return null;
    }
}

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    if (!text) {
        // إذا لم يتم إدخال IP بعد الأمر، نقوم بإرجاع رسالة توضيحية
        let input = `!] *إدخال خاطئ*
مثال: ${usedPrefix + command} 123.456.789.0
*مثال صحيح:* ${usedPrefix + command} 8.8.8.8`;

        m.reply(input);
        return; // إنهاء الكود هنا لأنه لم يتم إدخال IP
    }

    // إذا تم إدخال IP صالح، نقوم بجلب المعلومات الخاصة به
    getIPInfo(text).then(ipInfo => {
        if (ipInfo) {
            const ip = 
                `*عنوان الـ IP:* ${ipInfo.ip}
                *اسم المضيف:* ${ipInfo.hostname}
                *المدينة:* ${ipInfo.city}
                *المنطقة:* ${ipInfo.region}
                *البلد:* ${ipInfo.country}
                *الموقع:* ${ipInfo.loc}
                *المنظمة:* ${ipInfo.org}
                *الرمز البريدي:* ${ipInfo.postal}
                *التوقيت الزمني:* ${ipInfo.timezone}
                
                *الموقع:* ${ipInfo.loc}
                *الإحداثيات:* ${ipInfo.loc}`;

            m.reply(ip);
            m.reply('🧞‍♀️🆅🅸🆃🅾 🅱🅾🆃');
        } else {
            // في حالة عدم وجود معلومات عن الـ IP المدخل
            m.reply('🧞‍♀️ عذرًا، لم نتمكن من جلب معلومات الـ IP. يرجى التأكد من صحة الـ IP المدخل.');
        }
    }).catch(() => {
        m.reply('🧞‍♀️ حدث خطأ أثناء جلب المعلومات، يرجى المحاولة مرة أخرى. 🧞‍♀️');
    });
}

handler.help = ['trackip', 'تتبع-الاي-بي'];  
handler.tags = ['tools'];
handler.command = /^(trackip|getipinfo|تتبع-الاي-بي|اي-بي)$/i;  
handler.premium = true;
handler.limit = true;

export default handler;