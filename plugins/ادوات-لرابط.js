import fs from 'fs';
import axios from 'axios';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  // إذا كان الرقم المدخل 9 أو أكثر، نتجاهل الرسالة التحذيرية
  if (parseInt(text) >= 9) return;

  if (!mime) throw '*❲ 💡 ❳ يرجى تحديد الملف الذي تود تحويله لرابط .*\n> مثال: ' + usedPrefix + command + ' ريبلي الملف';

  const media = await q.download();

  // استخراج نوع الملف وصيغته
  const { ext, mime: fileMime } = await fileTypeFromBuffer(media);
  const fileType = fileMime.split('/')[0]; // نوع الملف (image, video, audio, ...)

  if (!text) {
    throw '*❲ 💡 ❳ يرجى تحديد الخيار الذي تريد استعماله للرفع .*\n' +
    '*❱ الخيارات المتاحة:*\n' +
    '1 - Gofile\n' +
    '2 - File.io\n' +
    '3 - Imgbb (صور فقط)\n' +
    '4 - Quax\n' +
    '5 - Ezgif (صور فقط)\n' +
    '6 - Uguu\n' +
    '7 - Catbox\n' +
    '8 - Catbox\n' +
    '\n📌 *مثال:* *.لرابط 3*';
  }

  let link;
  switch (text) {
    case '1':
      link = await uploadToGofile(media, ext);
      break;
    case '2':
      link = await uploadToFileio(media, ext);
      break;
    case '3':
      if (!/image/.test(mime)) throw '*❲ ❗ ❳ يرجى تحديد صور فقط لاستعمال هذا الخيار .*';
      link = await uploadToImgbb(media);
      break;
    case '4':
      link = await uploadToQuax(media, ext);
      break;
    case '5':
      if (!/image/.test(mime)) throw '*❲ ❗ ❳ يرجى تحديد صور فقط لاستعمال هذا الخيار .*';
      link = await uploadToEzgif(media);
      break;
    case '6':
      link = await uploadToUguu(media, ext);
      break;
    case '7':
      link = await uploadToCatbox(media, ext);
      break;  
    case '8':
      link = await uploadToCatbox(media, ext);
      break;
    default:
      throw '*❲ 💡 ❳ حدد الخيار الصحيح من القائمة .*';
  }

  let cap = '🧞‍♀️ *⎆─┈┈〔 معلومات الملف 〕─┈⌲*\n\n';
  cap += '📂 *الاسم:* ' + (q.filename || `file.${ext}`) + '\n';
  cap += '🔖 *النوع:* ' + fileType + '\n'; // عرض نوع الملف
  cap += '📌 *الصيغة:* ' + ext + '\n'; // عرض صيغة الملف
  cap += '📄 *الامتداد الكامل:* ' + mime + '\n';
  cap += '🔗 *الرابط:* ' + link + '\n';

  cap += '\nＯᏀᎯᎷᏆ 👻 ᏴᎾᎢ';

  m.reply(cap);
};

handler.help = ['لرابط <رد على ملف>'];
handler.tags = ['ملف'];
handler.command = ['لرابط'];

export default handler;

// رفع إلى Gofile
const uploadToGofile = async (buffer, ext) => {
  const form = new FormData();
  form.append('file', buffer, `file.${ext}`);

  try {
    const response = await fetch('https://store2.gofile.io/uploadFile', {
      method: 'POST',
      body: form,
    });
    const result = await response.json();

    if (result.status !== 'ok' || !result.data || !result.data.downloadPage) {
      throw new Error('فشل في رفع الملف إلى Gofile.io');
    }
    return result.data.downloadPage;
  } catch (error) {
    console.error('خطأ أثناء رفع الملف إلى Gofile:', error.message);
    throw new Error(`فشل في رفع الملف: ${error.message}`);
  }
};

// رفع إلى File.io
const uploadToFileio = async (buffer, ext) => {
  const form = new FormData();
  form.append('file', buffer, `file.${ext}`);

  try {
    const response = await fetch('https://file.io', {
      method: 'POST',
      body: form,
    });
    const result = await response.json();
    if (!result.success || !result.link) {
      throw new Error('فشل في رفع الملف إلى File.io');
    }
    return result.link;
  } catch (error) {
    throw new Error(`فشل في رفع الملف: ${error.message}`);
  }
};

// رفع إلى Imgbb
const uploadToImgbb = async (buffer) => {
  const formData = new FormData();
  formData.append('image', buffer, { filename: 'file' });

  try {
    const api = await axios.post('https://api.imgbb.com/1/upload?key=10604ee79e478b08aba6de5005e6c798', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return api.data.data.url;
  } catch (error) {
    throw new Error(`فشل في رفع الملف: ${error.message}`);
  }
};

// رفع إلى Quax
const uploadToQuax = async (buffer, ext) => {
  const form = new FormData();
  form.append('files[]', buffer, `file.${ext}`);

  try {
    const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form });
    const result = await res.json();

    if (result && result.success) {
      return result.files[0].url;
    } else {
      throw new Error('فشل في رفع الملف.');
    }
  } catch (error) {
    throw new Error(`فشل في رفع الملف: ${error.message}`);
  }
};

// رفع إلى Ezgif
const uploadToEzgif = async (buffer) => {
  let imageBase64 = buffer.toString('base64');
  const response = await axios.post('https://zoro-foryou.vercel.app/api/img-to-url', {
    image: imageBase64
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.data.status) {
    return response.data.imageUrl;
  } else {
    throw new Error('فشل في رفع الملف.');
  }
};

// رفع إلى Uguu
const uploadToUguu = async (buffer, ext) => {
  const form = new FormData();
  form.append('files[]', buffer, `file.${ext}`);

  try {
    const response = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: form
    });
    const result = await response.json();

    if (!result.files || result.files.length === 0) {
      throw new Error('فشل في رفع الملف إلى Uguu.se');
    }

    return result.files[0].url;  // إرجاع الرابط النهائي
  } catch (error) {
    throw new Error(`فشل في رفع الملف: ${error.message}`);
  }
};

// رفع إلى Catbox
const uploadToCatbox = async (buffer, ext) => {
  const form = new FormData();
  form.append('fileToUpload', buffer, `file.${ext}`);
  form.append('reqtype', 'fileupload'); // إضافة حقل reqtype لتحديد نوع الطلب

  try {
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
    });

    const text = await response.text(); // احصل على النص من الاستجابة
    console.log('Response Text:', text); // طباعة الاستجابة

    // تحليل النص إذا كان يحتوي على URL مباشر
    if (text.startsWith('https://')) {
      return text; // إرجاع الرابط المباشر
    } else {
      throw new Error('فشل في رفع الملف إلى Catbox: ' + text);
    }
  } catch (error) {
    throw new Error(`فشل في رفع الملف: ${error.message}`);
  }
};