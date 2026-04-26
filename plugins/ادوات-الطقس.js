import axios from 'axios';

const handler = async (m, { args }) => {
  if (!args[0]) throw '🧞‍♀️ يجب عليك إدخال اسم المدينة أو الدولة لمعرفة حالة الطقس!';

  try {
    const response = axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
    const res = await response;

    const name = res.data.name;
    const country = res.data.sys.country;
    const weatherDescription = res.data.weather[0].description;
    const temperature = res.data.main.temp;
    const minTemperature = res.data.main.temp_min + '°C';
    const maxTemperature = res.data.main.temp_max + '°C';
    const humidity = res.data.main.humidity + '%';
    const windSpeed = res.data.wind.speed + ' كم/س';

    // تعليقات مرحة بناءً على درجة الحرارة الحالية
    let funnyMessage = '';
    if (temperature >= 40) {
      funnyMessage = '🔥 إذا ذهبت هنا ستتحول إلى دجاجة مشوية! 🐔';
    } else if (temperature >= 30) {
      funnyMessage = '😎 الجو حار، تأكد من إحضار مظلتك وقبعة شمسية!';
    } else if (temperature >= 20) {
      funnyMessage = '☀️ الجو معتدل، استمتع بوقتك في الخارج!';
    } else if (temperature >= 10) {
      funnyMessage = '🧥 الجو بارد قليلاً، لا تنسَ ارتداء سترتك!';
    } else if (temperature >= 0) {
      funnyMessage = '❄️ الجو بارد، ارتدِ ملابس دافئة!';
    } else {
      funnyMessage = '🥶 اوه، احذر! عليك ارتداء جلد حمار إذا أردت الذهاب هناك!';
    }

    const weatherMessage = `🧞‍♀️ حالة الطقس في ${name} (${country}):\n`
      + `- الوصف: ${weatherDescription}\n`
      + `- درجة الحرارة: ${temperature}°C\n`
      + `- أدنى درجة حرارة: ${minTemperature}\n`
      + `- أعلى درجة حرارة: ${maxTemperature}\n`
      + `- الرطوبة: ${humidity}\n`
      + `- سرعة الرياح: ${windSpeed}\n\n`
      + `📢 ${funnyMessage}`;

    m.reply(weatherMessage);

  } catch (error) {
    console.error('🧞‍♀️ حدث خطأ أثناء جلب حالة الطقس:', error);
    m.reply('عذرًا، لم أتمكن من العثور على بيانات الطقس للمدينة أو الدولة المطلوبة.');
  }
};

handler.help = ['الطقس <اسم المدينة/الدولة>'];
handler.tags = ['أدوات'];
handler.command = /^(الطقس|clima)$/i;

export default handler;