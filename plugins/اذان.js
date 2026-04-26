import axios from 'axios';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

// دالة لتحويل الوقت إلى النظام الـ12 ساعة
function format12HourTime(time24) {
  const [hours, minutes] = time24.split(':');
  let period = 'AM';
  let hours12 = parseInt(hours, 10);

  if (hours12 >= 12) {
    period = 'PM';
    if (hours12 > 12) hours12 -= 12;
  }

  return `${hours12}:${minutes} ${period}`;
}

const handler = async (m, { text, usedPrefix, command }) => {
  const rows = [
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " الــقــاهــره ", description: '', id: `${usedPrefix + command} القاهره` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " الرياض ", description: '', id: `${usedPrefix + command} الرياض` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " الدار البيضاء ", description: '', id: `${usedPrefix + command} الدار البيضاء` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " دبي ", description: '', id: `${usedPrefix + command} دبي` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " بيروت ", description: '', id: `${usedPrefix + command} بيروت` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " تونس ", description: '', id: `${usedPrefix + command} تونس` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " الجزائر ", description: '', id: `${usedPrefix + command} الجزائر` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " بغداد ", description: '', id: `${usedPrefix + command} بغداد` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " عمان ", description: '', id: `${usedPrefix + command} عمان` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " الخرطوم ", description: '', id: `${usedPrefix + command} الخرطوم` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " دمشق ", description: '', id: `${usedPrefix + command} دمشق` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " طرابلس ", description: '', id: `${usedPrefix + command} طرابلس` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " مسقط ", description: '', id: `${usedPrefix + command} مسقط` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " الدوحة ", description: '', id: `${usedPrefix + command} الدوحة` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " المنامة ", description: '', id: `${usedPrefix + command} المنامة` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " الكويت ", description: '', id: `${usedPrefix + command} الكويت` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " جدة ", description: '', id: `${usedPrefix + command} جدة` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " مكة ", description: '', id: `${usedPrefix + command} مكة` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " المدينة ", description: '', id: `${usedPrefix + command} المدينة` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " الشارقه ", description: '', id: `${usedPrefix + command} الشارقة` },
    { header: '⌈ الصلاة اليوم في مدينة: ⌋', title: " المغرب ", description: '', id: `${usedPrefix + command} المغرب` }
  ];

  const images = [
    'https://ar.prayerinislam.com/wp-content/uploads/المشروع-في-المسجد.jpg',
    'https://islamonline.net/wp-content/uploads/2023/02/الإمام-والمؤذن-صلاة-الجماعة.jpg',
    'https://daleelalmasjed.com/upload/3021162680-258.png',
    'https://www.al-jazirah.com/2022/20220307/ln_69_1.jpg',
    'https://www.cairo24.com/UploadCache/libfiles/66/3/600x338o/426.jpg'
  ];

  // اختيار صورة عشوائية
  const randomImage = images[Math.floor(Math.random() * images.length)];
  const mediaMessage = await prepareWAMessageMedia({ image: { url: randomImage } }, { upload: conn.waUploadToServer });

  // إعداد الرسالة النصية والميديا للإرسال
  const caption = `مــرحــبـا يــا @${m.pushName}\nاخــتــاࢪ مـن قــائــمــة الــدول 🧞‍♀️`;
  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: { text: caption },
          footer: { text: wm},
          header: {
            hasMediaAttachment: true,
            imageMessage: mediaMessage.imageMessage
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: 'قــائــمــة الــدول',
                  sections: [
                    {
                      title: '「 الــدول 🧞‍♀️ 」',
                      highlight_label: 'ام الدنيا 🧞‍♀️',
                      rows: rows
                    }
                  ]
                })
              }
            ]
          }
        }
      }
    }
  }, { userJid: conn.user.jid, quoted: m });

  // إذا تم إرسال الأمر بمدينة محددة، استعلام عن مواقيت الصلاة وإضافتها إلى الرسالة
  if (text) {
    try {
      const prayerResponse = await axios.get(`http://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(text)}&country=EG`);
      const prayerData = prayerResponse.data.data.timings;

      const fajr = format12HourTime(prayerData.Fajr);
      const sunrise = format12HourTime(prayerData.Sunrise);
      const dhuhr = format12HourTime(prayerData.Dhuhr);
      const asr = format12HourTime(prayerData.Asr);
      const maghrib = format12HourTime(prayerData.Maghrib);
      const isha = format12HourTime(prayerData.Isha);

      const prayerMessage = `هــذه هـيــا مـواقــت الــصـلاه فــى ${text} الــيــوم:\n- ┇↜الـفـجــࢪ: ${fajr}\n- ┇↜الــشـࢪوق: ${sunrise}\n- ┇↜الــظـهـࢪ: ${dhuhr}\n- ┇↜الــعــصـࢪ: ${asr}\n- ┇↜الــمــغــࢪب: ${maghrib}\n- ┇↜الــعشــاء: ${isha}`;

      const mediaMessageWithPrayer = await prepareWAMessageMedia({ image: { url: randomImage } }, { upload: conn.waUploadToServer });
      const msgWithPrayer = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: prayerMessage },
              footer: { text: '♡┆𝙱𝙾𝚃-𝙼𝚄𝙺𝙾┆♡' },
              header: {
                hasMediaAttachment: true,
                imageMessage: mediaMessageWithPrayer.imageMessage
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      title: 'قــائــمــة الــدول',
                      sections: [
                        {
                          title: '「 الــدول 🧞‍♀️ 」',
                          highlight_label: 'ام الدنيا 🧞‍♀️',
                          rows: rows
                        }
                      ]
                    })
                  }
                ]
              }
            }
          }
        }
      }, { userJid: conn.user.jid, quoted: m });

      await conn.relayMessage(m.chat, msgWithPrayer.message, { messageId: msgWithPrayer.key.id });
    } catch (error) {
      console.error('حدث خطأ في الحصول على مواقيت الصلاة:', error);
      m.reply('عذرًا، لم أتمكن من العثور على مواقيت الصلاة لهذه المدينة.');
    }
  } else {
    // إرسال الرسالة المعدلة بالقائمة إذا لم يتم إدخال مدينة
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }
}

handler.command = ['الصلاة', 'اذان', 'الصلاه'];
handler.tags = ['tools'];

export default handler;