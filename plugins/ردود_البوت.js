import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent } = pkg;
import fs from 'fs';
import axios from 'axios';

let handler = m => m;

handler.all = async function (m) {
  if (!m.text) return;
  if (m.key.fromMe) return;

  let chat = global.db.data.chats[m.chat];
  if (chat?.isBanned) return;

  // قراءة ملف روابط الصور المصغرة
  const linksFile = './media-links.txt';
  const links = fs.existsSync(linksFile)
      ? fs.readFileSync(linksFile, 'utf-8').split('\n').filter(Boolean)
      : [];

  const thumbUrl = links.length ? links[Math.floor(Math.random() * links.length)] : null;

  let thumbnailBuffer = null;
  if (thumbUrl) {
    try {
        const resp = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
        thumbnailBuffer = Buffer.from(resp.data, 'binary');
    } catch {}
  }

  // vCard كما هي
  const vcard = `
BEGIN:VCARD
VERSION:3.0
TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}
END:VCARD
`.trim();

  const contactInfo = {
      key: { fromMe: false, participant: m.sender, remoteJid: 'status@broadcast@g.us', id: 'Halo' },
      message: { contactMessage: { displayName: m.sender.split("@")[0], vcard } },
      participant: m.sender
  };

  // دالة لإرسال الرد للنيوزلتر مع externalAdReply
  async function sendToChannel(jid, text = '', quoted = contactInfo, options = {}) {
      const canalId = ["120363405055289796@newsletter@g.us@g.us", "120363405055289796@newsletter"];
      const canalNombre = ["𖥔ᰔᩚ⋆｡˚ ꒰🍒 𝑭𝒖𝒓𝒊𝒏𝒂 | ᴄʜᴀɴɴᴇʟ-ʙᴏᴛ 💫꒱࣭", "𖥔ᰔᩚ⋆｡˚ ꒰🍒𝑭𝒖𝒓𝒊𝒏𝒂 | ᴄʜᴀɴɴᴇʟ-ʙᴏᴛ 💫꒱"];
      const randomIndex = Math.floor(Math.random() * canalId.length);
      const channelId = canalId[randomIndex];
      const channelName = canalNombre[randomIndex];

      const contextInfo = {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
              newsletterJid: channelId,
              newsletterName: channelName,
              serverMessageId: 100
          },
          externalAdReply: {
              title: "𝑭𝒖𝒓𝒊𝒏𝒂|𝐂𝐇𝐀𝐓",
              body: '𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐑𝐀𝐃𝐈𝐎',
              mediaUrl: 'https://chat.whatsapp.com/KOSYkTDnY7H6ar8mLKosZf?mode=wwt',
              mediaType: 2,
              showAdAttribution: true,
              thumbnail: thumbnailBuffer
          },
          ...options.contextInfo
      };

      await conn.sendMessage(jid, {
          text,
          ...(thumbUrl ? { image: { url: thumbUrl }, caption: text } : {}),
          ...options,
          contextInfo
      }, { quoted });
  }

  // الردود التلقائية
  const replies = [
  { regex: /^احا$/i, text: "*هاها، خـدها و شـوف بنفسك 😆*" },
  { regex: /^فورينا$/i, text: "*نـعـم هــنـا فورينا تحـب تكـلمك 😳*" },
  { regex: /^الحمدلله$/i, text: "*اِدَام الله حَمدَك 💖*" },
  { regex: /^عبيط$|^يا عبيط$|^اهبل$|^غبي$/i, text: "*أوي يـا بــيـبي 😅❤️*" },
  { regex: /^تست$/i, text: "*هــنـا، هــاي، احـكي لروبـي ايـه 😇*" },
  { regex: /^يب$/i, text: "*يـعـم قـول نـعـم 😏💘*" },
  { regex: /^راديو$/i, text: "*مطوري\nرقمه:https://wa.me/201500564191*" },
  { regex: /^منور$|^منوره$/i, text: "*مـنـور بوجودك روبـي 🫶*" },
  { regex: /^امزح$|^بهزر$/i, text: "*هاها دمك خفيف، مش هـزعلك 😅*" },
  { regex: /^في ايه$/i, text: "*اَنا مـش فاهم كـل الحـكاية 🤔*" },
  { regex: /^تصبح علي خير$|^تصبحوا علي خير$/i, text: "*تصبح على خير يا حـبـيـبي ✨💜*" },
  { regex: /^هلا$/i, text: "*هــلا بيك كـيفك روبـي 🧸*" },
  { regex: /^سلام$/i, text: "*و علـيـكـم السـلام و رَحـمـة الله 🌿*" },
  { regex: /^هههه$|^هاها$/i, text: "*😂 ضـحـكـت روبـي النهـاردة 😎*" },
  { regex: /^مستعد$/i, text: "*اكـيـد جـاهـزة 🔥*" },
  { regex: /^شنو$/i, text: "*شـنـو الحـكـايـة روبـي 🧐*" },
  { regex: /^وينك$/i, text: "*اَنا هـنـا، ما تـقدّر تـهرب مني 😏*" },
  { regex: /^زين$/i, text: "*تـمـام الحـمدلـلـه 🌟*" },
  { regex: /^يلا$/i, text: "*يـلـا بينـا نـمشي 🚀*" },
  { regex: /^موافق$/i, text: "*تـمـام، متـفـقـيـن 🤝*" },
  { regex: /^عايز انام$/i, text: "*خـذ قـسطك من الـرآحـة روبـي 😴*" }
];
  for (let r of replies) {
      if (r.regex.test(m.text)) {
          await sendToChannel(m.chat, r.text);
      }
  }

  return !0;
};

export default handler;