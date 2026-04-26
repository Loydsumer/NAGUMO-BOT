import axios from 'axios';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;

// ✅ **البحث في GitHub**
const searchGitHub = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.sendMessage(m.chat, {
    image: { url: "https://qu.ax/pDfXT.png" },
    caption: `*╭━━━━━━❨🔎❩━━━━━━╮*\n` +
             `🚨 *يرجى إدخال اسم المشروع للبحث في GitHub!*\n` +
             `🔍 *مثال:* \n➤  ${usedPrefix + command} WhatsApp-Bot\n` +
             `*╰━━━━━━❨🔎❩━━━━━━╯*`
  }, { quoted: m });

  await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&per_page=100`;
    const { data } = await axios.get(url);

    if (!data.items.length) throw "❌ *لم يتم العثور على أي مستودع مطابق!*";

    let sections = data.items.map((repo) => ({
      title: `📂 ${repo.name}`,
      rows: [
        {
          title: "📥 تحميل المستودع",
          description: `⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | 👤 ${repo.owner.login}`,
          id: `${usedPrefix}جيتهاب2 ${repo.html_url}`
        }
      ]
    }));

    const interactiveMessage = {
      body: { text: `*🔎 تم العثور على ${data.items.length} مستودع*\n\n> *اختر المستودع المطلوب للتحميل:*` },
      footer: { text: "🚀 *GitHub Search*" },
      header: { imageMessage: { url: "https://qu.ax/pDfXT.png" } }, // ✅ **إضافة الصورة في القائمة**
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '❲ 📜 قائمة المستودعات ❳',
              sections
            })
          }
        ],
        messageParamsJson: ''
      }
    };

    let msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: { message: { interactiveMessage } }
    }, { userJid: conn.user.jid, quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (error) {
    conn.sendMessage(m.chat, {
      image: { url: "https://qu.ax/pDfXT.png" },
      caption: `❌ *حدث خطأ أثناء البحث في GitHub!*\n⚠️ *التفاصيل:* ${error.message}`
    }, { quoted: m });
  }
};

// ✅ **تحميل المستودع مباشرة**
const downloadGitHubRepo = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return conn.sendMessage(m.chat, {
    image: { url: "https://qu.ax/pDfXT.png" },
    caption: `*╭━━━━━━❨🔗❩━━━━━━╮*\n` +
             `🚨 *يرجى إدخال رابط المستودع للتحميل!*\n` +
             `🔽 *مثال:*\n➤  ${usedPrefix + command} https://github.com/user/repo\n` +
             `*╰━━━━━━❨🔗❩━━━━━━╯*`
  }, { quoted: m });

  if (!regex.test(args[0])) throw "⚠️ *الرابط المدخل غير صحيح! تأكد من أنه رابط GitHub صالح.*";

  let [_, user, repo] = args[0].match(regex) || [];
  repo = repo.replace(/.git$/, '');
  const url = `https://api.github.com/repos/${user}/${repo}/zipball`;

  try {
    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

    await conn.sendMessage(m.chat, {
      document: { url },
      mimetype: 'application/zip',
      fileName: `${repo}.zip`,
      caption: `📂 *تم تحميل المستودع من GitHub!*\n🔗 *الرابط:* ${args[0]}`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });

  } catch (error) {
    conn.sendMessage(m.chat, {
      image: { url: "https://qu.ax/pDfXT.png" },
      caption: `❌ *حدث خطأ أثناء تحميل المستودع!*\n⚠️ *التفاصيل:* ${error.message}`
    }, { quoted: m });
  }
};

// ✅ **دمج أوامر البحث والتحميل**
const handler = async (m, context) => {
  const { usedPrefix, command } = context;
  if (command === 'جيتهاب') return searchGitHub(m, context);
  if (command === 'جيتهاب2') return downloadGitHubRepo(m, context);
};

handler.command = /^(جيتهاب|جيتهاب2)$/i;
export default handler;