import fetch from 'node-fetch';
import cheerio from 'cheerio';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

const handler = async (m, { conn, args, command, text }) => {
  const username = text?.trim();
  if (!username) return m.reply(`✦ أدخل معرف القناة مثل:\n.قناةيوتيوب @mrbeast`);

  await m.reply(`⌛ جاري البحث عن قناة ${username} ...`);

  const getYouTubeProfile = async (username) => {
    const res = await fetch(`https://m.youtube.com/${username.startsWith('@') ? username : '@' + username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const name = $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';
    const url = $('link[rel="canonical"]').attr('href') || '';
    const bannerMatch = html.match(/https:\/\/yt3\.googleusercontent\.com\/[^\s"']+?=w\d+-fcrop64=[^"']+/i);
    const banner = bannerMatch ? bannerMatch[0] : '';
    const subsMatch = html.match(/(\d[\d.,]*)\s+subscribers/i);
    let subscribers = subsMatch ? subsMatch[1] : null;

    if (!subscribers) {
      const altRes = await fetch(`https://www.youtube.com/${username.startsWith('@') ? username : '@' + username}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const altHtml = await altRes.text();
      const altMatch = altHtml.match(/"text"\s*:\s*\{\s*"content"\s*:\s*"(\d[\d.,]*[MK]?)\s*subscribers"/);
      subscribers = altMatch ? altMatch[1] : null;
    }

    const videoMatches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)];
    const videoSet = new Set();
    const videos = [];
    for (const match of videoMatches) {
      const videoId = match[1];
      if (!videoSet.has(videoId)) {
        videoSet.add(videoId);
        videos.push(`https://www.youtube.com/watch?v=${videoId}`);
        if (videos.length === 5) break;
      }
    }

    const idMatch = url.match(/\/channel\/(UC[\w-]+)/);
    const channelId = idMatch ? idMatch[1] : null;

    return {
      name, username, description, image, banner,
      subscribers, url, channelId, videos
    };
  };

  try {
    const data = await getYouTubeProfile(username);

    if (!data?.name) throw '❌ لم يتم العثور على القناة.';

    const message = `
📺 *الاسم:* ${data.name}
🔖 *المعرف:* ${username}
👥 *عدد المشتركين:* ${data.subscribers || 'غير معروف'}
🌐 *رابط القناة:* ${data.url}
🆔 *ID القناة:* ${data.channelId || 'غير متوفر'}
📝 *الوصف:* 
${data.description || 'لا يوجد وصف متاح'}

🎬 *أحدث الفيديوهات:*
${data.videos.map((v, i) => `*${i + 1}.* ${v}`).join('\n')}
`.trim();

    // صورة البروفايل + البيانات
    await conn.sendMessage(m.chat, {
      image: { url: data.image },
      caption: message,
      footer: `> ✦┇𝐌𝐈𝐊𝐄𝐘 |♕| 𝐁𝐎𝐓┇✦`
    }, { quoted: m });

    // البانر إن وُجد
    if (data.banner)
      await conn.sendMessage(m.chat, {
        image: { url: data.banner },
        caption: "🎨 *بانر القناة*"
      }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(`❌ لم يتم العثور على القناة أو حدث خطأ.`);
  }
};

handler.command = /^قناة_يوتيوب$/i;
handler.help = ['قناةيوتيوب @username'];
handler.tags = ['search'];

export default handler;