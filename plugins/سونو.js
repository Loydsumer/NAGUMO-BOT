// • Feature : suno ai music 
// • Developers : izana x radio
// • Channel : https://whatsapp.com/channel/0029VbB2Uwg11ulIMA9bfq2c
import axios from "axios";
import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

const IMAGE_URL = "https://qu.ax/lOcWx.jpg";

function detectLanguage(text) {
  return /[\u0600-\u06FF]/.test(text) ? "arabic" : "english";
}

const musicTypes = [
  "pop","rock","jazz","classical","hiphop","rap","rnb","electronic","house","techno",
  "trance","chill","ambient","folk","country","blues","metal","punk","reggae","latin",
  "salsa","tango","afrobeat","kpop","soundtrack","instrumental","lofi","trap","gospel",
  "opera","world","disco","funk"
];

const handler = async (m, { conn, text = "", usedPrefix = ".", command = "" }) => {
  try {
    // سونو (النسق الكامل: وصف -> اختيار نوع -> اختيار مغني -> توليد باستخدام suno-ai)
    if (command === "سونو") {
      if (!text) return m.reply(`🎵 أرسل وصف الأغنية بعد الأمر.\nمثال:\n${usedPrefix}سونو عن الأمل والحياة`);
      const lang = detectLanguage(text);
      const media = await prepareWAMessageMedia({ image: { url: IMAGE_URL } }, { upload: conn.waUploadToServer });
      const caption = `🎶 اختر نوع الموسيقى المناسب للوصف التالي:\n\n"${text}"`;
      const rows = musicTypes.map(gt => ({
        title: gt,
        id: `${usedPrefix}سونو-اختيار-مغني ${encodeURIComponent(text)}|${gt}|${lang}`
      }));
      const msg1 = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { hasMediaAttachment: true, imageMessage: media.imageMessage },
              body: { text: caption },
              footer: { text: "🎧 SUNO | AI MUSIC BOT" },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "اختر نوع الموسيقى",
                      sections: [{ title: "🎧 الأنواع المتاحة", rows }]
                    })
                  }
                ]
              }
            }
          }
        }
      }, { userJid: conn.user.jid, quoted: m });
      return await conn.relayMessage(m.chat, msg1.message, { messageId: msg1.key.id });
    }

    // سونو-اختيار-مغني (رد من سونو لاختيار الصوت ثم يوجّه لسونو-توليد)
    if (command === "سونو-اختيار-مغني") {
      const parts = text.split("|");
      const encodedDesc = parts.shift();
      const genre = parts.shift();
      const lang = parts.shift();
      if (!encodedDesc || !genre) return m.reply("⚠️ حدث خطأ في البيانات.");
      const desc = decodeURIComponent(encodedDesc);
      const media = await prepareWAMessageMedia({ image: { url: IMAGE_URL } }, { upload: conn.waUploadToServer });
      const caption = `🎤 اختر نوع الصوت:\n\nالوصف: ${desc}\nالنوع: ${genre}`;
      const rows = [
        { title: "🎙️ صوت ذكر", id: `${usedPrefix}سونو-توليد ${encodeURIComponent(desc)}|${genre}|male|${lang}` },
        { title: "🎧 صوت أنثى", id: `${usedPrefix}سونو-توليد ${encodeURIComponent(desc)}|${genre}|female|${lang}` },
        { title: "🤖 صوت روبوتي", id: `${usedPrefix}سونو-توليد ${encodeURIComponent(desc)}|${genre}|robotic|${lang}` }
      ];
      const msg2 = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { hasMediaAttachment: true, imageMessage: media.imageMessage },
              body: { text: caption },
              footer: { text: "🎧 SUNO | AI MUSIC BOT" },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "اختر نوع الصوت",
                      sections: [{ title: "خيارات الصوت", rows }]
                    })
                  }
                ]
              }
            }
          }
        }
      }, { userJid: conn.user.jid, quoted: m });
      return await conn.relayMessage(m.chat, msg2.message, { messageId: msg2.key.id });
    }

    // سونو-توليد (ينادي dark-api-x/suno-ai)
    if (command === "سونو-توليد") {
      const parts = text.split("|");
      const encodedDesc = parts.shift();
      const genre = parts.shift();
      const gender = parts.shift();
      const lang = parts.shift() || "english";
      if (!encodedDesc || !genre || !gender) return m.reply("⚠️ البيانات غير كاملة.");
      const desc = decodeURIComponent(encodedDesc);
      await m.reply("🎧 جارٍ توليد الأغنية، يرجى الانتظار...");
      const prompt = `${desc}. النوع: ${genre}. الصوت: ${gender}. اللغة: ${lang}`;
      const url = `https://dark-api-x.vercel.app/api/v1/ai/suno-ai?prompt=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(url).catch(e => ({ data: null }));
      if (!data?.status) return m.reply("❌ فشل إنشاء الأغنية، حاول لاحقًا.");
      const { info, urls, lyrics } = data;
      const title = info?.title || "أغنية مجهولة";
      const media = await prepareWAMessageMedia({ image: { url: urls?.image || IMAGE_URL } }, { upload: conn.waUploadToServer });
      const msg3 = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { hasMediaAttachment: true, imageMessage: media.imageMessage },
              body: { text: `🎶 تم توليد أغنية بواسطة Suno!\n\n🎵 العنوان: ${title}\n🎧 النوع: ${info?.genre || genre}\n🗣️ الصوت: ${info?.voice || gender}\n📜 الوصف: ${info?.prompt || desc}` },
              footer: { text: "⚡ SUNO | AI MUSIC BOT" },
              nativeFlowMessage: {
                buttons: [
                  { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🎧 استمع الآن", url: urls?.audio || "" }) },
                  { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🖼️ عرض الصورة", url: urls?.image || "" }) }
                ]
              }
            }
          }
        }
      }, { userJid: m.sender, quoted: m });
      await conn.relayMessage(m.chat, msg3.message, { messageId: msg3.key.id });
      if (urls?.audio) await conn.sendMessage(m.chat, { audio: { url: urls.audio }, mimetype: "audio/mpeg", fileName: `${title}.mp3` }, { quoted: m });
      if (lyrics) await conn.sendMessage(m.chat, { text: `📝 كلمات الأغنية:\n\n${lyrics}` }, { quoted: m });
      return;
    }

    // سونو-كلمات (بدء المرحلة الخاصة بكلمات فقط - اختيار النوع أولًا)
    if (command === "سونو-كلمات") {
      if (!text) return m.reply(`🎵 أرسل وصف الأغنية بعد الأمر.\nمثال:\n${usedPrefix}سونو-كلمات رايدو مظتي`);
      const lang = detectLanguage(text);
      const media = await prepareWAMessageMedia({ image: { url: IMAGE_URL } }, { upload: conn.waUploadToServer });
      const caption = `✍️ اختر نوع الموسيقى لكلماتك:\n\n"${text}"`;
      const rows = musicTypes.map(gt => ({
        title: gt,
        id: `${usedPrefix}سونو-كلمات-اختيار-مغني ${encodeURIComponent(text)}|${gt}|${lang}`
      }));
      const msg4 = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { hasMediaAttachment: true, imageMessage: media.imageMessage },
              body: { text: caption },
              footer: { text: "🎧 SUNO | AI WORDS BOT" },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "اختر نوع الموسيقى",
                      sections: [{ title: "🎧 الأنواع", rows }]
                    })
                  }
                ]
              }
            }
          }
        }
      }, { userJid: conn.user.jid, quoted: m });
      return await conn.relayMessage(m.chat, msg4.message, { messageId: msg4.key.id });
    }

    // سونو-كلمات-اختيار-مغني (اختيار الصوت ثم يوجّه لسونو-كلمات-توليد)
    if (command === "سونو-كلمات-اختيار-مغني") {
      const parts = text.split("|");
      const encodedDesc = parts.shift();
      const genre = parts.shift();
      const lang = parts.shift();
      if (!encodedDesc || !genre) return m.reply("⚠️ حدث خطأ في البيانات.");
      const desc = decodeURIComponent(encodedDesc);
      const media = await prepareWAMessageMedia({ image: { url: IMAGE_URL } }, { upload: conn.waUploadToServer });
      const caption = `🎤 اختر نوع الصوت لكلماتك:\n\nالوصف: ${desc}\nالنوع: ${genre}`;
      const rows = [
        { title: "🎙️ صوت ذكر", id: `${usedPrefix}سونو-كلمات-توليد ${encodeURIComponent(desc)}|${genre}|male|${lang}` },
        { title: "🎧 صوت أنثى", id: `${usedPrefix}سونو-كلمات-توليد ${encodeURIComponent(desc)}|${genre}|female|${lang}` },
        { title: "🤖 صوت روبوتي", id: `${usedPrefix}سونو-كلمات-توليد ${encodeURIComponent(desc)}|${genre}|robotic|${lang}` }
      ];
      const msg5 = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { hasMediaAttachment: true, imageMessage: media.imageMessage },
              body: { text: caption },
              footer: { text: "🎧 SUNO | AI WORDS BOT" },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "اختر نوع الصوت",
                      sections: [{ title: "خيارات الصوت", rows }]
                    })
                  }
                ]
              }
            }
          }
        }
      }, { userJid: conn.user.jid, quoted: m });
      return await conn.relayMessage(m.chat, msg5.message, { messageId: msg5.key.id });
    }

    // سونو-كلمات-توليد (ينادي suno-words)
    if (command === "سونو-كلمات-توليد") {
      const parts = text.split("|");
      const encodedDesc = parts.shift();
      const genre = parts.shift() || "pop";
      const voice = parts.shift() || "female";
      const lang = parts.shift() || "arabic";
      if (!encodedDesc) return m.reply("⚠️ البيانات غير كاملة.");
      const desc = decodeURIComponent(encodedDesc);
      await m.reply("🎧 جارٍ إنشاء الأغنية بالكلمات، انتظر قليلاً...");
      const descForApi = `${desc} | genre:${genre} | voice:${voice}`;
      const url = `https://dark-api-x.vercel.app/api/v1/ai/suno-words?desc=${encodeURIComponent(descForApi)}`;
      const res = await axios.get(url).catch(e => ({ data: null }));
      const data = res.data;
      if (!data?.status) return m.reply("❌ فشل إنشاء الأغنية.");
      const { title, genre: respGenre, voice: respVoice, model, prompt } = data.info;
      const audio = data.audioUrl;
      const image = data.imageUrl || IMAGE_URL;
      const media = await prepareWAMessageMedia({ image: { url: image } }, { upload: conn.waUploadToServer });
      const msg6 = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { hasMediaAttachment: true, imageMessage: media.imageMessage },
              body: { text: `🎶 تم إنشاء أغنية بواسطة Suno!\n\n🎵 العنوان: ${title}\n🎧 النوع: ${respGenre || genre}\n🗣️ الصوت: ${respVoice || voice}\n🧠 الموديل: ${model}\n📜 الوصف: ${prompt || desc}` },
              footer: { text: "⚡ SUNO | AI WORDS BOT" },
              nativeFlowMessage: {
                buttons: [
                  { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🎧 استمع للأغنية", url: audio || "" }) },
                  { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🖼️ عرض الصورة", url: image || "" }) }
                ]
              }
            }
          }
        }
      }, { userJid: m.sender, quoted: m });
      await conn.relayMessage(m.chat, msg6.message, { messageId: msg6.key.id });
      if (audio) await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: "audio/mpeg", fileName: `${title}.mp3` }, { quoted: m });
      return;
    }

  } catch (err) {
    console.error(err);
    return m.reply(`❌ حدث خطأ أثناء تنفيذ الأمر:\n${err.message}`);
  }
};

handler.command = ["سونو", "سونو-اختيار-مغني", "سونو-توليد", "سونو-كلمات", "سونو-كلمات-اختيار-مغني", "سونو-كلمات-توليد"];
export default handler;